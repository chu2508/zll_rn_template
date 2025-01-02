import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import RemixIcon from '@ui/icon/Remix';
import dayjs from 'dayjs';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { LogList } from './components/LogList';

import { StatusBadge } from '@src/components/common/StatusBadge';
import { showToast } from '@src/components/common/Toast';
import { TodoList } from '@src/components/todo/TodoList';
import { RootRouterParams } from '@src/navigation/types';
import { LogSource } from '@src/orm/models/log';
import { LogRepository } from '@src/orm/models/log.repo';
import { ProjectRepository } from '@src/orm/models/porject.repo';
import { Todo, TodoPriority, TodoStatus } from '@src/orm/models/todo';
import { TodoRepository } from '@src/orm/models/todo.repo';
import { useResourceStore } from '@src/store/resource/resource';
import { useRootStore } from '@src/store/root';

type Props = StackScreenProps<RootRouterParams, 'ProjectDetail'>;

// Tab 组件
const TabBar = ({
  activeTab,
  onTabPress,
}: {
  activeTab: 'todos' | 'logs';
  onTabPress: (tab: 'todos' | 'logs') => void;
}) => {
  const { t } = useTranslation();
  return (
    <View className="flex-row border-b border-gray-200 bg-white px-4">
      <TouchableOpacity
        className={`mr-6 border-b-2 py-3 ${
          activeTab === 'todos' ? 'border-blue-500' : 'border-transparent'
        }`}
        onPress={() => onTabPress('todos')}>
        <Text
          className={`${
            activeTab === 'todos' ? 'text-blue-500' : 'text-gray-600'
          }`}>
          {t('project.detail.tabs.todos')}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`mr-6 border-b-2 py-3 ${
          activeTab === 'logs' ? 'border-blue-500' : 'border-transparent'
        }`}
        onPress={() => onTabPress('logs')}>
        <Text
          className={`${
            activeTab === 'logs' ? 'text-blue-500' : 'text-gray-600'
          }`}>
          {t('project.detail.tabs.logs')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export function ProjectDetailScreen() {
  const [activeTab, setActiveTab] = useState<'todos' | 'logs'>('todos');
  const route = useRoute<Props['route']>();
  const navigation = useNavigation<Props['navigation']>();
  const { projectId } = route.params;
  const project = useResourceStore(s => s.getProjectById(projectId));
  const currencySymbol = useRootStore(s => s.currencySymbol);
  const [todos, setTodos] = useState<Todo[]>([]);
  const { t } = useTranslation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate('CreateProject', {
              projectId,
            });
          }}
          className="mr-4">
          <RemixIcon name="edit-line" size={20} color="#6B7280" />
        </TouchableOpacity>
      ),
    });
  }, [navigation, projectId]);

  // 加载待办事项
  const loadTodos = useCallback(() => {
    TodoRepository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    }).then(setTodos);
  }, [projectId]);

  useFocusEffect(loadTodos);

  // 在页面加载和切换标签时加载待办事项
  useEffect(() => {
    if (activeTab === 'todos') {
      loadTodos();
    }
  }, [activeTab, loadTodos]);

  // 切换待办事项状态
  const handleToggleTodoStatus = async (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    // 如果是标记为完成，弹出工时确认框
    if (todo.status === TodoStatus.TODO) {
      Alert.alert(
        t('project.detail.todo.complete.title'),
        t('project.detail.todo.complete.message'),
        [
          {
            text: t('project.detail.todo.complete.skip'),
            style: 'cancel',
            onPress: async () => {
              await updateTodoStatus(todo, TodoStatus.DONE);
            },
          },
          {
            text: t('project.detail.todo.complete.record'),
            onPress: () => {
              Alert.prompt(
                t('project.detail.todo.complete.hours.title'),
                t('project.detail.todo.complete.hours.message'),
                [
                  {
                    text: t('project.detail.todo.complete.hours.cancel'),
                    style: 'cancel',
                  },
                  {
                    text: t('project.detail.todo.complete.hours.confirm'),
                    onPress: async hours => {
                      const workHours = parseFloat(hours!);
                      if (isNaN(workHours) || workHours <= 0) {
                        showToast(
                          t('project.detail.todo.complete.hours.invalid'),
                        );
                        return;
                      }
                      await updateTodoStatus(todo, TodoStatus.DONE);
                      await createWorkLog(todo, workHours);
                    },
                  },
                ],
                'plain-text',
                '',
                'numeric',
              );
            },
          },
        ],
        { cancelable: false },
      );
    } else {
      // 如果是标记为未完成，直接更新状态
      await updateTodoStatus(todo, TodoStatus.TODO);
    }
  };

  // 更新待办状态
  const updateTodoStatus = async (todo: Todo, status: TodoStatus) => {
    try {
      await TodoRepository.update(todo.id, {
        status,
        completedAt: status === TodoStatus.DONE ? new Date() : null,
      });
      await loadTodos();
    } catch (error) {
      console.error('更新待办状态失败:', error);
      showToast('更新待办状态失败');
    }
  };

  // 创建工时记录
  const createWorkLog = async (todo: Todo, workHours: number) => {
    try {
      const log = LogRepository.create({
        workHours,
        source: LogSource.TODO,
        sourceId: todo.id,
        remark: `完成待办事项：${todo.content}`,
      });
      await LogRepository.save(log);
      project!.logs = [...(project!.logs || []), log];
      await ProjectRepository.save(project!);
      // 刷新项目数据以更新统计
      await useResourceStore.getState().initProjects();
    } catch (error) {
      console.error('创建工时记录失败:', error);
      showToast('创建工时记录失败');
    }
  };

  // 添加待办事项
  const handleAddTodo = async (content: string) => {
    try {
      const todo = TodoRepository.create({
        content,
        priority: TodoPriority.NORMAL, // 默认普通优先级
        status: TodoStatus.TODO,
        projectId,
      });
      await TodoRepository.save(todo);
      await loadTodos(); // 重新加载待办事项
    } catch (error) {
      console.error('添加待办失败:', error);
      showToast('添加待办失败');
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    const todo = todos.find(t => t.id === todoId);
    if (!todo) return;

    Alert.alert(
      t('project.detail.todo.delete.title'),
      t('project.detail.todo.delete.message', { content: todo.content }),
      [
        {
          text: t('project.detail.todo.delete.cancel'),
          style: 'cancel',
        },
        {
          text: t('project.detail.todo.delete.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await TodoRepository.delete(todoId);
              await loadTodos();
              showToast(t('project.detail.todo.delete.success'));
            } catch (error) {
              console.error('删除失败:', error);
              showToast(t('project.detail.todo.delete.error'));
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  if (!project) {
    return <Text>{t('project.detail.notFound')}</Text>;
  }

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

  return (
    <View className="flex-1">
      {/* 项目基本信息 */}
      <View className="bg-white p-4">
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-xl font-bold">{project?.name}</Text>
          <StatusBadge status={project.status} />
        </View>

        {/* 项目数据概览 */}
        <View className="mb-4 flex-row justify-between rounded-lg bg-gray-50 p-4">
          <View className="flex-1 items-center">
            <Text className="text-sm text-gray-500">
              {t('project.detail.overview.workHours')}
            </Text>
            <Text className="mt-1 text-lg font-medium">
              {overview.workHours}
              {t('project.detail.overview.hoursUnit')}
            </Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-sm text-gray-500">
              {t('project.detail.overview.investment')}
            </Text>
            <Text className="mt-1 text-lg font-medium">
              {currencySymbol}
              {overview.investment}
            </Text>
          </View>
          <View className="flex-1 items-center">
            <Text className="text-sm text-gray-500">
              {t('project.detail.overview.revenue')}
            </Text>
            <Text className="mt-1 text-lg font-medium text-green-500">
              {currencySymbol}
              {overview.revenue}
            </Text>
          </View>
        </View>

        {/* 项目基本信息 */}
        <View className="space-y-2">
          <View className="flex-row">
            <Text className="text-sm text-gray-500">
              {t('project.detail.info.targetAmount')}：
            </Text>
            <Text className="text-sm">
              {currencySymbol}
              {project?.targetAmount}
            </Text>
          </View>
          <View className="flex-row">
            <Text className="text-sm text-gray-500">
              {t('project.detail.info.createdAt')}：
            </Text>
            <Text className="text-sm">
              {dayjs(project?.createdAt).format(t('timeFormat.date'))}
            </Text>
          </View>
          <View className="flex-row">
            <Text className="text-sm text-gray-500">
              {t('project.detail.info.lastUpdated')}：
            </Text>
            <Text className="text-sm">
              {dayjs(project?.updatedAt).format(t('timeFormat.dateTime'))}
            </Text>
          </View>
          {project?.description && (
            <View>
              <Text className="mb-1 text-sm text-gray-500">
                {t('project.detail.info.description')}：
              </Text>
              <Text className="text-sm">{project.description}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 标签页导航 */}
      <TabBar activeTab={activeTab} onTabPress={setActiveTab} />

      {/* 内容区域 */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {activeTab === 'todos' && (
          <View className="mx-4 mt-4">
            <TodoList
              todos={todos}
              onToggleStatus={handleToggleTodoStatus}
              onAddTodo={handleAddTodo}
              onEditPress={todo =>
                navigation.navigate('TodoEdit', { todoId: todo.id })
              }
              onDeletePress={handleDeleteTodo}
            />
          </View>
        )}
        {activeTab === 'logs' && <LogList logs={project.logs || []} />}
      </ScrollView>

      {/* 添加按钮 */}
      {activeTab === 'logs' && (
        <TouchableOpacity
          className="absolute bottom-6 right-6 h-12 w-12 items-center justify-center rounded-full bg-blue-500 shadow-lg"
          onPress={() => {
            navigation.navigate('CreateLog', { projectId });
          }}>
          <RemixIcon name="add-line" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}
