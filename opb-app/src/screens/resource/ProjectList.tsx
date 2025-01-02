import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import dayjs from 'dayjs';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TouchableOpacity, View } from 'react-native';

import { SearchBar } from './SearchBar';

import { CircleProgress } from '@src/components/common/CircleProgress';
import { EmptyView } from '@src/components/common/EmptyView';
import { StatusBadge } from '@src/components/common/StatusBadge';
import { RootRouterParams } from '@src/navigation/types';
import { ProjectStatus } from '@src/orm/models/project';
import { useResourceStore } from '@src/store/resource/resource';
import { useRootStore } from '@src/store/root';

type Props = StackNavigationProp<RootRouterParams>;

export type TodoItem = {
  id: string;
  content: string;
  completed: boolean;
};

type ProjectCardProps = {
  id: string;
  name: string;
  progress: number;
  lastUpdated: Date;
  workHours: number;
  investment: number;
  revenue: number;
  status: ProjectStatus;
  todos?: TodoItem[];
  targetAmount: number;
};

const StatItem = ({ count, label }: { count: number; label: string }) => {
  return (
    <View className="basis-1/3 items-center">
      <Text className="text-2xl font-bold">{count}</Text>
      <Text className="text-sm">{label}</Text>
    </View>
  );
};

const ProjectStats = (props: {
  total: number;
  active: number;
  archived: number;
}) => {
  const { t } = useTranslation();
  const { total, active, archived } = props;
  return (
    <View className="flex-row py-4">
      <StatItem count={total} label={t('resource.stats.totalProjects')} />
      <StatItem count={active} label={t('resource.stats.activeProjects')} />
      <StatItem count={archived} label={t('resource.stats.archivedProjects')} />
    </View>
  );
};

const ProjectCard = ({
  id,
  name,
  progress,
  lastUpdated,
  workHours,
  investment,
  revenue,
  status,
  targetAmount,
}: ProjectCardProps) => {
  const navigation = useNavigation<Props>();
  const currencySymbol = useRootStore(s => s.currencySymbol);
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      className="mx-4 mb-4 rounded-lg bg-white p-4"
      onPress={() => navigation.navigate('ProjectDetail', { projectId: id })}
      activeOpacity={0.7}>
      <View className="flex-row items-center">
        <View className="mr-4">
          <CircleProgress progress={progress} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text
              className="mr-2 flex-1 text-lg font-bold"
              numberOfLines={1}
              ellipsizeMode="tail">
              {name}
            </Text>
            <StatusBadge status={status} />
          </View>

          <Text className="mt-1 text-xs text-gray-500">
            {t('resource.project.lastUpdated')}:{' '}
            {dayjs(lastUpdated).format(t('timeFormat.dateTime'))}
          </Text>

          <View className="mt-2 flex-row justify-between">
            <View>
              <Text className="text-xs text-gray-500">
                {t('resource.project.workHours')}
              </Text>
              <Text className="text-sm font-medium">{workHours}h</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-500">
                {t('resource.project.investment')}
              </Text>
              <Text className="text-sm font-medium">
                {currencySymbol}
                {investment}
              </Text>
            </View>
            <View>
              <Text className="text-xs text-gray-500">
                {t('resource.project.revenue')}
              </Text>
              <Text className="text-sm font-medium">
                {currencySymbol}
                {revenue}
              </Text>
            </View>
            <View>
              <Text className="text-xs text-gray-500">
                {t('resource.project.targetAmount')}
              </Text>
              <Text className="text-sm font-medium">
                {currencySymbol}
                {targetAmount}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export function ProjectListView() {
  const [keyword, setKeyword] = useState('');
  const dataSource = useResourceStore(s => s.projects);
  const projects = dataSource.filter(project => project.name.includes(keyword));

  return (
    <>
      <SearchBar value={keyword} onChangeText={setKeyword} />
      <ProjectStats
        total={projects.length}
        active={
          projects.filter(p => p.status !== ProjectStatus.ARCHIVED).length
        }
        archived={
          projects.filter(p => p.status === ProjectStatus.ARCHIVED).length
        }
      />
      {projects.length === 0 ? (
        <EmptyView
          icon="folder-line"
          title="暂无项目"
          description="点击右下角按钮创建新项目"
        />
      ) : (
        projects.map(project => {
          const overview = project.logs.reduce<{
            workHours: number;
            investment: number;
            revenue: number;
          }>(
            (acc, log) => {
              acc.workHours += log.workHours || 0;
              acc.investment += log.investment || 0;
              acc.revenue += log.revenue || 0;
              return acc;
            },
            { workHours: 0, investment: 0, revenue: 0 },
          );
          const progress = +(
            (overview.revenue / project.targetAmount) *
            100
          ).toFixed(2);
          return (
            <ProjectCard
              key={project.id}
              id={project.id}
              progress={progress}
              lastUpdated={project.updatedAt}
              name={project.name}
              workHours={overview.workHours}
              investment={overview.investment}
              revenue={overview.revenue}
              status={project.status}
              targetAmount={project.targetAmount}
            />
          );
        })
      )}
    </>
  );
}
