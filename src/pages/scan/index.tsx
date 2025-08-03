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
} from 'react-native';
import React, {useState} from 'react';
import {Button, Buttonnavigation, Header} from '../../components';
import {launchCamera} from 'react-native-image-picker';
import {showMessage} from 'react-native-flash-message';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import {getDatabase, ref, push} from 'firebase/database';
import {getAuth} from 'firebase/auth'; // Add this import
import app from '../../config/Firebase'; // Adjust path as needed
import DocumentPicker from 'react-native-document-picker';
import {
  validateFile,
  uploadFileToCloudinary,
  getFileDisplayInfo,
  showUploadSuccessMessage,
  showUploadErrorMessage,
} from '../../utils/fileUpload';

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
  
  // File upload states
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);

  // Get current user function
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

  // Function to determine attendance status based on time
  const getAttendanceStatus = (timeString: string) => {
    console.log('🕐 Original time string received:', timeString);
    
    // Try to extract time using multiple methods
    let hours = 0;
    let minutes = 0;
    
    // Method 1: Direct split by colon OR dot (Indonesian format uses dots)
    if (timeString.includes(':') || timeString.includes('.')) {
      const separator = timeString.includes(':') ? ':' : '.';
      const parts = timeString.split(separator);
      const hourStr = parts[0].replace(/\D/g, ''); // Remove non-digits
      const minuteStr = parts[1].replace(/\D/g, ''); // Remove non-digits
      
      hours = parseInt(hourStr, 10);
      minutes = parseInt(minuteStr, 10);
      
      console.log('📊 Method 1 - Split by', separator + ':');
      console.log('   Hour string:', hourStr, '-> parsed:', hours);
      console.log('   Minute string:', minuteStr, '-> parsed:', minutes);
    }
    
    // Method 2: If parsing failed, try regex
    if (isNaN(hours) || isNaN(minutes)) {
      const timeMatch = timeString.match(/(\d{1,2})[:.]\s*(\d{2})/);
      if (timeMatch) {
        hours = parseInt(timeMatch[1], 10);
        minutes = parseInt(timeMatch[2], 10);
        console.log('📊 Method 2 - Regex match:', timeMatch);
        console.log('   Parsed hours:', hours, 'minutes:', minutes);
      }
    }
    
    // Final validation
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      console.log('❌ Invalid time values - hours:', hours, 'minutes:', minutes);
      console.log('   Defaulting to Unexcused');
      return 'Unexcused';
    }
    
    const totalMinutes = hours * 60 + minutes;
    
    console.log('✅ Final parsed values:');
    console.log('   Hours:', hours, 'Minutes:', minutes);
    console.log('   Total minutes:', totalMinutes);
    console.log('   Time in 24h format:', `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);

    // Convert time ranges to minutes
    const presentStart = 6 * 60; // 06:00 AM (360 minutes)
    const presentEnd = 8 * 60; // 08:00 AM (480 minutes) - INCLUSIVE
    const lateStart = 8 * 60 + 1; // 08:01 AM (481 minutes)
    const lateEnd = 12 * 60; // 12:00 PM (720 minutes)

    console.log('📋 Time classification ranges:');
    console.log('   🟢 Present: 06:00 (360 min) to 08:00 (480 min)');
    console.log('   🟡 Late: 08:01 (481 min) to 12:00 (720 min)');
    console.log('   🔴 Unexcused: before 06:00 or after 12:00');
    console.log('   📍 Current time: ' + totalMinutes + ' minutes');

    // Check for Present (6:00 AM - 8:00 AM INCLUSIVE)
    if (totalMinutes >= presentStart && totalMinutes <= presentEnd) {
      console.log('🎉 RESULT: Present (within 6:00-8:00 range)');
      return 'Present';
    }

    // Check for Late (8:01 AM - 12:00 PM)
    if (totalMinutes >= lateStart && totalMinutes <= lateEnd) {
      console.log('⚠️ RESULT: Late (within 8:01-12:00 range)');
      return 'Late';
    }

    // Everything else is Unexcused (after 12:00 PM or before 6:00 AM)
    console.log('❌ RESULT: Unexcused (outside all valid ranges)');
    return 'Unexcused';
  };

  // Multiple geocoding services for better accuracy and place names
  const getLocationDetails = async (lat: number, lon: number) => {
    try {
      // Try multiple services for better accuracy
      const results = await Promise.allSettled([
        // Nominatim (OpenStreetMap) - Free
        axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1&extratags=1&namedetails=1`,
          {
            headers: {
              'User-Agent': 'AttendanceApp/1.0 (contact@example.com)',
            },
            timeout: 10000,
          },
        ),
        // LocationIQ - Alternative service (free tier available)
        axios
          .get(
            `https://us1.locationiq.com/v1/reverse.php?key=YOUR_LOCATIONIQ_KEY&lat=${lat}&lon=${lon}&format=json&zoom=18&addressdetails=1`,
            {
              timeout: 8000,
            },
          )
          .catch(() => null), // Fallback if no API key
      ]);

      let bestResult = null;
      let placeName = null;

      // Process Nominatim result
      if (results[0].status === 'fulfilled') {
        const data = results[0].value.data;
        const {address, display_name, namedetails} = data;

        // Extract place name from various sources
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

        // Build short address with house number
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

        // Full detailed address
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

      // If LocationIQ was successful and we don't have a good result, use it
      if (
        !bestResult &&
        results[1].status === 'fulfilled' &&
        results[1].value
      ) {
        const data = results[1].value.data;
        // Process LocationIQ result similar to above
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

    // Date and Time
    const now = new Date();
    setTanggal(now.toLocaleDateString('id-ID'));
    setWaktu(
      now.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'}),
    );

    // Location with MAXIMUM accuracy settings
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location Premission Denied');
      }

      // Multiple location attempts for maximum accuracy
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
                // Accept position if accuracy is very good (< 10m) or after timeout
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
                maximumAge: 0, // Always get fresh location
                distanceFilter: 0, // Get all location updates
                interval: 1000, // Check every second
                fastestInterval: 500, // Fastest update rate
                forceRequestLocation: true,
                showLocationDialog: true, // Android: Show system location dialog
                forceLocationManager: true, // Android: Use LocationManager instead of FusedLocationProvider
              },
            );

            const startTime = Date.now();
          });

          // Keep the most accurate position
          if (
            !bestPosition ||
            position.coords.accuracy < bestPosition.coords.accuracy
          ) {
            bestPosition = position;
          }

          // If we got very high accuracy (< 5m), break early
          if (position.coords.accuracy <= 5) {
            console.log(
              `Excellent accuracy achieved: ${position.coords.accuracy}m`,
            );
            break;
          }

          // Short delay between attempts
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (attemptError) {
          console.log(`Attempt ${attempts} failed:`, attemptError);

          // If this is the last attempt, try with fallback settings
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

      // Get enhanced location details
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

  const handleLaunchCamera = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        includeBase64: true, // Changed to true to get base64
        quality: 0.7,
        maxWidth: 1024,
        maxHeight: 1024,
        saveToPhotos: true,
        cameraType: 'back',
      });

      if (result.didCancel) {
        showMessage({
          message: 'Warning',
          description: 'Taking Photo Canceled',
          type: 'warning',
        });
        return;
      }

      if (result.errorCode || !result.assets?.[0]?.uri) {
        throw new Error(result.errorMessage || 'Failed to take photo');
      }

      const asset = result.assets[0];
      setPhoto({
        uri: asset.uri,
        base64: asset.base64, // Store base64 data
      });

      // Get location after photo is successfully taken
      await fetchDateTimeAndLocation();
    } catch (error) {
      showMessage({
        message: 'Error',
        description: error.message,
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
          'Failed to open Maps: ' + (err.message || 'Map App is not found'),
        type: 'danger',
      }),
    );
  };

  const refreshLocation = async () => {
    if (loading) return;
    await fetchDateTimeAndLocation();
  };

  // File upload handler
  const handleFileUpload = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
        ],
        allowMultiSelection: false,
      });

      const file = result[0];
      
      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        showUploadErrorMessage(validation.error || 'Invalid file');
        return;
      }

      setSelectedFile(file);
      setIsUploadingFile(true);

      try {
        // Upload to Cloudinary
        const fileUrl = await uploadFileToCloudinary(file);
        setUploadedFileUrl(fileUrl);
        
        showUploadSuccessMessage(file.name || 'File');
      } catch (uploadError: any) {
        showUploadErrorMessage(uploadError.message);
        setSelectedFile(null);
      } finally {
        setIsUploadingFile(false);
      }
    } catch (error: any) {
      if (DocumentPicker.isCancel(error)) {
        // User cancelled the picker
        return;
      }
      
      showUploadErrorMessage('Failed to select file: ' + error.message);
    }
  };

  // Remove uploaded file
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadedFileUrl(null);
  };

  // Updated confirmation handler with Firebase Realtime Database and user information
  const handleConfirmation = async () => {
    if (isSubmitting) return; // Prevent multiple submissions

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
      // Get current user information
      const currentUser = getCurrentUser();

      // Get Firebase Realtime Database instance
      const database = getDatabase(app);

      // Save under user's UID for better organization
      const userAttendanceRef = ref(database, `attendance/${currentUser.uid}`);

      // Determine attendance status based on current time
      const attendanceStatus = getAttendanceStatus(waktu);

      // Create submission data with user information
      const submissionData = {
        // User information
        user: {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          phoneNumber: currentUser.phoneNumber,
        },
        // Attendance data
        photo: `data:image/jpeg;base64,${photo.base64}`, // Store as base64 with data URI prefix
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
        keterangan: keterangan.trim(), // Add keterangan field
        status: attendanceStatus, // Add attendance status based on time
        timestamp: Date.now(), // Add timestamp for sorting
        createdAt: new Date().toISOString(), // Human readable timestamp
        // File upload data (optional)
        ...(uploadedFileUrl && selectedFile && {
          uploadedFile: {
            url: uploadedFileUrl,
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
            uploadedAt: new Date().toISOString(),
          },
        }),
        // Additional metadata
        deviceInfo: {
          platform: Platform.OS,
          version: Platform.Version,
        },
      };

      console.log('Submitting data to Firebase for user:', currentUser.email);
      console.log('Attendance status:', attendanceStatus);

      // Save to Firebase Realtime Database under user's UID
      const newAttendanceRef = await push(userAttendanceRef, submissionData);

      console.log('Data successfully saved with ID:', newAttendanceRef.key);

      // Show success message with status information
      showMessage({
        message: 'Success!',
        description: `Data is saved for ${
          currentUser.email || currentUser.displayName
        }\nStatus: ${attendanceStatus}`,
        type: 'success',
        duration: 3000,
      });

      // Navigate back to home page
      setTimeout(() => {
        navigation.navigate('Home');
      }, 1000);
    } catch (error) {
      console.error('Firebase submission error:', error);

      let errorMessage = 'Something went wrong';

      if (error.message === 'User not authenticated') {
        errorMessage = 'User is not authenticated. Please sign in first.';
        // Optionally navigate to login screen
        // navigation.navigate('Login');
      } else {
        errorMessage = `${errorMessage}: ${error.message}`;
      }

      // Show error message with more details
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
              onPress={handleLaunchCamera}
              style={styles.photoContainer}>
              {photo ? (
                <Image
                  source={{uri: photo.uri}}
                  style={styles.photoPreview}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.placeholderText}>Ambil Foto</Text>
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

          <View style={styles.keteranganSection}>
            <Text style={styles.sectionLabel}>Keterangan</Text>
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

          {/* File Upload Section */}
          <View style={styles.fileUploadSection}>
            <Text style={styles.sectionLabel}>Upload File (Opsional)</Text>
            <Text style={styles.fileUploadSubtitle}>
              Upload dokumen pendukung (PDF, DOC, DOCX - Max 5MB)
            </Text>
            
            {selectedFile ? (
              <View style={styles.selectedFileContainer}>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{selectedFile.name}</Text>
                  <Text style={styles.fileSize}>
                    {getFileDisplayInfo(selectedFile).size} • {getFileDisplayInfo(selectedFile).extension}
                  </Text>
                  {uploadedFileUrl && (
                    <Text style={styles.uploadStatus}>✓ Uploaded to cloud</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={handleRemoveFile}
                  style={styles.removeFileButton}
                  disabled={isUploadingFile}>
                  <Text style={styles.removeFileText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleFileUpload}
                style={styles.fileUploadButton}
                disabled={isUploadingFile}>
                {isUploadingFile ? (
                  <View style={styles.uploadingContainer}>
                    <ActivityIndicator size="small" color="#0066CC" />
                    <Text style={styles.uploadingText}>Uploading...</Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.fileUploadIcon}>📎</Text>
                    <Text style={styles.fileUploadText}>Pilih File</Text>
                    <Text style={styles.fileUploadSubtext}>
                      Tap untuk memilih dokumen
                    </Text>
                  </>
                )}
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
    marginTop: 20,
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
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
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
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
  },
  dateTimeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#f9f9f9',
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
    backgroundColor: '#f8fff8',
  },
  lowAccuracyBox: {
    borderColor: '#FF9800',
    backgroundColor: '#fffbf0',
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
  },
  placeholderText: {
    color: '#999',
    textAlign: 'center',
    fontSize: 16,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
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
    marginTop: 5,
  },
  // File upload styles
  fileUploadSection: {
    marginTop: 20,
  },
  fileUploadSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    marginBottom: 15,
  },
  selectedFileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  uploadStatus: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  removeFileButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#dc3545',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  removeFileText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fileUploadButton: {
    borderWidth: 2,
    borderColor: '#0066CC',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9ff',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  uploadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#0066CC',
  },
  fileUploadIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  fileUploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC',
    marginBottom: 4,
  },
  fileUploadSubtext: {
    fontSize: 12,
    color: '#666',
  },
});

export default Scan;