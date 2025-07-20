import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import Logo from '../../assets/Logo_Kementerian_Kependudukan_dan_Pembangunan_Keluarga_-_BKKBN_(2024)_.svg';
import Checkbox from '../../assets/Checkbox Field.svg';
import {
  Button,
  TextInput,
  TextTitle,
  TextSubtitle,
} from '../../components/atoms';
import {getAuth, signInWithEmailAndPassword} from 'firebase/auth';
import {showMessage} from 'react-native-flash-message';
import {isAdminEmail} from '../../utils/adminUtils';
//making login

const SignIn = ({navigation}: {navigation: any}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      showMessage({
        message: 'Form Tidak Lengkap',
        description: 'Email dan password harus diisi',
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);

      showMessage({
        message: 'Login Berhasil',
        type: 'success',
        duration: 3000,
      });

      // Check if the logged-in user is admin
      console.log('Login email:', email);
      console.log('Admin check result:', isAdminEmail(email));
      console.log(
        'Direct comparison:',
        email.toLowerCase() === 'bkkbnsulutadmin@gmail.com',
      );

      if (isAdminEmail(email)) {
        // Admin user - redirect to Dashboard (admin page)
        console.log('Redirecting to Dashboard');
        navigation.replace('Dashboard');
      } else {
        // Regular user - redirect to Home
        console.log('Redirecting to Home');
        navigation.replace('Home');
      }
    } catch (error: any) {
      let errorMessage = 'Login gagal. Silakan coba lagi.';

      // Handle error spesifik dari Firebase
      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Format email tidak valid';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Akun ini dinonaktifkan';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Akun tidak ditemukan';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Password salah';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Terlalu banyak percobaan gagal. Coba lagi nanti';
          break;
        default:
          errorMessage = 'Terjadi kesalahan. Silakan coba lagi';
      }

      showMessage({
        message: 'Error Login',
        description: errorMessage,
        type: 'danger',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = () => {
    // Implementasi reset password bisa ditambahkan di sini
    navigation.navigate('ResetPassword');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Logo style={styles.logo} />
        <Text style={styles.title}>Welcome Back</Text>
        <View style={styles.inputContainer}>
          <TextTitle text="Email Address" />
          <TextInput
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextTitle text="Password" />
          <TextInput
            placeholder="Password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.rememberContainer}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setRememberMe(!rememberMe)}>
              <Checkbox fill={rememberMe ? '#000' : 'none'} />
              <Text style={styles.terms}>Remember Me</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleResetPassword}>
              <Text style={styles.resetpassword}>Reset Password?</Text>
            </TouchableOpacity>
          </View>

          <Button
            text={isLoading ? 'Processing...' : 'Log In'}
            onPress={handleLogin}
            disabled={isLoading}
          />

          <View style={styles.signupContainer}>
            <Text style={styles.account}>Doesn't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signup}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingBottom: 30,
  },
  logo: {
    marginTop: 96,
    alignSelf: 'center',
  },
  resetpassword: {
    color: '#6D6D6D',
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
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

    paddingHorizontal: 20,
  },
  terms: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    marginLeft: 8,
    color: '#000',
  },
  rememberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 27,
    marginHorizontal: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
    marginVertical: 30,
  },
  account: {
    fontFamily: 'Poppins-Medium',
    fontSize: 11,
    color: '#6D6D6D',
  },
  signup: {
    fontFamily: 'Poppins-Bold',
    fontSize: 11,
    marginLeft: 5,
    color: '#0066CC',
  },
});
