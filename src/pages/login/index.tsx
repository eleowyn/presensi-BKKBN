import {StyleSheet, ScrollView} from 'react-native';
import React from 'react';
import {
  TextInput,
  Button,
  Buttonnavigation,
  Card,
  WeeklyChart,
  OverallChart,
  TextTitle,
} from '../../components/index';

const Login = () => {
  return (
    <ScrollView>
      <TextTitle />
      <TextInput />
      <Button />
      <Buttonnavigation />
      <Card />
      <WeeklyChart />
      <OverallChart />
    </ScrollView>
  );
};

export default Login;

const styles = StyleSheet.create({});
