import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ButtonNavAdmin } from '../../components';

const DashboardAdmin = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Dashboard Admin</Text>
          {/* Add more content here if needed */}
        </ScrollView>
        <ButtonNavAdmin />
      </View>
    </SafeAreaView>
  );
};

export default DashboardAdmin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
