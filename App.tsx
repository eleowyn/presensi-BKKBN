import {View} from 'react-native';
import React from 'react';
import {SplashScreen, Login, SignIn, Account} from './src/pages';

const App = () => {
  return (
    <View>
      {/* <SplashScreen />
      <Login />
      <SignIn/> */}
      <Account/>
    </View>
  );
};

export default App;
