import { NavigationContainer } from '@react-navigation/native';
import NewRelic from 'newrelic-react-native-agent';
import React from 'react';

import { AppNavigator } from './src/navigation';

import { useInitApp } from '@src/hooks/useInitApp';

export default function App() {
  useInitApp();
  return (
    <NavigationContainer onStateChange={NewRelic.onStateChange}>
      <AppNavigator />
    </NavigationContainer>
  );
}
