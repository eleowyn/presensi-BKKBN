import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import {AccountIcon, HomeLogo, ActivityLogo, CameraLogo} from '../../atoms';

const Buttonnavigation = () => {
  return (
    <View>
      <TouchableOpacity>
        <AccountIcon />
      </TouchableOpacity>
      <TouchableOpacity>
        <HomeLogo />
      </TouchableOpacity>
      <TouchableOpacity>
        <ActivityLogo />
      </TouchableOpacity>
      <TouchableOpacity>
        <CameraLogo />
      </TouchableOpacity>
    </View>
  );
};

export default Buttonnavigation;

const styles = StyleSheet.create({});
