import {View} from 'react-native';
import React from 'react';
import {SplashScreen, Login, SignIn} from './src/pages';

const App = () => {
  return (
    <View>
      {/* <SplashScreen />
      <Login /> */}
      <SignIn/>
    </View>
  );
};

export default App;
