import {StyleSheet, Text, View, SafeAreaView} from 'react-native';
import React from 'react';
import {Buttonnavigation, Header, Days} from '../../components';

const Report = ({navigation}: {navigation: any}) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <Header
          text="
        Laporan"
        />
        <Days />
        <Text>Report</Text>
        <Buttonnavigation navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

export default Report;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
});
