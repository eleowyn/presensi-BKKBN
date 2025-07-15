import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput as RNTextInput,
  TouchableOpacity,
  Image,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import React, {useState} from 'react';
import {launchCamera} from 'react-native-image-picker';
import {showMessage} from 'react-native-flash-message';
import Geolocation from 'react-native-geolocation-service';

const ScanTest = ({navigation}: {navigation: any}) => {
  const [tanggal, setTanggal] = useState('');
  const [waktu, setWaktu] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'App needs access to your camera',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'App needs access to your location',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasCameraPermission = await requestCameraPermission();
    const hasLocationPermission = await requestLocationPermission();

    if (!hasCameraPermission) {
      showMessage({
        message: 'Camera permission denied',
        type: 'danger',
      });
      return;
    }

    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        cameraType: 'back',
      },
      response => {
        if (response.didCancel) {
          showMessage({
            message: 'User cancelled image picker',
            type: 'info',
          });
        } else if (response.errorCode) {
          showMessage({
            message: response.errorMessage || 'Image picker error',
            type: 'danger',
          });
        } else if (response.assets && response.assets[0].uri) {
          const uri = response.assets[0].uri;
          setPhotoUri(uri);

          // Set current date and time
          const now = new Date();
          const dateStr = `${now.getDate()}/${
            now.getMonth() + 1
          }/${now.getFullYear()}`;
          const timeStr = `${now.getHours()}.${now.getMinutes()}`;
          setTanggal(dateStr);
          setWaktu(timeStr);

          // Get current location if permission granted
          if (hasLocationPermission) {
            setIsLoadingLocation(true);
            setLocationError(null);
            
            Geolocation.getCurrentPosition(
              position => {
                setLocation({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
                setIsLoadingLocation(false);
                showMessage({
                  message: 'Location obtained successfully',
                  type: 'success',
                });
              },
              error => {
                console.log('Location error:', error.code, error.message);
                setLocationError(`Failed to get location: ${error.message}`);
                setIsLoadingLocation(false);
                showMessage({
                  message: 'Failed to get location',
                  description: error.message,
                  type: 'warning',
                });
              },
              {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
            );
          } else {
            setLocationError('Location permission denied');
            showMessage({
              message: 'Location permission denied',
              description: 'Please enable location access in settings',
              type: 'warning',
            });
          }
        }
      },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Simple Header without SVG */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Absensi Test</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.photoSection}>
            <Text style={styles.sectionLabel}>Photo</Text>
            <TouchableOpacity onPress={handleTakePhoto}>
              <View style={styles.photoPlaceholder}>
                {photoUri ? (
                  <Image
                    source={{uri: photoUri}}
                    style={styles.photoImage}
                    resizeMode="cover"
                  />
                ) : (
                  <Text style={styles.photoPlaceholderText}>
                    Tap to take photo
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.bottomSection}>
            <View style={styles.formColumn}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tanggal</Text>
                <RNTextInput
                  value={tanggal}
                  onChangeText={setTanggal}
                  placeholder="DD/MM/YYYY"
                  style={styles.dateTimeInput}
                  editable={false}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Waktu</Text>
                <RNTextInput
                  value={waktu}
                  onChangeText={setWaktu}
                  placeholder="HH.MM"
                  style={styles.dateTimeInput}
                  editable={false}
                />
              </View>
            </View>
            
            <View style={styles.locationColumn}>
              <Text style={styles.sectionLabel}>Location</Text>
              <View style={styles.locationPlaceholder}>
                {isLoadingLocation ? (
                  <Text style={styles.locationPlaceholderText}>
                    Getting location...
                  </Text>
                ) : locationError ? (
                  <Text style={styles.locationErrorText}>
                    {locationError}
                  </Text>
                ) : location ? (
                  <View style={styles.locationInfo}>
                    <Text style={styles.locationText}>
                      Lat: {location.latitude.toFixed(4)}
                    </Text>
                    <Text style={styles.locationText}>
                      Lon: {location.longitude.toFixed(4)}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.locationPlaceholderText}>
                    Location will appear here
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
        
        {/* Simple Button without custom component */}
        <TouchableOpacity style={styles.confirmButton}>
          <Text style={styles.confirmButtonText}>Confirm</Text>
        </TouchableOpacity>
        
        <View style={{marginBottom: 100}}></View>
      </ScrollView>
      
      {/* Simple Navigation without SVG icons */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Scan')}>
          <Text style={styles.navText}>Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Activity')}>
          <Text style={styles.navText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Account')}>
          <Text style={styles.navText}>Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ScanTest;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  photoSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  sectionLabel: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 10,
    alignSelf: 'center',
    fontWeight: '500',
  },
  photoPlaceholder: {
    width: 350,
    height: 280,
    borderRadius: 20,
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  photoPlaceholderText: {
    color: '#666666',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
  },
  formColumn: {
    flex: 1,
  },
  locationColumn: {
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
    fontWeight: '500',
  },
  dateTimeInput: {
    width: 180,
    height: 50,
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderColor: '#CFCFCF',
    backgroundColor: '#FFFFFF',
    fontSize: 13,
  },
  locationPlaceholder: {
    width: 170,
    height: 170,
    borderRadius: 15,
    backgroundColor: '#CCCCCC',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationPlaceholderText: {
    color: '#666666',
    textAlign: 'center',
  },
  locationErrorText: {
    color: '#FF6B6B',
    textAlign: 'center',
    fontSize: 12,
  },
  locationInfo: {
    alignItems: 'center',
  },
  locationText: {
    color: '#333333',
    fontSize: 12,
    marginBottom: 2,
  },
  confirmButton: {
    width: 345,
    height: 55,
    borderRadius: 13,
    margin: 15,
    alignSelf: 'center',
    backgroundColor: '#1C272F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingVertical: 25,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEDEDE',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000000',
  },
});
