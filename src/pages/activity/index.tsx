import {StyleSheet, View, SafeAreaView} from 'react-native';
import React from 'react';
import {Buttonnavigation, Card, Header} from '../../components';

const Activity = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
      <Header text="Riwayat" />
      <Card navigation={navigation} />
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
