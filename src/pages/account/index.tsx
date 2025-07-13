import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Alert,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Button, Buttonnavigation, Header, ProfileCard, ProfilePicture} from '../../components';
import {getAuth, signOut} from 'firebase/auth';
import {getDatabase, ref, onValue} from 'firebase/database';
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const db = getDatabase();
          const userRef = ref(db, `users/${user.uid}`);

          onValue(
            userRef,
            snapshot => {
              const data = snapshot.val();
              if (data) {
                setUserData(data);
                // Set profile image if available
                if (data.profilePictureBase64) {
                  setProfileImage(data.profilePictureBase64);
                }
              }
              setLoading(false);
            },
            error => {
              console.error('Error reading user data:', error);
              showMessage({
                message: 'Error',
                description: 'Failed to load user data',
                type: 'danger',
                duration: 3000,
              });
              setLoading(false);
            },
          );
        } else {
          // User not authenticated, redirect to login
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigation]);

  const handleImageUpdate = (base64Image: string) => {
    setProfileImage(base64Image);
    // The ProfilePicture component already saves to Firebase
    // We just update the local state for immediate UI feedback
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const auth = getAuth();
              await signOut(auth);
              
              showMessage({
                message: 'Logged Out',
                description: 'You have been successfully logged out',
                type: 'success',
                duration: 2000,
              });
              
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
              showMessage({
                message: 'Logout Error',
                description: 'Failed to logout. Please try again.',
                type: 'danger',
                duration: 3000,
              });
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View>
          <View>
            <Header text="Account" />
          </View>
          <View style={styles.profile}>
            <ProfilePicture
              currentImage={profileImage}
              userName={userData?.fullName || 'User'}
              onImageUpdate={handleImageUpdate}
            />
            <View style={styles.subprofile}>
              <Text style={styles.name}>
                {getFirstName(userData?.fullName || '')}
              </Text>
              <Text style={styles.email}>
                {userData?.email || 'No email available'}
              </Text>
            </View>
          </View>
          <View style={styles.card}>
            <ProfileCard 
              text="Department" 
              placeholder={userData?.department || 'Not specified'} 
            />
            <ProfileCard 
              text="NIP" 
              placeholder={userData?.NIP || 'Not specified'} 
            />
            <ProfileCard 
              text="Start Date" 
              placeholder={formatDate(userData?.startDate || '')} 
            />
          </View>
        </View>
        <Button text="Log Out" onPress={handleLogout} />
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
