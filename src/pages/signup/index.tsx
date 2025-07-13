import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import Logo from '../../assets/Logo_Kementerian_Kependudukan_dan_Pembangunan_Keluarga_-_BKKBN_(2024)_.svg';
import Checkbox from '../../assets/Checkbox Field.svg';
import {Button, TextInput, TextTitle} from '../../components';

const SignUp = ({navigation}) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Logo style={styles.logo} />
        <Text style={styles.title}>Let's Get Started</Text>
        <View style={styles.inputContainer}>
          <TextTitle text="Your Department" />
          <TextInput placeholder="Select your department" />
          <TextTitle text="Your NIP" />
          <TextInput placeholder="1234567" />
          <TextTitle text="Your Email Address" />
          <TextInput placeholder="elshera.dahlann@gmail.com" />
          <TextTitle text="Your Full Name" />
          <TextInput placeholder="elshera dahlann" />
          <TextTitle text="Create a Password" />
          <TextInput placeholder="**********" secureTextEntry={true} />
          <View style={styles.termsContainer}>
            <Checkbox />
            <Text style={styles.terms}>I agree with terms</Text>
          </View>
          <Button
            text="Sign In"
            onPress={() => navigation.navigate('Dashboard')}
          />
          <View style={styles.loginContainer}>
            <Text style={styles.account}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.login}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  logo: {
    marginTop: 96,
    alignSelf: 'center',
  },
  title: {
    fontFamily: 'Poppins-Regular',
    fontSize: 24,
    alignSelf: 'center',
    marginTop: 30,
  },
  inputContainer: {
    marginTop: 60,
  },
  terms: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    marginLeft: 8,
  },
  termsContainer: {
    marginLeft: 35,
    marginTop: 8,
    flexDirection: 'row',
    marginBottom: 27,
  },
  loginContainer: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 15,
    marginVertical: 30,
  },
  account: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
  },
  login: {
    fontFamily: 'Poppins-Bold',
    fontSize: 11,
    marginLeft: 5,
  },
});
