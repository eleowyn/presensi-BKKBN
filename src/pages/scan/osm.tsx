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
import React, {useState, useEffect, useCallback} from 'react';
import {launchCamera, MediaType} from 'react-native-image-picker';
import Geolocation from '@react-native-community/geolocation';
import {Button, Buttonnavigation, Header} from '../../components';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import moment from 'moment';
import axios from 'axios';

interface LocationData {
  fullAddress: string;
  locationName: string;
  sublocality: string;
  postalCode: string;
  latitude: string | number;
  longitude: string | number;
  error?: string;
}

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

  // Function untuk reverse geocoding menggunakan OpenStreetMap Nominatim API
  const reverseGeocode = async (
    latitude: number,
    longitude: number,
  ): Promise<LocationData> => {
    try {
      console.log(`Starting reverse geocoding for: ${latitude}, ${longitude}`);

      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`,
        {
          timeout: 10000, // 10 second timeout
          headers: {
            'User-Agent': 'AttendanceApp/1.0',
          },
        },
      );

      console.log('Nominatim response:', response.data);

      if (response.data && response.data.address) {
        const address = response.data.address;
        const displayName = response.data.display_name || 'Unknown Location';

        const city =
          address.city ||
          address.town ||
          address.village ||
          address.municipality ||
          '';
        const sublocality =
          address.suburb || address.neighbourhood || address.hamlet || '';
        const postalCode = address.postcode || '';

        return {
          fullAddress: displayName,
          locationName: city,
          sublocality: sublocality,
          postalCode: postalCode,
          latitude: latitude,
          longitude: longitude,
        };
      }

      return {
        fullAddress: 'Location not found',
        locationName: 'Manado',
        sublocality: '',
        postalCode: '',
        latitude: latitude,
        longitude: longitude,
      };
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return {
        fullAddress: 'Failed to get location details',
        locationName: 'Manado',
        sublocality: '',
        postalCode: '',
        latitude: latitude,
        longitude: longitude,
      };
    }
  };

  const checkLocationPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
        const status = await check(permission);

        if (status === RESULTS.GRANTED) {
          return true;
        } else if (status === RESULTS.DENIED) {
          const result = await request(permission);
          return result === RESULTS.GRANTED;
        }
        return false;
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
    } catch (error) {
      console.error('Permission error:', error);
      return false;
    }
  };

  const checkCoarseLocationPermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;

    try {
      const permission = PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION;
      const status = await check(permission);

      if (status === RESULTS.GRANTED) {
        return true;
      } else if (status === RESULTS.DENIED) {
        const result = await request(permission);
        return result === RESULTS.GRANTED;
      }
      return false;
    } catch (error) {
      console.error('Coarse permission error:', error);
      return false;
    }
  };

  // New: Get last known location (faster)
  const getLastKnownLocation = async (): Promise<LocationData | null> => {
    if (Platform.OS === 'android') {
      try {
        const hasPermission = await checkLocationPermission();
        if (!hasPermission) return null;

        const position = await new Promise<any>(resolve => {
          Geolocation.getLastKnownPosition(resolve, () => resolve(null));
        });

        if (position) {
          return await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude,
          );
        }
      } catch (error) {
        console.error('Last known location error:', error);
      }
    }
    return null;
  };

  // New: Get network-based location (faster but less accurate)
  const getNetworkLocation = async (): Promise<LocationData | null> => {
    if (Platform.OS === 'android') {
      try {
        const hasPermission = await checkCoarseLocationPermission();
        if (!hasPermission) return null;

        const position = await new Promise<any>(resolve => {
          Geolocation.getCurrentPosition(resolve, () => resolve(null), {
            enableHighAccuracy: false,
            timeout: 5000,
          });
        });

        if (position) {
          return await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude,
          );
        }
      } catch (error) {
        console.error('Network location error:', error);
      }
    }
    return null;
  };

  // New: Optimized location fetching with fallbacks
  // Replace the location-related functions with these:

  const getOptimizedLocation = async (): Promise<LocationData> => {
    setLocationError('');
    setTempat('Getting location...');

    // 1. First try quick network-based location (Android only)
    if (Platform.OS === 'android') {
      try {
        const hasCoarsePermission = await checkCoarseLocationPermission();
        if (hasCoarsePermission) {
          const networkLocation = await new Promise<LocationData | null>(
            resolve => {
              Geolocation.getCurrentPosition(
                async position => {
                  const location = await reverseGeocode(
                    position.coords.latitude,
                    position.coords.longitude,
                  );
                  resolve(location);
                },
                () => resolve(null), // Silently fail and try GPS
                {enableHighAccuracy: false, timeout: 3000, maximumAge: 30000},
              );
            },
          );

          if (networkLocation) {
            console.log('Got fast network location');
            return networkLocation;
          }
        }
      } catch (error) {
        console.log('Network location failed, trying GPS');
      }
    }

    // 2. Fall back to accurate GPS location
    try {
      const gpsLocation = await new Promise<LocationData>(resolve => {
        const watchId = Geolocation.watchPosition(
          async position => {
            Geolocation.clearWatch(watchId);
            clearTimeout(timer);
            const location = await reverseGeocode(
              position.coords.latitude,
              position.coords.longitude,
            );
            resolve(location);
          },
          error => {
            Geolocation.clearWatch(watchId);
            clearTimeout(timer);
            resolve(getFallbackLocation(error));
          },
          {enableHighAccuracy: true, timeout: 10000, maximumAge: 0},
        );

        const timer = setTimeout(() => {
          Geolocation.clearWatch(watchId);
          resolve(getFallbackLocation(new Error('Location timeout')));
        }, 10000);
      });

      return gpsLocation;
    } catch (error) {
      console.error('GPS location error:', error);
      return getFallbackLocation(error);
    }
  };

  // Remove getLastKnownLocation and getOptimizedLocation functions completely
  // Helper for fallback location
  const getFallbackLocation = (error: any): LocationData => {
    let errorMessage = 'Failed to get location';

    if (error.code === error.PERMISSION_DENIED) {
      errorMessage = 'Location permission denied';
    } else if (error.code === error.POSITION_UNAVAILABLE) {
      errorMessage = 'Location service unavailable';
    } else if (error.code === error.TIMEOUT) {
      errorMessage = 'Location request timed out';
    }

    setLocationError(errorMessage);
    return {
      fullAddress: errorMessage,
      locationName: 'Manado',
      sublocality: '',
      postalCode: '',
      latitude: '',
      longitude: '',
      error: errorMessage,
    };
  };

  // Updated: Check camera permission
  const checkCameraPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'android') {
        const permission = PERMISSIONS.ANDROID.CAMERA;
        const status = await check(permission);

        if (status === RESULTS.GRANTED) {
          return true;
        } else if (status === RESULTS.DENIED) {
          const result = await request(permission);
          return result === RESULTS.GRANTED;
        }
        return false;
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
    } catch (error) {
      console.error('Camera permission error:', error);
      return false;
    }
  };

  // Updated: Take photo with optimized location
  const takePhoto = useCallback(async () => {
    try {
      console.log('Starting photo capture process...');
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
        saveToPhotos: false,
        cameraType: 'back' as const,
      };

      launchCamera(options, async response => {
        try {
          console.log('Camera response received:', response);

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
            console.log('Photo asset:', asset);

            if (asset.uri) {
              setPhotoUri(asset.uri);
              console.log('Photo URI set:', asset.uri);

              const now = moment();
              setTanggal(now.format('MM-DD-YYYY'));
              setWaktu(now.format('HH:mm:ss'));
              console.log('Date and time set');

              setTempat('Getting location...');
              try {
                const locationData = await getOptimizedLocation();
                console.log('Location data received:', locationData);

                setTempat(
                  locationData.fullAddress || locationData.locationName,
                );
                setLatitude(String(locationData.latitude));
                setLongitude(String(locationData.longitude));
                setKodePos(locationData.postalCode);
                setKecamatan(locationData.sublocality);

                if (locationData.error) {
                  setLocationError(locationData.error);
                }
              } catch (locationError) {
                console.error('Error getting location:', locationError);
                setTempat('Location unavailable');
                setLocationError('Failed to get location');
              }
            }
          } else {
            console.error('No assets in camera response');
            Alert.alert('Error', 'Failed to capture photo');
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
  }, []);

  // Initialize location on component mount
  useEffect(() => {
    let isMounted = true;

    const initializeLocation = async () => {
      try {
        const now = moment();
        setTanggal(now.format('MM-DD-YYYY'));
        setWaktu(now.format('HH:mm:ss'));
        setTempat('Getting location...');

        const locationData = await getOptimizedLocation();

        if (isMounted) {
          console.log('Initial Location Data:', locationData);
          setTempat(locationData.fullAddress || locationData.locationName);
          setLatitude(String(locationData.latitude));
          setLongitude(String(locationData.longitude));
          setKodePos(locationData.postalCode);
          setKecamatan(locationData.sublocality);

          if (locationData.error) {
            setLocationError(locationData.error);
          }
        }
      } catch (error) {
        console.error('Error initializing location:', error);
        if (isMounted) {
          setTempat('Location unavailable');
          setLocationError('Failed to initialize location');
        }
      }
    };

    initializeLocation();

    return () => {
      isMounted = false;
    };
  }, []);

  const refreshLocation = async () => {
    setTempat('Getting location...');
    setLocationError('');

    const locationData = await getOptimizedLocation();
    setTempat(locationData.fullAddress || locationData.locationName);
    setLatitude(String(locationData.latitude));
    setLongitude(String(locationData.longitude));
    setKodePos(locationData.postalCode);
    setKecamatan(locationData.sublocality);

    if (locationData.error) {
      setLocationError(locationData.error);
    }
  };

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
        <Button onPress={refreshLocation} text="Refresh Location" />
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
    height: 100,
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
    textAlignVertical: 'top',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
});
