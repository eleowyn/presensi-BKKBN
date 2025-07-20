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
import {
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth'; // Perbaikan di sini
import {showMessage} from 'react-native-flash-message';
import {isAdminEmail} from '../../utils/adminUtils';

const SignIn = ({navigation}: {navigation: any}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

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

      if (isAdminEmail(email)) {
        navigation.replace('Dashboard');
      } else {
        navigation.replace('Home');
      }
    } catch (error: any) {
      let errorMessage = 'Login gagal. Silakan coba lagi.';

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

  const handleResetPassword = async () => {
    if (!email) {
      showMessage({
        message: 'Email diperlukan',
        description: 'Silakan masukkan email Anda untuk reset password',
        type: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);

      setResetEmailSent(true);
      showMessage({
        message: 'Email reset password terkirim',
        description: 'Silakan cek email Anda untuk instruksi reset password',
        type: 'success',
        duration: 5000,
      });
    } catch (error: any) {
      let errorMessage = 'Gagal mengirim email reset. Silakan coba lagi.';

      switch (error.code) {
        case 'auth/invalid-email':
          errorMessage = 'Format email tidak valid';
          break;
        case 'auth/user-not-found':
          errorMessage = 'Akun tidak ditemukan';
          break;
        default:
          errorMessage = 'Terjadi kesalahan. Silakan coba lagi';
      }

      showMessage({
        message: 'Error Reset Password',
        description: errorMessage,
        type: 'danger',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
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

            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={isLoading}>
              <Text
                style={[
                  styles.resetpassword,
                  isLoading && styles.disabledText,
                ]}>
                Reset Password?
              </Text>
            </TouchableOpacity>
          </View>

          {resetEmailSent && (
            <Text style={styles.resetSuccess}>
              Email reset password telah dikirim ke {email}
            </Text>
          )}

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
  disabledText: {
    color: '#CCCCCC', // Warna lebih terang saat disabled
  },
  resetSuccess: {
    color: 'green',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
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
