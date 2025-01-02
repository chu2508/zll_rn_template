import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import RemixIcon from '@ui/icon/Remix';
import { useTranslation } from 'react-i18next';

import { HomeScreen } from '@src/screens/home/HomeScreen';
import { ProfileScreen } from '@src/screens/profile/ProfileScreen';
import { ResourceListScreen } from '@src/screens/resource/ResourceList';

const Tab = createBottomTabNavigator();

export function MainNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('navigation.tabs.home'),
          tabBarIcon: ({ color, size }) => (
            <RemixIcon name="home-4-line" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Resource"
        component={ResourceListScreen}
        options={{
          title: t('navigation.tabs.resource'),
          tabBarIcon: ({ color, size }) => (
            <RemixIcon name="apps-2-line" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('navigation.tabs.profile'),
          tabBarIcon: ({ color, size }) => (
            <RemixIcon name="user-smile-line" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
