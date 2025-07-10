import { ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Header, profileCard } from '../../components';

const Account = () => {
  return (
    <ScrollView>
        <View>
            <View>
                <Header text = 'Account'/>
            </View>
            <View style={styles.profile}>
              <View style={styles.imageBox} />
              <View style={styles.subprofile}>
                <Text style={styles.name}>elshera</Text>
                <Text style={styles.email}>elshera.dahlan@gmail.com</Text>
              </View>
            </View>
        </View>
    </ScrollView>
  );
};

export default Account;

const styles = StyleSheet.create({
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
});