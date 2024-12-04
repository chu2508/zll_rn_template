import { createStackNavigator } from '@react-navigation/stack';

import AssessmentScreen from '../screens/AssessmentScreen';

const Stack = createStackNavigator();

export const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Assessment" component={AssessmentScreen} />
    </Stack.Navigator>
  );
};
