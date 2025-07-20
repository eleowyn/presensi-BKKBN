import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {AccountIcon, HomeLogo, ActivityLogo, CameraLogo} from '../../atoms';

const Buttonnavigation = ({navigation}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}>
        <View style={styles.iconContainer}>
          <HomeLogo style={styles.icon} />
        </View>
        <Text style={styles.text}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Scan')}>
        <View style={styles.iconContainer}>
          <CameraLogo style={styles.icon} />
        </View>
        <Text style={styles.text}>Scan</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Activity')}>
        <View style={styles.iconContainer}>
          <ActivityLogo style={styles.icon} />
        </View>
        <Text style={styles.text}>History</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Account')}>
        <View style={styles.iconContainer}>
          <AccountIcon style={styles.icon} />
        </View>
        <Text style={styles.text}>Account</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Buttonnavigation;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 100,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEDEDE',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '25%',
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  text: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 10,
    textAlign: 'center',
  },
});
