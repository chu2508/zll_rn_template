import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';

import { CreateProjectScreen } from '../screens/project/CreateProjectScreen';
import { ProjectDetailScreen } from '../screens/project/ProjectDetailScreen';
import { TodoEditScreen } from '../screens/todo/TodoEditScreen';
import { MainNavigator } from './main';

import { PaywallScreen } from '@src/screens/paywall/PaywallScreen';
import { CreateLogScreen } from '@src/screens/project/CreateLogScreen';
import { DataExportScreen } from '@src/screens/sync/DataExportScreen';
import { DataSyncScreen } from '@src/screens/sync/DataSyncScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      initialRouteName="Main"
      screenOptions={{
        headerBackButtonDisplayMode: 'minimal',
      }}>
      <Stack.Screen
        name="Main"
        component={MainNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TodoEdit"
        component={TodoEditScreen}
        options={{
          headerTitle: t('navigation.root.todoEdit'),
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={{
          headerTitle: t('navigation.root.projectDetail'),
        }}
      />
      <Stack.Screen
        name="CreateProject"
        component={CreateProjectScreen}
        options={{
          headerTitle: t('navigation.root.createProject'),
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="CreateLog"
        component={CreateLogScreen}
        options={{
          headerTitle: t('navigation.root.createLog'),
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{
          headerTitle: t('navigation.root.paywall'),
        }}
      />
      <Stack.Screen
        name="DataSync"
        component={DataSyncScreen}
        options={{
          headerTitle: t('navigation.root.dataSync'),
        }}
      />
      <Stack.Screen
        name="DataExport"
        component={DataExportScreen}
        options={{
          headerTitle: t('navigation.root.dataExport'),
        }}
      />
    </Stack.Navigator>
  );
};
