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
  Linking,
  ActivityIndicator,
  Alert, // Added for selection dialog
} from 'react-native';
import React, {useState} from 'react';
import {Button, Buttonnavigation, Header} from '../../components';
// Updated to include launchImageLibrary
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {showMessage} from 'react-native-flash-message';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import {getDatabase, ref, push} from 'firebase/database';
import {getAuth} from 'firebase/auth';
import app from '../../config/Firebase';
// Added for the dropdown menu
import {Picker} from '@react-native-picker/picker';

const Scan = ({navigation}: {navigation: any}) => {
  const [tanggal, setTanggal] = useState('');
  const [waktu, setWaktu] = useState('');
  const [photo, setPhoto] = useState<{uri: string; base64?: string} | null>(
    null,
  );
  const [location, setLocation] = useState<{
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    address: string | null;
    fullAddress: string | null;
    placeName: string | null;
    error: string | null;
    isHighAccuracy: boolean;
  }>({
    latitude: null,
    longitude: null,
    accuracy: null,
    address: null,
    fullAddress: null,
    placeName: null,
    error: null,
    isHighAccuracy: false,
  });
  const [keterangan, setKeterangan] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New state for the dropdown menu
  const [activityType, setActivityType] = useState('Dinas di Luar');
  // New state for the file attachment
  const [attachment, setAttachment] = useState<{
    uri: string;
    base64?: string;
  } | null>(null);

  // --- EXISTING FUNCTIONS (getCurrentUser, getAttendanceStatus, etc.) ---
  // (No changes to these functions, they are kept as they were)
  const getCurrentUser = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
    };
  };

  const getAttendanceStatus = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes;
    const presentStart = 8 * 60; // 08:00
    const presentEnd = 8 * 60 + 30; // 08:30
    const unexcusedStart = 17 * 60; // 17:00
    const unexcusedEnd = 7 * 60 + 59; // 07:59
    if (totalMinutes >= presentStart && totalMinutes <= presentEnd) {
      return 'Present';
    }
    if (totalMinutes >= unexcusedStart || totalMinutes <= unexcusedEnd) {
      return 'Unexcused';
    }
    return 'Late';
  };

  const getLocationDetails = async (lat: number, lon: number) => {
    try {
      const results = await Promise.allSettled([
        axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&extratags=1&namedetails=1`,
          {
            headers: {
              'User-Agent': 'AttendanceApp/1.0 (contact@example.com)',
            },
            timeout: 10000,
          },
        ),
        console.log(
          `This app was created by Elshera A. E. Dahlan & Lana L. L. Londah`,
        ),
        axios
          .get(
            `https://us1.locationiq.com/v1/reverse.php?key=YOUR_LOCATIONIQ_KEY&lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`,
            {
              timeout: 8000,
            },
          )
          .catch(() => null),
      ]);
      let bestResult = null;
      let placeName = null;
      if (results[0].status === 'fulfilled') {
        const data = results[0].value.data;
        const {address, display_name, namedetails} = data;
        placeName =
          namedetails?.name ||
          address?.amenity ||
          address?.building ||
          address?.shop ||
          address?.office ||
          address?.leisure ||
          address?.tourism ||
          address?.public_building ||
          null;
        const road = address.road || address.pedestrian || '';
        const houseNumber = address.house_number || '';
        const village = address.village || address.hamlet || '';
        const suburb = address.suburb || address.neighbourhood || '';
        const city = address.city || address.town || address.municipality || '';
        const state = address.state || address.province || '';
        const postcode = address.postcode || '';
        const country = address.country || '';
        const addressParts = [
          houseNumber && road ? `${road} ${houseNumber}` : road,
          village,
          suburb,
          city,
        ].filter(Boolean);
        const shortAddress =
          addressParts.length > 0
            ? addressParts.join(', ')
            : 'Location Unknown';
        const fullAddress =
          [
            houseNumber && road ? `${road} ${houseNumber}` : road,
            village,
            suburb,
            city,
            state,
            postcode,
            country,
          ]
            .filter(Boolean)
            .join(', ') || 'Location Unknown';
        bestResult = {
          shortAddress,
          fullAddress,
          placeName,
          source: 'OpenStreetMap',
        };
      }
      if (
        !bestResult &&
        results[1].status === 'fulfilled' &&
        results[1].value
      ) {
        const data = results[1].value.data;
        bestResult = {
          shortAddress:
            data.display_name?.split(',').slice(0, 3).join(', ') ||
            'Location Unknown',
          fullAddress: data.display_name || 'Location Unknown',
          placeName: data.namedetails?.name || null,
          source: 'LocationIQ',
        };
      }
      return bestResult;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const status = await Geolocation.requestAuthorization('whenInUse');
      return status === 'granted';
    } else if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Premission',
          message: 'This App need location premission for scan',
          buttonNeutral: 'Later',
          buttonNegative: 'Deny',
          buttonPositive: 'Allow',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return false;
  };

  const fetchDateTimeAndLocation = async () => {
    setLoading(true);
    const now = new Date();
    setTanggal(now.toLocaleDateString('id-ID'));
    setWaktu(
      now.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'}),
    );
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location Premission Denied');
      }
      let bestPosition = null;
      let attempts = 0;
      const maxAttempts = 3;
      while (
        attempts < maxAttempts &&
        (!bestPosition || bestPosition.coords.accuracy > 10)
      ) {
        attempts++;
        try {
          console.log(`Location attempt ${attempts}/${maxAttempts}`);
          const position = await new Promise((resolve, reject) => {
            const watchId = Geolocation.watchPosition(
              pos => {
                if (
                  pos.coords.accuracy <= 10 ||
                  Date.now() - startTime > 15000
                ) {
                  Geolocation.clearWatch(watchId);
                  resolve(pos);
                }
              },
              error => {
                Geolocation.clearWatch(watchId);
                reject(error);
              },
              {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 0,
                distanceFilter: 0,
                interval: 1000,
                fastestInterval: 500,
                forceRequestLocation: true,
                showLocationDialog: true,
                forceLocationManager: true,
              },
            );
            const startTime = Date.now();
          });
          if (
            !bestPosition ||
            position.coords.accuracy < bestPosition.coords.accuracy
          ) {
            bestPosition = position;
          }
          if (position.coords.accuracy <= 5) {
            console.log(
              `Excellent accuracy achieved: ${position.coords.accuracy}m`,
            );
            break;
          }
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (attemptError) {
          console.log(`Attempt ${attempts} failed:`, attemptError);
          if (attempts === maxAttempts) {
            try {
              bestPosition = await new Promise((resolve, reject) => {
                Geolocation.getCurrentPosition(resolve, reject, {
                  enableHighAccuracy: true,
                  timeout: 15000,
                  maximumAge: 2000,
                  distanceFilter: 1,
                });
              });
            } catch (fallbackError) {
              console.log('Fallback also failed:', fallbackError);
            }
          }
        }
      }
      if (!bestPosition) {
        throw new Error(`Can't get location after multiple attempt`);
      }
      const accuracy = bestPosition.coords.accuracy;
      let accuracyLevel;
      let isHighAccuracy;
      if (accuracy <= 5) {
        accuracyLevel = 'Sangat Akurat';
        isHighAccuracy = true;
      } else if (accuracy <= 50) {
        accuracyLevel = 'Akurat';
        isHighAccuracy = true;
      } else if (accuracy <= 150) {
        accuracyLevel = 'Cukup Akurat';
        isHighAccuracy = false;
      } else {
        accuracyLevel = 'Kurang Akurat';
        isHighAccuracy = false;
      }
      const locationDetails = await getLocationDetails(
        bestPosition.coords.latitude,
        bestPosition.coords.longitude,
      );
      setLocation({
        latitude: bestPosition.coords.latitude,
        longitude: bestPosition.coords.longitude,
        accuracy: accuracy,
        address: locationDetails?.shortAddress || null,
        fullAddress: locationDetails?.fullAddress || null,
        placeName: locationDetails?.placeName || null,
        error: null,
        isHighAccuracy,
      });
      const locationText = locationDetails?.placeName
        ? `${locationDetails.placeName} - ${locationDetails.shortAddress}`
        : locationDetails?.shortAddress ||
          'Koordinat: ' +
            bestPosition.coords.latitude.toFixed(6) +
            ', ' +
            bestPosition.coords.longitude.toFixed(6);
      showMessage({
        message: `Lokasi Terdeteksi (${accuracyLevel})`,
        description: `${locationText}\nPercobaan: ${attempts}, Akurasi: ±${accuracy.toFixed(
          1,
        )}m`,
        type: accuracy <= 15 ? 'success' : accuracy <= 150 ? 'warning' : 'info',
        duration: 5000,
      });
    } catch (error) {
      setLocation(prev => ({
        ...prev,
        error: error.message,
      }));
      showMessage({
        message: 'Fail',
        description: 'Failed to get location: ' + error.message,
        type: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * REUSABLE IMAGE PICKER LOGIC
   * This section contains new functions to handle image selection
   * from both the camera and gallery, for both the main photo and the attachment.
   */

  // Main handler that shows an Alert to choose between Camera and Gallery
  const handleImageSelection = (
    isMainPhoto: boolean,
    setter: React.Dispatch<
      React.SetStateAction<{uri: string; base64?: string} | null>
    >,
  ) => {
    Alert.alert(
      'Pilih Sumber Gambar',
      'Pilih foto dari galeri atau ambil foto baru.',
      [
        {
          text: 'Galeri',
          onPress: () => pickImage('gallery', isMainPhoto, setter),
        },
        {
          text: 'Kamera',
          onPress: () => pickImage('camera', isMainPhoto, setter),
        },
        {text: 'Batal', style: 'cancel'},
      ],
      {cancelable: true},
    );
  };

  // Helper function that launches the correct image picker and processes the result
  const pickImage = async (
    source: 'camera' | 'gallery',
    isMainPhoto: boolean,
    setter: React.Dispatch<
      React.SetStateAction<{uri: string; base64?: string} | null>
    >,
  ) => {
    const options = {
      mediaType: 'photo' as const,
      includeBase64: true,
      quality: 0.7,
      maxWidth: 1024,
      maxHeight: 1024,
      saveToPhotos: true,
      cameraType: 'back' as const,
    };

    try {
      const result =
        source === 'camera'
          ? await launchCamera(options)
          : await launchImageLibrary(options);

      if (result.didCancel) {
        showMessage({
          message: 'Peringatan',
          description: 'Pemilihan gambar dibatalkan.',
          type: 'warning',
        });
        return;
      }

      if (result.errorCode || !result.assets?.[0]?.uri) {
        throw new Error(result.errorMessage || 'Gagal memilih gambar.');
      }

      const asset = result.assets[0];
      setter({
        uri: asset.uri,
        base64: asset.base64,
      });

      // If it's the main photo, also fetch location and time
      if (isMainPhoto) {
        await fetchDateTimeAndLocation();
      }
    } catch (error) {
      showMessage({
        message: 'Error',
        description: (error as Error).message,
        type: 'danger',
      });
    }
  };

  const openInMaps = () => {
    if (!location.latitude || !location.longitude) return;

    const url = Platform.select({
      ios: `maps://?q=${location.latitude},${location.longitude}`,
      android: `geo:${location.latitude},${location.longitude}?q=${location.latitude},${location.longitude}`,
    });

    Linking.openURL(url!).catch(err =>
      showMessage({
        message: 'Error',
        description:
          'Failed to open Maps: ' +
          ((err as Error).message || 'Map App is not found'),
        type: 'danger',
      }),
    );
  };

  const refreshLocation = async () => {
    if (loading) return;
    await fetchDateTimeAndLocation();
  };

  // UPDATED confirmation handler to include new fields
  const handleConfirmation = async () => {
    if (isSubmitting) return;

    if (!photo || !photo.base64) {
      showMessage({
        message: 'Warning',
        description: 'Please take a picture first',
        type: 'warning',
      });
      return;
    }

    if (!location.latitude) {
      showMessage({
        message: 'Warning',
        description: 'Wait for location to be detected',
        type: 'warning',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const currentUser = getCurrentUser();
      const database = getDatabase(app);
      const userAttendanceRef = ref(database, `attendance/${currentUser.uid}`);
      const attendanceStatus = getAttendanceStatus(waktu);

      const submissionData = {
        user: {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          phoneNumber: currentUser.phoneNumber,
        },
        photo: `data:image/jpeg;base64,${photo.base64}`,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          address: location.address,
          fullAddress: location.fullAddress,
          placeName: location.placeName,
          isHighAccuracy: location.isHighAccuracy,
        },
        tanggal,
        waktu,
        // New fields added to submission data
        activityType: activityType,
        keterangan: keterangan.trim(),
        attachment: attachment
          ? `data:image/jpeg;base64,${attachment.base64}`
          : null,
        status: attendanceStatus,
        timestamp: Date.now(),
        createdAt: new Date().toISOString(),
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        },
      };

      console.log('Submitting data to Firebase for user:', currentUser.email);
      console.log('Attendance status:', attendanceStatus);
      console.log('Activity Type:', activityType);

      const newAttendanceRef = await push(userAttendanceRef, submissionData);

      console.log('Data successfully saved with ID:', newAttendanceRef.key);

      showMessage({
        message: 'Success!',
        description: `Data is saved for ${
          currentUser.email || currentUser.displayName
        }\nStatus: ${attendanceStatus}`,
        type: 'success',
        duration: 3000,
      });

      setTimeout(() => {
        navigation.navigate('Home');
      }, 1000);
    } catch (error) {
      console.error('Firebase submission error:', error);
      let errorMessage = 'Something went wrong';
      if ((error as Error).message === 'User not authenticated') {
        errorMessage = 'User is not authenticated. Please sign in first.';
      } else {
        errorMessage = `${errorMessage}: ${(error as Error).message}`;
      }
      showMessage({
        message: 'Fail!',
        description: errorMessage,
        type: 'danger',
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEventThrottle={16}>
        <Header text="Absensi" />
        <View style={styles.content}>
          <View style={styles.photoSection}>
            <Text style={styles.sectionLabel}>Foto</Text>
            <TouchableOpacity
              onPress={() => handleImageSelection(true, setPhoto)}
              style={styles.photoContainer}>
              {photo ? (
                <Image
                  source={{uri: photo.uri}}
                  style={styles.photoPreview}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.placeholderText}>
                    Ambil Foto / Pilih dari Galeri
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.detailsContainer}>
            <View style={styles.timeContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tanggal</Text>
                <RNTextInput
                  value={tanggal}
                  style={styles.dateTimeInput}
                  editable={false}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Waktu</Text>
                <RNTextInput
                  value={waktu}
                  style={styles.dateTimeInput}
                  editable={false}
                />
              </View>
            </View>

            <View style={styles.locationContainer}>
              <View style={styles.locationHeader}>
                <Text style={styles.sectionLabel}>Lokasi</Text>
                <TouchableOpacity
                  onPress={refreshLocation}
                  style={styles.refreshButton}
                  disabled={loading}>
                  <Text style={styles.refreshButtonText}>↻</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[
                  styles.locationBox,
                  location.isHighAccuracy
                    ? styles.highAccuracyBox
                    : styles.lowAccuracyBox,
                ]}
                onPress={openInMaps}
                disabled={!location.latitude || loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#0000ff" />
                ) : location.fullAddress ? (
                  <>
                    {location.placeName && (
                      <Text style={styles.placeNameText}>
                        {location.placeName}
                      </Text>
                    )}
                    <Text style={styles.locationText}>{location.address}</Text>
                    <Text style={styles.fullAddressText}>
                      {location.fullAddress}
                    </Text>
                    <Text style={styles.coordinatesText}>
                      {location.latitude?.toFixed(6)},{' '}
                      {location.longitude?.toFixed(6)}
                    </Text>
                    <Text
                      style={[
                        styles.accuracyText,
                        location.isHighAccuracy
                          ? styles.highAccuracyText
                          : styles.lowAccuracyText,
                      ]}>
                      {location.isHighAccuracy ? '✓ Akurat' : '⚠ Kurang Akurat'}{' '}
                      (±{location.accuracy?.toFixed(1)}m)
                    </Text>
                  </>
                ) : location.error ? (
                  <Text style={styles.errorText}>{location.error}</Text>
                ) : (
                  <Text style={styles.placeholderText}>Menunggu lokasi...</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* NEW: Dropdown for Activity Type */}
          <View style={styles.keteranganSection}>
            <Text style={styles.sectionLabel}>Jenis Kegiatan</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={activityType}
                onValueChange={itemValue => setActivityType(itemValue)}
                style={styles.picker}>
                <Picker.Item label="Dinas di Luar" value="Dinas di Luar" />
                <Picker.Item label="Rapat" value="Rapat" />
                <Picker.Item label="Acara" value="Acara" />
              </Picker>
            </View>
          </View>

          <View style={styles.keteranganSection}>
            <Text style={styles.sectionLabel}>Keterangan</Text>
            {/* This app was created by Eishera A. E. Dahlan & L@na L. L. L0ondah */}
            <RNTextInput
              value={keterangan}
              onChangeText={setKeterangan}
              style={styles.keteranganInput}
              placeholder="Masukkan keterangan absensi (opsional)"
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* NEW: File Attachment Section */}
          <View style={styles.keteranganSection}>
            <Text style={styles.sectionLabel}>Lampiran (Opsional)</Text>
            {attachment ? (
              <View>
                <Image
                  source={{uri: attachment.uri}}
                  style={styles.attachmentPreview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  onPress={() => setAttachment(null)}
                  style={styles.removeAttachmentButton}>
                  <Text style={styles.removeAttachmentText}>Hapus</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => handleImageSelection(false, setAttachment)}
                style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>Pilih File</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              text={isSubmitting ? 'Menyimpan...' : 'Konfirmasi'}
              onPress={handleConfirmation}
              disabled={isSubmitting || loading}
            />
            {isSubmitting && (
              <ActivityIndicator
                size="small"
                color="#0000ff"
                style={styles.submitLoader}
              />
            )}
          </View>
        </View>
      </ScrollView>
      <Buttonnavigation navigation={navigation} />
    </SafeAreaView>
  );
};

// Added styles for new components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 30,
  },
  submitLoader: {
    marginTop: 10,
  },
  photoSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  photoContainer: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  timeContainer: {
    flex: 1,
    marginRight: 10,
  },
  locationContainer: {
    flex: 1,
    marginLeft: 10,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  refreshButton: {
    padding: 5,
  },
  refreshButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 5,
  },
  dateTimeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  locationBox: {
    minHeight: 140,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  highAccuracyBox: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0fff0',
  },
  lowAccuracyBox: {
    borderColor: '#FF9800',
    backgroundColor: '#fffaf0',
  },
  placeNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 6,
  },
  locationText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  fullAddressText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
  },
  coordinatesText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  accuracyText: {
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 6,
  },
  highAccuracyText: {
    color: '#4CAF50',
  },
  lowAccuracyText: {
    color: '#FF9800',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
  placeholderText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  keteranganSection: {
    marginTop: 20,
  },
  keteranganInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 12,
    backgroundColor: '#fff',
    minHeight: 100,
    fontSize: 14,
    color: '#333',
  },
  // Styles for Picker/Dropdown
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  picker: {
    color: '#333',
    // You might need to adjust height for Android/iOS consistency
  },
  // Styles for Attachment
  uploadButton: {
    marginTop: 5,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    fontSize: 16,
    color: '#333',
  },
  attachmentPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 5,
  },
  removeAttachmentButton: {
    position: 'absolute',
    top: 15,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  removeAttachmentText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Scan;
