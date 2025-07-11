import {View} from 'react-native';
import React from 'react';
import {SplashScreen, Login, SignIn, Account, Dashboard} from './src/pages';

const App = () => {
  return (
    <View>
      {/* <SplashScreen />
      <Login />
      <SignIn/> */}
      <Account/>
      {/* <Dashboard/> */}
    </View>
  );
};

export default App;
