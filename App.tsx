import {View} from 'react-native';
import React from 'react';
import {SplashScreen, Login, SignIn, Account, DashboardAdmin} from './src/pages';

const App = () => {
  return (
    <View>
      {/* <SplashScreen />
      <Login />
      <SignIn/>
      <Account/> */}
      <DashboardAdmin/>
    </View>
  );
};

export default App;
