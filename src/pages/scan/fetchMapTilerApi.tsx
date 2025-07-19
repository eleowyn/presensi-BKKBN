import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput as RNTextInput,
  Image,
  Alert,
  PermissionsAndroid,
  Platform,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {launchCamera, MediaType} from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import {Button, Buttonnavigation, Header} from '../../components';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import moment from 'moment';
import axios from 'axios';

const Scan = ({navigation}: {navigation: any}) => {
  const [tanggal, setTanggal] = useState('');
  const [waktu, setWaktu] = useState('');
  const [tempat, setTempat] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [kodePos, setKodePos] = useState('');
  const [kecamatan, setKecamatan] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const apiKey = 'PvEBkX7KhStqjklf5qSY'; // Ganti dengan kunci API MapTiler Anda
      const response = await axios.get(
        `https://api.maptiler.com/geocoding/${longitude},${latitude}.json?key=${apiKey}`,
      );

      if (
        response.data &&
        response.data.features &&
        response.data.features.length > 0
      ) {
        const result = response.data.features[0];
        const address = result.place_name || 'Address not found';
        const city =
          result.context.find(ctx => ctx.id.includes('locality'))?.text ||
          'City not found';
        const sublocality =
          result.context.find(ctx => ctx.id.includes('neighborhood'))?.text ||
          'Sublocality not found';
        const postalCode =
          result.context.find(ctx => ctx.id.includes('postcode'))?.text ||
          'Postal code not found';

        return {
          fullAddress: address,
          locationName: city,
          sublocality: sublocality,
          postalCode: postalCode,
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        };
      }

      // Fallback jika tidak ada hasil
      return {
        fullAddress: 'Location not found',
        locationName: '',
        sublocality: '',
        postalCode: '',
        latitude: '',
        longitude: '',
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        fullAddress: 'Failed to get location',
        locationName: '',
        sublocality: '',
        postalCode: '',
        latitude: '',
        longitude: '',
      };
    }
  };

  const getCurrentLocation = async () => {
    return new Promise(async resolve => {
      try {
        const hasPermission = await checkLocationPermission();
        if (!hasPermission) {
          setLocationError('Location permission not granted');
          resolve({locationName: 'Unknown', latitude: '', longitude: ''});
          return;
        }

        const options = {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        };

        Geolocation.getCurrentPosition(
          async position => {
            const {latitude, longitude} = position.coords;
            console.log('Location obtained:', latitude, longitude);

            const locationData = await reverseGeocode(latitude, longitude);
            console.log('Location Data:', locationData); // Debugging log
            resolve(locationData);
          },
          error => {
            console.error('Geolocation error:', error);
            setLocationError('Failed to get location');
            resolve({locationName: 'Unknown', latitude: '', longitude: ''});
          },
          options,
        );
      } catch (error) {
        console.error('Location error:', error);
        resolve({locationName: 'Unknown', latitude: '', longitude: ''});
      }
    });
  };

  const checkLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
        const status = await check(permission);
        if (status === RESULTS.GRANTED) {
          return true;
        } else if (status === RESULTS.DENIED) {
          const result = await request(permission);
          return result === RESULTS.GRANTED;
        }
        return false;
      } catch (error) {
        console.error('Permission error:', error);
        return false;
      }
    } else {
      const permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
      const status = await check(permission);
      if (status === RESULTS.GRANTED) {
        return true;
      } else if (status === RESULTS.DENIED) {
        const result = await request(permission);
        return result === RESULTS.GRANTED;
      }
      return false;
    }
  };

  const checkCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const permission = PERMISSIONS.ANDROID.CAMERA;
        const status = await check(permission);
        if (status === RESULTS.GRANTED) {
          return true;
        } else if (status === RESULTS.DENIED) {
          const result = await request(permission);
          return result === RESULTS.GRANTED;
        }
        return false;
      } catch (error) {
        console.error('Camera permission error:', error);
        return false;
      }
    } else {
      const permission = PERMISSIONS.IOS.CAMERA;
      const status = await check(permission);
      if (status === RESULTS.GRANTED) {
        return true;
      } else if (status === RESULTS.DENIED) {
        const result = await request(permission);
        return result === RESULTS.GRANTED;
      }
      return false;
    }
  };

  const takePhoto = async () => {
    try {
      setLoading(true);

      const hasCameraPermission = await checkCameraPermission();
      if (!hasCameraPermission) {
        Alert.alert(
          'Camera Permission Required',
          'The app requires camera permission to take photos',
        );
        setLoading(false);
        return;
      }

      const options = {
        mediaType: 'photo' as MediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8,
        saveToPhotos: true,
        cameraType: 'back',
      };

      launchCamera(options, async response => {
        try {
          if (response.didCancel) {
            console.log('User cancelled camera');
            setLoading(false);
            return;
          }

          if (response.errorCode || response.errorMessage) {
            console.error('Camera Error:', response.errorMessage);
            Alert.alert(
              'Error',
              response.errorMessage || 'Failed to take photo',
            );
            setLoading(false);
            return;
          }

          if (response.assets && response.assets[0]) {
            const asset = response.assets[0];
            if (asset.uri) {
              setPhotoUri(asset.uri);

              const now = moment();
              setTanggal(now.format('MM-DD-YYYY'));
              setWaktu(now.format('HH:mm:ss')); // Display time in HH:mm:ss

              const locationData = await getCurrentLocation();
              console.log('Location Data:', locationData); // Debugging log
              setTempat(locationData.locationName);
              setLatitude(locationData.latitude);
              setLongitude(locationData.longitude);
              setKodePos(locationData.postalCode);
              setKecamatan(locationData.sublocality);
            }
          }
        } catch (error) {
          console.error('Camera processing error:', error);
          Alert.alert('Error', 'An error occurred while processing the photo');
        } finally {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Camera launch error:', error);
      Alert.alert('Error', 'Failed to open camera');
      setLoading(false);
    }
  };

  useEffect(() => {
    const now = moment();
    setTanggal(now.format('MM-DD-YYYY'));
    setWaktu(now.format('HH:mm:ss'));
    setTempat('Getting location...');

    getCurrentLocation().then(locationData => {
      console.log('Initial Location Data:', locationData); // Debugging log
      setTempat(locationData.locationName);
      setLatitude(locationData.latitude);
      setLongitude(locationData.longitude);
      setKodePos(locationData.postalCode);
      setKecamatan(locationData.sublocality);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header text="Attendance" />
        <View style={styles.content}>
          <View style={styles.photoSection}>
            <Text style={styles.sectionLabel}>Photo</Text>
            <TouchableOpacity
              style={styles.photoPlaceholder}
              onPress={takePhoto}
              disabled={loading}>
              {photoUri ? (
                <Image source={{uri: photoUri}} style={styles.photoImage} />
              ) : (
                <View style={styles.photoPlaceholderContent}>
                  <Text style={styles.photoPlaceholderText}>
                    {loading ? 'Taking Photo...' : 'Tap to Take Photo'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {locationError ? (
              <Text style={styles.errorText}>{locationError}</Text>
            ) : null}
          </View>
          <View style={styles.bottomSection}>
            <View style={styles.formColumn}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Date</Text>
                <RNTextInput
                  value={tanggal}
                  editable={false}
                  style={styles.dateTimeInput}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Time</Text>
                <RNTextInput
                  value={waktu}
                  editable={false}
                  style={styles.dateTimeInput}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <RNTextInput
                  value={tempat}
                  editable={false}
                  multiline
                  numberOfLines={2}
                  style={[styles.dateTimeInput, styles.locationInput]}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>District</Text>
                <RNTextInput
                  value={kecamatan}
                  editable={false}
                  style={styles.dateTimeInput}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Postal Code</Text>
                <RNTextInput
                  value={kodePos}
                  editable={false}
                  style={styles.dateTimeInput}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Latitude</Text>
                <RNTextInput
                  value={latitude}
                  editable={false}
                  style={styles.dateTimeInput}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Longitude</Text>
                <RNTextInput
                  value={longitude}
                  editable={false}
                  style={styles.dateTimeInput}
                />
              </View>
            </View>
          </View>
        </View>
        <Button
          text="Confirm"
          onPress={() => {
            if (!photoUri) {
              Alert.alert('Warning', 'Please take a photo first');
              return;
            }
            Alert.alert('Success', 'Attendance recorded successfully');
          }}
        />
        <View style={{marginBottom: 100}}></View>
      </ScrollView>
      <Buttonnavigation navigation={navigation} />
    </SafeAreaView>
  );
};

export default Scan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF',
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
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#000000',
    marginBottom: 10,
    alignSelf: 'center',
  },
  photoPlaceholder: {
    width: 350,
    height: 280,
    borderRadius: 20,
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  photoPlaceholderContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
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
  inputGroup: {
    marginBottom: 20,
    alignSelf: 'center',
  },
  inputLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
  },
  dateTimeInput: {
    width: 345,
    height: 50,
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderColor: '#CFCFCF',
    backgroundColor: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.3,
    elevation: 8,
  },
  locationInput: {
    height: 70,
    textAlignVertical: 'top',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
});
