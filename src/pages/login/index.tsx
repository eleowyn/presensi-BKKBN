import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';
import Logo from '../../assets/Logo_Kementerian_Kependudukan_dan_Pembangunan_Keluarga_-_BKKBN_(2024)_.svg';
import Checkbox from '../../assets/Checkbox Field.svg';
import {Button, TextInput, TextTitle} from '../../components';

const SignIn = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Logo style={styles.logo} />
      <Text style={styles.title}>Welcome Back</Text>
      <View style={styles.inputContainer}>
        <TextTitle text="Email Address" />
        <TextInput placeholder="Your Email Address" />
        <TextTitle text="Password" />
        <TextInput placeholder="**********" secureTextEntry={true} />
        <View style={styles.termsContainer}>
          <Checkbox />
          <Text style={styles.terms}>Remember Me</Text>
        </View>
        <TouchableOpacity>
          <Text style={styles.resetpassword}>Reset Password?</Text>
        </TouchableOpacity>

        <Button text="Log In" onPress={() => navigation.navigate('Home')} />
        <View style={styles.loginContainer}>
          <Text style={styles.account}>Doesn't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.login}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  logo: {
    marginTop: 96,
    alignSelf: 'center',
  },
  resetpassword: {
    color: '#6D6D6D',
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    alignSelf: 'flex-end',
    marginRight: 40,
    textDecorationLine: 'underline',
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
