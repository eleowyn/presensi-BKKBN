import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput as RNTextInput,
  TouchableOpacity,
  Image,
  PermissionsAndroid, // Import PermissionsAndroid for Android location permissions
  Platform, // Import Platform to check OS
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {Button, Buttonnavigation, Header} from '../../components';
import {launchCamera} from 'react-native-image-picker';
import {showMessage} from 'react-native-flash-message';
import Geolocation from 'react-native-geolocation-service'; // Import Geolocation

const Scan = ({navigation}: {navigation: any}) => {
  const [tanggal, setTanggal] = useState(''); // Ubah menjadi string kosong agar bisa diisi otomatis
  const [waktu, setWaktu] = useState(''); // Ubah menjadi string kosong agar bisa diisi otomatis
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [location, setLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    error: string | null;
  }>({latitude: null, longitude: null, accuracy: null, error: null});

  /**
   * Fungsi untuk meminta izin lokasi dari pengguna.
   */
  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      // Untuk iOS, izin diminta saat pertama kali mencoba mengakses lokasi
      const status = await Geolocation.requestAuthorization('whenInUse');
      return status === 'granted';
    } else if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Izin Lokasi',
          message:
            'Aplikasi ini memerlukan akses lokasi Anda untuk mencatat absensi.',
          buttonNeutral: 'Nanti',
          buttonNegative: 'Tolak',
          buttonPositive: 'Izinkan',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return false;
  };

  /**
   * Fungsi untuk mendapatkan tanggal, waktu, dan lokasi saat ini.
   */
  const fetchDateTimeAndLocation = async () => {
    // 1. Dapatkan Tanggal dan Waktu Saat Ini
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    setTanggal(`${day}/${month}/${year}`);
    setWaktu(`${hours}.${minutes}`);

    // 2. Dapatkan Lokasi Saat Ini
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      showMessage({
        message: 'Izin Ditolak',
        description:
          'Aplikasi tidak memiliki izin lokasi. Lokasi tidak dapat diambil.',
        type: 'warning',
        icon: 'warning',
        duration: 4000,
      });
      setLocation({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: 'Izin lokasi ditolak',
      });
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
        });
        showMessage({
          message: 'Lokasi Diperbarui',
          description: `Lokasi: ${position.coords.latitude.toFixed(
            4,
          )}, ${position.coords.longitude.toFixed(4)}`,
          type: 'success',
          icon: 'success',
          duration: 2000,
        });
      },
      error => {
        console.error('Error getting location:', error.code, error.message);
        setLocation({
          latitude: null,
          longitude: null,
          accuracy: null,
          error: error.message,
        });
        showMessage({
          message: 'Kesalahan Lokasi',
          description: `Gagal mendapatkan lokasi: ${error.message}`,
          type: 'danger',
          icon: 'danger',
          duration: 4000,
        });
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000}, // Opsi untuk akurasi tinggi
    );
  };

  /**
   * Fungsi untuk meluncurkan kamera dan menangani hasil foto.
   * Setelah foto diambil, foto akan dikonversi ke Base64 dan disimpan di state.
   * Kemudian, akan memicu pengambilan tanggal, waktu, dan lokasi.
   */
  const handleLaunchCamera = async () => {
    const options = {
      mediaType: 'photo' as const,
      includeBase64: true,
      quality: 0.8,
      maxWidth: 800,
      maxHeight: 600,
    };

    try {
      const result = await launchCamera(options);

      if (result.didCancel) {
        console.log('Pengguna membatalkan pengambilan foto');
        showMessage({
          message: 'Informasi',
          description: 'Pengambilan foto dibatalkan.',
          type: 'info',
          icon: 'info',
          duration: 3000,
        });
      } else if (result.errorCode) {
        console.error(
          'Kesalahan launchCamera:',
          result.errorCode,
          result.errorMessage,
        );
        showMessage({
          message: 'Kesalahan',
          description: `Gagal mengakses kamera: ${result.errorMessage}`,
          type: 'danger',
          icon: 'danger',
          duration: 4000,
        });
      } else if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.base64) {
          setPhotoBase64(asset.base64);
          console.log('Foto berhasil diambil dan dikonversi ke Base64.');
          showMessage({
            message: 'Berhasil!',
            description: 'Foto berhasil diambil.',
            type: 'success',
            icon: 'success',
            duration: 2000,
          });
          // Panggil fungsi untuk mendapatkan tanggal, waktu, dan lokasi setelah foto diambil
          fetchDateTimeAndLocation();
        } else {
          showMessage({
            message: 'Kesalahan',
            description: 'Tidak dapat mengambil data Base64 dari foto.',
            type: 'danger',
            icon: 'danger',
            duration: 4000,
          });
        }
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat meluncurkan kamera:', error);
      showMessage({
        message: 'Kesalahan',
        description: 'Terjadi kesalahan saat mencoba mengakses kamera.',
        type: 'danger',
        icon: 'danger',
        duration: 4000,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header text="Absensi" />
        <View style={styles.content}>
          <View style={styles.photoSection}>
            <Text style={styles.sectionLabel}>Photo</Text>
            <TouchableOpacity onPress={handleLaunchCamera}>
              {photoBase64 ? (
                <Image
                  source={{uri: `data:image/jpeg;base64,${photoBase64}`}}
                  style={styles.photoPreview}
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.placeholderText}>
                    Ketuk untuk mengambil foto
                  </Text>
                </View>
              )}
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
                  editable={false} // Tidak bisa diedit manual
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Waktu</Text>
                <RNTextInput
                  value={waktu}
                  onChangeText={setWaktu}
                  placeholder="HH.MM"
                  style={styles.dateTimeInput}
                  editable={false} // Tidak bisa diedit manual
                />
              </View>
            </View>
            <View style={styles.locationColumn}>
              <Text style={styles.sectionLabel}>Location</Text>
              <View style={styles.locationPlaceholder}>
                {location.latitude !== null && location.longitude !== null ? (
                  <Text style={styles.locationText}>
                    Lat: {location.latitude.toFixed(4)}
                    {'\n'}
                    Lon: {location.longitude.toFixed(4)}
                    {'\n'}
                    Akurasi:{' '}
                    {location.accuracy
                      ? `${location.accuracy.toFixed(2)}m`
                      : 'N/A'}
                  </Text>
                ) : location.error ? (
                  <Text style={styles.locationErrorText}>{location.error}</Text>
                ) : (
                  <Text style={styles.placeholderText}>
                    Lokasi belum diambil
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
        <Button text="Confirm" />
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
  },
  placeholderText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  photoPreview: {
    width: 350,
    height: 280,
    borderRadius: 20,
    resizeMode: 'cover',
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
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
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
    fontFamily: 'Poppins-Medium',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.3,
    elevation: 8,
  },
  locationPlaceholder: {
    width: 170,
    height: 170,
    borderRadius: 15,
    backgroundColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10, // Tambahkan padding agar teks tidak terlalu mepet
  },
  locationText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
  },
  locationErrorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
  },
});
