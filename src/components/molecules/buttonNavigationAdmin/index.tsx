import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import { HomeLogo, ActivityLogo } from '../../atoms';

const ButtonNavAdmin = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.home}>
        <HomeLogo />
        <Text style={styles.text}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.activity}>
        <ActivityLogo />
        <Text style={styles.text}>History</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ButtonNavAdmin;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,

    width: '100%',
    paddingVertical: 25,

    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    borderWidth: 1,
    borderColor: '#DEDEDE',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  home: {},
  activity: {},
  text: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
  },
});
