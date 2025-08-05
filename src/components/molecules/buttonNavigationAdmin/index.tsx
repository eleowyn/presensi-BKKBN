import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import {HomeLogo, ActivityLogo} from '../../atoms';

const ButtonNavAdmin = ({navigation}) => {
  console.log('navigation prop:', navigation);

  return (
    <View style={styles.navBar}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Dashboard')}>
        <HomeLogo />
        <Text style={styles.label}>Beranda</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => navigation.navigate('Lists')}>
        <ActivityLogo />
        <Text style={styles.label}>Daftar</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ButtonNavAdmin;

const styles = StyleSheet.create({
  navBar: {
    position: 'absolute',
    bottom: 1,
    width: '100%',
    paddingVertical: 20,

    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',

    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#DEDEDE',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  navItem: {
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    marginTop: 4,
  },
});
