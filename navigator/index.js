import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import PAGES from '../constants/pages';
import HomeScreen from '../screens/HomeScreen';
import AboutScreen from '../screens/AboutScreen';

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={PAGES.HOME}>
        <Stack.Screen
          name={PAGES.HOME}
          component={HomeScreen}
          options={{ title: 'Home' }}
        />
        <Stack.Screen
          name={PAGES.ABOUT}
          component={AboutScreen}
          options={{ title: 'About' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
