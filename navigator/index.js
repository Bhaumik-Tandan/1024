import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import PAGES from '../constants/pages';
import DropNumberBoard from '../components/DropNumberBoard';
import { NavigationContainer } from '@react-navigation/native';

const Stack = createNativeStackNavigator();
const RootNavigator = (
    <NavigationContainer>
    <Stack.Navigator>
        <Stack.Group>
            <Stack.Screen
                name={PAGES.DROP_NUMBER_BOARD}
                options={{
                    headerShown: false,
                }}
                component={DropNumberBoard}
            />
        </Stack.Group>
    </Stack.Navigator>
    </NavigationContainer>
);

export default RootNavigator;
