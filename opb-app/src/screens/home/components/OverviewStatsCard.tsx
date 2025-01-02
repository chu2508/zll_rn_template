import RemixIcon from '@ui/icon/Remix';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { ProjectStatus } from '@src/orm/models/project';
import { useOverviewStore } from '@src/store/overview';
import { useResourceStore } from '@src/store/resource/resource';
import { useRootStore } from '@src/store/root';

export const OverviewStatsCard = () => {
  const { t } = useTranslation();
  const projects = useResourceStore(s => s.projects);
  const roiStats = useOverviewStore(s => s.roiStats);
  const currencySymbol = useRootStore(s => s.currencySymbol);
  const activeProjects = projects.filter(
    p => p.status !== ProjectStatus.ARCHIVED,
  );

  const styles1 = {
    color: roiStats.roiChange > 0 ? '#10B981' : '#EF4444',
  };
  const style2 = { marginLeft: 2 };

  return (
    <View className="mx-4 mb-4 rounded-lg bg-white p-4">
      <Text className="mb-3 text-base font-medium">
        {t('home.overview.title')}
      </Text>
      <View className="flex-row flex-wrap justify-between">
        {/* 项目指标 */}
        <View className="mb-4 w-1/3 items-center">
          <Text className="text-2xl font-bold">{projects.length}</Text>
          <Text className="text-xs text-gray-500">
            {t('home.overview.stats.totalProjects')}
          </Text>
        </View>
        <View className="mb-4 w-1/3 items-center">
          <Text className="text-2xl font-bold">{activeProjects.length}</Text>
          <Text className="text-xs text-gray-500">
            {t('home.overview.stats.activeProjects')}
          </Text>
        </View>

        {/* 工时投入 */}
        <View className="mb-4 w-1/3 items-center">
          <Text className="text-2xl font-bold">{roiStats.totalWorkHours}h</Text>
          <Text className="text-xs text-gray-500">
            {t('home.overview.stats.workHours')}
          </Text>
        </View>
        {/* 投入资金 */}
        <View className="w-1/3 items-center">
          <Text className="text-2xl font-bold">
            {currencySymbol}
            {roiStats.totalInvestment.toFixed(0)}
          </Text>
          <Text className="text-xs text-gray-500">
            {t('home.overview.stats.investment')}
          </Text>
        </View>

        {/* 产出收益 */}
        <View className="w-1/3 items-center">
          <Text
            className={`text-2xl font-bold ${
              roiStats.totalRevenue > roiStats.totalInvestment
                ? 'text-green-500'
                : 'text-red-500'
            }`}>
            {currencySymbol}
            {roiStats.totalRevenue.toFixed(0)}
          </Text>
          <Text className="text-xs text-gray-500">
            {t('home.overview.stats.revenue')}
          </Text>
        </View>
        {/* ROI */}
        <View className="mb-4 w-1/3 items-center">
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold" style={styles1}>
              {roiStats.roi.toFixed(1)}%
            </Text>
            {roiStats.roiChange !== 0 && (
              <RemixIcon
                name={
                  roiStats.roiChange > 0
                    ? 'arrow-up-s-line'
                    : 'arrow-down-s-line'
                }
                size={16}
                color={roiStats.roiChange > 0 ? '#10B981' : '#EF4444'}
                style={style2}
              />
            )}
          </View>
          <Text className="text-xs text-gray-500">
            {t('home.overview.stats.roi')}
          </Text>
        </View>
      </View>
    </View>
  );
};
