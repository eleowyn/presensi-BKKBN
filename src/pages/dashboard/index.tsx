import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { ButtonNavAdmin, Header } from '../../components';
import Admincard from '../../components/molecules/adminCard';

const DashboardAdmin = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Header text="Admin"/>
          <View>
            <Admincard 
            status="Late"
            name = 'Elshera Dahlan'
            nip = '105022310036'
            department = 'IT Department'/>
            <Admincard 
            status="Present"
            name = 'Elshera Dahlan'
            nip = '105022310036'
            department = 'IT Department'/>
            <Admincard 
            status="Excused"
            name = 'Elshera Dahlan'
            nip = '105022310036'
            department = 'IT Department'/>
            <Admincard 
            status="Unexcused"
            name = 'Elshera Dahlan'
            nip = '105022310036'
            department = 'IT Department'/>
            <Admincard 
            status="Present"
            name = 'Elshera Dahlan'
            nip = '105022310036'
            department = 'IT Department'/>
          </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 130,
  },
});
