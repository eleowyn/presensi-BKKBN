import {StyleSheet, View} from 'react-native';
import React from 'react';
import {
  TextInput,
  Button,
  TextTitle,
  Buttonnavigation,
  Card,
} from '../../components/index';

const Login = () => {
  return (
    <View>
      <TextTitle />
      <TextInput />
      <Button />
      <Buttonnavigation />
      <Card/>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({});
