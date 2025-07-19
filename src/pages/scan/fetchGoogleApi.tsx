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

const Scan = ({navigation}: {navigation: any}) => {
  const [tanggal, setTanggal] = useState('');
  const [waktu, setWaktu] = useState('');
  const [tempat, setTempat] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Format tanggal dan waktu saat ini
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const time = now.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    return {date, time};
  };

  // Reverse geocoding untuk mendapatkan nama lokasi
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyABNoqKP5pxmEfGrpV4A-MlIO5iZFFPJIU&language=id`,
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        // Try to get the most specific address possible
        const address = data.results[0].formatted_address;
        return address;
      }
      return 'Lokasi tidak diketahui';
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return 'Gagal mendapatkan lokasi';
    }
  };

  // Mendapatkan lokasi saat ini dengan retry mechanism
  const getCurrentLocation = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const hasPermission = await checkLocationPermission();
        if (!hasPermission) {
          setLocationError('Izin lokasi tidak diberikan');
          resolve('Manado'); // Default location
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

            // Dapatkan nama lokasi dari koordinat
            try {
              const locationName = await reverseGeocode(latitude, longitude);
              resolve(locationName);
            } catch (error) {
              console.error('Geocoding error:', error);
              resolve('Manado'); // Fallback
            }
          },
          error => {
            console.error('Geolocation error:', error);
            setLocationError('Gagal mendapatkan lokasi');
            resolve('Manado'); // Default location
          },
          options,
        );
      } catch (error) {
        console.error('Location error:', error);
        resolve('Manado'); // Default location
      }
    });
  };

  // Check and request location permission
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
      // iOS implementation
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

  // Check and request camera permission
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
      // iOS implementation
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

  // Fungsi untuk mengambil foto
  const takePhoto = async () => {
    try {
      setLoading(true);

      // Check permissions
      const hasCameraPermission = await checkCameraPermission();
      if (!hasCameraPermission) {
        Alert.alert(
          'Izin Kamera Diperlukan',
          'Aplikasi memerlukan izin kamera untuk mengambil foto',
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
        saveToPhotos: true, // Save to gallery to prevent app closing
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
              response.errorMessage || 'Gagal mengambil foto',
            );
            setLoading(false);
            return;
          }

          if (response.assets && response.assets[0]) {
            const asset = response.assets[0];
            if (asset.uri) {
              setPhotoUri(asset.uri);

              // Set waktu dan tanggal saat foto diambil
              const now = moment();
              setTanggal(now.format('DD-MM-YYYY'));
              setWaktu(now.format('HH:mm'));

              // Dapatkan lokasi saat ini
              const location = await getCurrentLocation();
              setTempat(location);
            }
          }
        } catch (error) {
          console.error('Camera processing error:', error);
          Alert.alert('Error', 'Terjadi kesalahan saat memproses foto');
        } finally {
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Camera launch error:', error);
      Alert.alert('Error', 'Gagal membuka kamera');
      setLoading(false);
    }
  };

  // Set default values saat komponen dimuat
  useEffect(() => {
    const now = moment();
    setTanggal(now.format('DD-MM-YYYY'));
    setWaktu(now.format('HH:mm'));
    setTempat('Mendapatkan lokasi...');

    // Get initial location
    getCurrentLocation().then(location => {
      setTempat(location as string);
      Geolocation.getCurrentPosition(
        async position => {
          const {latitude, longitude} = position.coords;
          console.log('Location obtained:', latitude, longitude);

          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=6.2088,106.8456&key=AIzaSyABNoqKP5pxmEfGrpV4A-MlIO5iZFFPJIU&language=id`,
          );
          console.log('HTTP Status:', response.status); // Tambahkan ini untuk memeriksa status
          if (!response.ok) {
            console.error('HTTP error:', response.statusText);
            return;
          }
          const data = await response.json();
          console.log('API Response:', data);

          const locationName = await reverseGeocode(latitude, longitude);
          console.log('Nama lokasi:', locationName);
          resolve(locationName);
        },
        error => {
          console.error('Geolocation error:', error);
          resolve('Manado'); // Default location
        },
        options,
      );
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header text="Absensi" />
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
                    {loading
                      ? 'Mengambil Foto...'
                      : 'Ketuk untuk Mengambil Foto'}
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
                <Text style={styles.inputLabel}>Tanggal</Text>
                <RNTextInput
                  value={tanggal}
                  editable={false}
                  style={styles.dateTimeInput}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Waktu</Text>
                <RNTextInput
                  value={waktu}
                  editable={false}
                  style={styles.dateTimeInput}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Lokasi</Text>
                <RNTextInput
                  value={tempat}
                  editable={false}
                  multiline
                  numberOfLines={2}
                  style={[styles.dateTimeInput, styles.locationInput]}
                />
              </View>
            </View>
          </View>
        </View>
        <Button
          text="Confirm"
          onPress={() => {
            if (!photoUri) {
              Alert.alert('Peringatan', 'Harap ambil foto terlebih dahulu');
              return;
            }
            // Handle confirmation logic here
            Alert.alert('Sukses', 'Absensi berhasil dicatat');
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
