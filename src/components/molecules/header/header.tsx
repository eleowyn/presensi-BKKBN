import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import Logo from '../../../assets/Logo_Kementerian_Kependudukan_dan_Pembangunan_Keluarga_-_BKKBN_(2024)_.svg';

const Header = ({ text = "isilah" }) => {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Logo width={44} height={44} />
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginLeft: 13,
    marginVertical: 22,
  },
  logoContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  text: {
    marginTop: 10,
    marginLeft: 10,
    fontSize: 24,
    fontFamily: 'Poppins-Medium',
  },
});
