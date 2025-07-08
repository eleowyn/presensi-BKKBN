import {StyleSheet, View} from 'react-native';
import React from 'react';
import Logo from '../../assets/Logo_Kementerian_Kependudukan_dan_Pembangunan_Keluarga_-_BKKBN_(2024)_.svg';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Logo style={styles.logo} />
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 125,
    height: 125,
  },
});
