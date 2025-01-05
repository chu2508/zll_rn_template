import { useNavigation } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { ProjectListView } from './ProjectList';
import { UserPoolListView } from './UserPoolList';

import {
  ActionItem,
  FloatingActionButton,
} from '@src/components/common/FloatingActionButton';
import { showToast } from '@src/components/common/Toast';
import { RootRouterParams } from '@src/navigation/types';
import { useResourceStore } from '@src/store/resource/resource';
import { useRootStore } from '@src/store/root';

type Props = StackScreenProps<RootRouterParams>;

export function ResourceListScreen() {
  const { t } = useTranslation();
  const [selectedIndex] = useState(0);
  const navigation = useNavigation<Props['navigation']>();

  // useLayoutEffect(() => {
  //   navigation.setOptions({
  //     headerTitle: () => {
  //       return (
  //         <View className="w-60">
  //           <SegmentedControl
  //             values={['项目', '用户池']}
  //             selectedIndex={selectedIndex}
  //             onChange={event => {
  //               setSelectedIndex(event.nativeEvent.selectedSegmentIndex);
  //             }}
  //           />
  //         </View>
  //       );
  //     },
  //   });
  // }, [navigation, selectedIndex]);

  // 项目相关的操作按钮配置
  const projectActions: ActionItem[] = [
    {
      icon: 'apps-2-add-line',
      label: t('resource.actions.addProject'),
      onPress: () => {
        const { hasReachedProjectLimit } = useRootStore.getState();
        const projectCount = useResourceStore.getState().projects.length;
        if (hasReachedProjectLimit(projectCount)) {
          showToast(t('subscription.project_limit_reached'));
          return;
        }
        navigation.navigate('CreateProject');
      },
    },
  ];
  const projects = useResourceStore(s => s.projects);

  if (projects.length > 0) {
    projectActions.push({
      icon: 'file-add-line',
      label: t('resource.actions.addLog'),
      onPress: () =>
        navigation.navigate('CreateLog', { projectId: projects[0].id }),
    });
  }

  // 用户池相关的操作按钮配置
  const userPoolActions: ActionItem[] = [
    {
      icon: 'user-add-line',
      label: t('resource.actions.addUser'),
      onPress: () => navigation.navigate('CreateUserPool'),
    },
  ];

  return (
    <View className="flex-1">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {selectedIndex === 0 ? <ProjectListView /> : <UserPoolListView />}
        <View className="h-20" />
      </ScrollView>

      {/* 使用新的 FloatingActionButton 组件 */}
      <FloatingActionButton
        actions={selectedIndex === 0 ? projectActions : userPoolActions}
      />
    </View>
  );
}
