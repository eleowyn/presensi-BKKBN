import React from 'react';
import {
  Account,
  Activity,
  Home,
  SignUp,
  SplashScreen,
  DashboardAdmin,
  Lists,
  UserDetail,
} from './src/pages';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FlashMessage from 'react-native-flash-message';

import './src/config/Firebase';
import SignIn from './src/pages/login';
import ScanTest from './src/pages/scan/test';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Login"
          component={SignIn}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
          options={{headerShown: false}}
        />

        <Stack.Screen
          name="SignUp"
          component={SignUp}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Home"
          component={Home}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Scan"
          component={ScanTest}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Activity"
          component={Activity}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Account"
          component={Account}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardAdmin}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="Lists"
          component={Lists}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="UserDetail"
          component={UserDetail}
          options={{headerShown: false}}
        />
      </Stack.Navigator>

      <FlashMessage position="top" />
    </NavigationContainer>
  );
};

export default App;
