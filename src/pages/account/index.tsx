import {ScrollView, StyleSheet, Text, View, SafeAreaView} from 'react-native';
import React from 'react';
import {Buttonnavigation, Header, ProfileCard} from '../../components';

const Account = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View>
          <View>
            <Header text="Account" />
          </View>
          <View style={styles.profile}>
            <View style={styles.imageBox} />
            <View style={styles.subprofile}>
              <Text style={styles.name}>elshera</Text>
              <Text style={styles.email}>elshera.dahlan@gmail.com</Text>
            </View>
          </View>
          <View style={styles.card}>
            <ProfileCard text="Department" placeholder="Ilmu Komputer" />
            <ProfileCard text="NIP" placeholder="12345575" />
            <ProfileCard text="Start Date" placeholder="7 july 2025" />
          </View>
        </View>
      </ScrollView>
      <View style={{marginBottom: 150}}></View>
      <Buttonnavigation />
    </SafeAreaView>
  );
};

export default Account;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFFF',
  },
  profile: {
    flexDirection: 'row',
    marginTop: 50,
    marginLeft: 30,
  },
  subprofile: {
    marginLeft: 16,
    justifyContent: 'center',
  },
  imageBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
  },
  email: {
    fontSize: 15,
    fontFamily: 'Poppins-Medium',
    color: 'gray',
  },
  card: {
    marginTop: 50,
  },
});