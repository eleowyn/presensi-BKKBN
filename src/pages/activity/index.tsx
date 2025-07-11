import {StyleSheet, Text, View, ScrollView, SafeAreaView} from 'react-native';
import React from 'react';
import {Buttonnavigation, Card} from '../../components';

const Activity = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Card
          status="Present"
          date="08 July 2025"
          location="BKKBN Sulut"
          time="07.30"
          keterangan=""
        />
        <Card
          status="Present"
          date="08 July 2025"
          location="BKKBN Sulut"
          time="07.30"
          keterangan=""
        />
      </ScrollView>
      <Buttonnavigation />
    </SafeAreaView>
  );
};

export default Activity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },
});
