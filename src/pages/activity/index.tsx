import {StyleSheet, View, ScrollView, SafeAreaView} from 'react-native';
import React from 'react';
import {Buttonnavigation, Card, Header} from '../../components';

const Activity = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Header text="History" />
        <Card
          status="Late"
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
        <Card
          status="Excused"
          date="08 July 2025"
          location="BKKBN Sulut"
          time="07.30"
          keterangan=""
        />
        <Card
          status="Unexcused"
          date="08 July 2025"
          location="BKKBN Sulut"
          time="07.30"
          keterangan=""
        />
      </ScrollView>
      <View style={{marginBottom: 150}}></View>
      <Buttonnavigation navigation={navigation} />
    </SafeAreaView>
  );
};

export default Activity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'white',
  },
});
