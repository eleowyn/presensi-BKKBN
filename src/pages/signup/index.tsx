import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useState} from 'react';
import {ChevronDown} from 'react-native-feather';
import Logo from '../../assets/Logo_Kementerian_Kependudukan_dan_Pembangunan_Keluarga_-_BKKBN_(2024)_.svg';
import Checkbox from '../../assets/Checkbox Field.svg';
import {Button, TextInput, TextTitle} from '../../components';
import {getAuth, createUserWithEmailAndPassword} from 'firebase/auth';
import {getDatabase, ref, set} from 'firebase/database';
import {showMessage} from 'react-native-flash-message';
import {createUserProfile} from '../../config/Firebase/utils';

const departments = [
  'PERENCANAAN DAN MANAJEMEN KINERJA',
  'KEUANGAN DAN ANGGARAN',
  'HUKUM, KEPEGAWAIAN DAN PELAYANAN PUBLIK',
  'PENGEMBANGAN SDM',
  'UMUM DAN PENGELOLAAN ΒΜΝ',
  'ADVOKASI, KIE, KEHUMASAN, HUBUNGAN ANTAR LEMBAGA DAN INFORMASI PUBLIK',
  'PELAPORAN, STATISTIK, DAN PENGELOLAAN TIK',
  'KELUARGA BERENCANA DAN KESEHATAN REPRODUKSI',
  'PENGENDALIAN PENDUDUK',
  'PENGELOLAAN DAN PEMBINAAN LINI LAPANGAN',
  'KEBIJAKAN STRATEGI, PPS, GENTING, DAN MBG',
  'KETAHANAN KELUARGA BALITA, ANAK, DAN REMAJA',
  'KETAHANAN KELUARGA LANSIA DAN PEMBERDAYAAN EKONOMI KELUARGA',
  'ZI WBK/WBBM DAN SPIP',
];

const SignUp = ({navigation}) => {
  const [department, setDepartment] = useState('');
  const [email, setEmail] = useState('');
  const [NIP, setNIP] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isAgreed, setIsAgreed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

  const selectDepartment = dept => {
    setDepartment(dept);
    setShowDepartmentDropdown(false);
  };

  const handleSignUp = async () => {
    if (!isAgreed) {
      showMessage({
        message: 'Terms Required',
        description: 'You must agree to the terms and conditions',
        type: 'danger',
        icon: 'danger',
        duration: 3000,
      });
      return;
    }

    if (!email || !password || !fullName || !NIP || !department) {
      showMessage({
        message: 'Incomplete Form',
        type: 'warning',
        icon: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Buat user di Firebase Authentication
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // 2. Simpan data tambahan user di Realtime Database
      const db = getDatabase();
      const userProfileData = createUserProfile(userCredential, {
        department,
        NIP,
        fullName,
        email,
      });

      await set(ref(db, `users/${userCredential.user.uid}`), userProfileData);

      // Tampilkan pesan sukses
      showMessage({
        message: 'Registration Successful',
        description: 'Your account has been created successfully',
        type: 'success',
        icon: 'none',
        duration: 3000,
      });
      console.log(
        `This app was created by Elshera A. E. Dahlan & Lana L. L. Londah`,
      );

      // 3. Navigasi ke halaman Dashboard setelah sukses
      navigation.replace('Login');
    } catch (error) {
      let errorMessage = 'Sign up failed. Please try again.';

      // Handle error spesifik dari Firebase
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      }

      showMessage({
        message: 'Registration Error',
        description: errorMessage,
        type: 'danger',
        icon: 'danger',
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        <Logo style={styles.logo} />
        <Text style={styles.title}>Let's Get Started</Text>
        <View style={styles.inputContainer}>
          <TextTitle text="Your Department" />
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowDepartmentDropdown(true)}>
            <Text
              style={
                department ? styles.dropdownText : styles.dropdownPlaceholder
              }>
              {department || 'Pilih department Anda'}
            </Text>
            <ChevronDown stroke="#666" width={20} height={20} />
          </TouchableOpacity>

          <Modal
            visible={showDepartmentDropdown}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowDepartmentDropdown(false)}>
            <TouchableWithoutFeedback
              onPress={() => setShowDepartmentDropdown(false)}>
              <View style={styles.modalOverlay} />
            </TouchableWithoutFeedback>

            <View style={styles.dropdownModal}>
              <ScrollView>
                {departments.map((dept, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownItem}
                    onPress={() => selectDepartment(dept)}>
                    <Text style={styles.dropdownItemText}>{dept}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Modal>

          <TextTitle text="Your NIP" />
          <TextInput
            placeholder="NIP"
            value={NIP}
            onChangeText={setNIP}
            keyboardType="numeric"
          />
          {/* This app was created by Eishera A. E. Dahlan & L@na L. L. L0ondah */}
          <TextTitle text="Your Email Address" />
          <TextInput
            placeholder="Email Address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextTitle text="Your Full Name" />
          <TextInput
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />
          <TextTitle text="Create a Password" />
          <TextInput
            placeholder="Password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
          <Button
            text={isLoading ? 'Processing...' : 'Sign Up'}
            onPress={handleSignUp}
            disabled={isLoading}
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
    color: '#0066CC',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
    width: 345,
    height: 60,
  },
  dropdownText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#000',
  },
  dropdownPlaceholder: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  dropdownModal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '50%',
    paddingTop: 10,
  },
  dropdownItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dropdownItemText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
});
