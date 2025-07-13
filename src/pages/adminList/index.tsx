import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { ButtonNavAdmin, Card, Header, TextInputAdmin } from '../../components';
import Admincard from '../../components/molecules/adminCard';

const Lists = () => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View>
          <Header text="Lists"/>
          <View style={styles.textinput}>
            <TextInputAdmin style={styles.textinput1} text="Choose department" placeholder="Search Name"/>
            <TextInputAdmin style={styles.textinput1}/>
          </View>
          <View>
            <Admincard/>
            <Admincard/>
            <Admincard/>
            <Admincard/>
          </View>
        </View>
      </ScrollView>
      <ButtonNavAdmin navigation={navigation} />
    </View>
  );
};

export default Lists;

const styles = StyleSheet.create({});