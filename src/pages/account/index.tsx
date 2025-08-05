import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  Button,
  Buttonnavigation,
  Header,
  ProfileCard,
  ProfilePicture,
} from '../../components';
import {getAuth, signOut} from 'firebase/auth';
import {getDatabase, ref, onValue, off} from 'firebase/database';
import {showMessage} from 'react-native-flash-message';
import {formatDate, getFirstName} from '../../config/Firebase/utils';

interface UserData {
  fullName?: string;
  email?: string;
  department?: string;
  NIP?: string;
  startDate?: string;
  profilePictureBase64?: string;
}

const Account = ({navigation}: {navigation: any}) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          console.log('No authenticated user found');
          navigation.replace('Login');
          return;
        }

        console.log('Fetching data for user:', user.uid);

        const db = getDatabase();
        const userRef = ref(db, `users/${user.uid}`);

        // Set up real-time listener
        const listener = onValue(
          userRef,
          snapshot => {
            console.log('Snapshot received:', snapshot.exists());

            if (snapshot.exists()) {
              const data = snapshot.val();
              console.log('User data:', data);

              setUserData(data);

              // Set profile image if available
              if (data.profilePictureBase64) {
                setProfileImage(data.profilePictureBase64);
              }

              setError(null);
            } else {
              console.log('No user data found, using auth data as fallback');

              // If no user data in database, create basic profile from auth
              const fallbackData: UserData = {
                fullName: user.displayName || 'Tidak diketahui',
                email: user.email || 'Tidak diketahui',
                department: 'Tidak diketahui',
                NIP: 'Tidak diketahui',
                startDate: new Date().toISOString(),
              };

              setUserData(fallbackData);
              setError('Profile data not found. Please complete your profile.');
            }

            setLoading(false);
          },
          error => {
            console.error('Firebase error:', error);

            let errorMessage = 'Failed to load user data';

            if (error.code === 'PERMISSION_DENIED') {
              errorMessage =
                'Permission denied. Please check your Firebase security rules.';
            } else if (error.code === 'NETWORK_ERROR') {
              errorMessage = 'Eror jaringan. Periksa kembali jaringan anda.';
            }

            setError(errorMessage);
            setLoading(false);

            showMessage({
              message: 'Database Error',
              description: errorMessage,
              type: 'danger',
              duration: 5000,
            });
          },
        );

        // Store the unsubscribe function
        unsubscribe = () => off(userRef, 'value', listener);
      } catch (error) {
        console.error('Setup error:', error);
        setError('Failed to initialize user data');
        setLoading(false);
      }
    };

    fetchUserData();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [navigation]);

  const handleImageUpdate = (base64Image: string) => {
    setProfileImage(base64Image);
    // The ProfilePicture component already saves to Firebase
    // We just update the local state for immediate UI feedback
  };

  const handleLogout = () => {
    Alert.alert('Keluar', 'Anda yakin ingin keluar?', [
      {
        text: 'Batal',
        style: 'cancel',
      },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          try {
            const auth = getAuth();
            await signOut(auth);

            showMessage({
              message: 'Telah Keluar',
              description: 'Anda berhasil keluar.',
              type: 'success',
              duration: 2000,
            });

            console.log(
              `This app was created by Elshera A. E. Dahlan & Lana L. L. Londah`,
            );
            navigation.replace('Login');
          } catch (error) {
            console.error('Logout error:', error);
            showMessage({
              message: 'Kesalahan keluar',
              description: 'Gagal, coba lagi.',
              type: 'danger',
              duration: 3000,
            });
          }
        },
      },
    ]);
  };

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Re-trigger the useEffect by updating a state
    // This will re-run the data fetching logic
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading user data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && !userData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to Load Profile</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button text="Coba lagi" onPress={handleRetry} />
          <Button text="Keluar" onPress={handleLogout} />
          {/* This app was created by Eishera A. E. Dahlan & L@na L. L. L0ondah */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View>
          <View>
            <Header text="Akun" />
          </View>

          {error && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>{error}</Text>
            </View>
          )}

          <View style={styles.profile}>
            <ProfilePicture
              currentImage={profileImage}
              userName={userData?.fullName || 'User'}
              onImageUpdate={handleImageUpdate}
            />
            <View style={styles.subprofile}>
              <Text style={styles.name}>
                {getFirstName(userData?.fullName || 'User')}
              </Text>
              <Text style={styles.email}>
                {userData?.email || 'Tidak ada email'}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <ProfileCard
              text="Departemen"
              placeholder={userData?.department || 'Tidak tercantum'}
            />
            <ProfileCard
              text="NIP"
              placeholder={userData?.NIP || 'Not specified'}
            />
            <ProfileCard
              text="Tanggal Mulai"
              placeholder={formatDate(userData?.startDate || '')}
            />
          </View>
        </View>
        <Button text="Keluar" onPress={handleLogout} />
      </ScrollView>
      <View style={{marginBottom: 150}}></View>
      <Buttonnavigation navigation={navigation} />
    </SafeAreaView>
  );
};

export default Account;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#666',
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#d32f2f',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
    padding: 10,
    margin: 20,
    borderRadius: 5,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
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
