import {StyleSheet, View, Text, SafeAreaView} from 'react-native';
import React from 'react';

const Dashboard = ({navigation: _navigation}: {navigation: any}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Welcome to the admin panel</Text>
        <Text style={styles.info}>You are logged in as: bkkbnsulutadmin@gmail.com</Text>
      </View>
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: 20,
  },
  info: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0066CC',
    textAlign: 'center',
  },
});
