import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import PAGES from '../constants/pages';
import DropNumberBoard from '../screens/DropNumberBoard';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import GameTilesPreviewScreen from '../screens/SolarSystemPreviewScreen';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createNativeStackNavigator();

const RootNavigator = () => (
    <NavigationContainer>
        <Stack.Navigator initialRouteName={PAGES.DROP_NUMBER_BOARD}>
            <Stack.Group>
                <Stack.Screen
                    name={PAGES.HOME}
                    options={{
                        headerShown: false,
                    }}
                    component={HomeScreen}
                />
                <Stack.Screen
                    name={PAGES.DROP_NUMBER_BOARD}
                    options={{
                        headerShown: false,
                    }}
                    component={DropNumberBoard}
                />
                <Stack.Screen
                    name={PAGES.SETTINGS}
                    options={{
                        headerShown: false,
                    }}
                    component={SettingsScreen}
                />
                <Stack.Screen
                    name={PAGES.SOLAR_SYSTEM_PREVIEW}
                    options={{
                        headerShown: false,
                    }}
                    component={GameTilesPreviewScreen}
                />
            </Stack.Group>
        </Stack.Navigator>
    </NavigationContainer>
);

export default RootNavigator;
