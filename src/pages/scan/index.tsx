import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput as RNTextInput,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import React, {useState} from 'react';
import {Button, Buttonnavigation, Header} from '../../components';
import {launchCamera} from 'react-native-image-picker';
import {showMessage} from 'react-native-flash-message';
import Geolocation from 'react-native-geolocation-service';
import MapView, {Marker} from 'react-native-maps';

const Scan = ({navigation}: {navigation: any}) => {
  const [tanggal, setTanggal] = useState('');
  const [waktu, setWaktu] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

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
            Geolocation.getCurrentPosition(
              position => {
                setLocation({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                });
              },
              error => {
                console.log(error.code, error.message);
                showMessage({
                  message: 'Failed to get location',
                  type: 'warning',
                });
              },
              {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
            );
          }
        }
      },
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header text="Absensi" />
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
                {location ? (
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: location.latitude,
                      longitude: location.longitude,
                      latitudeDelta: 0.005,
                      longitudeDelta: 0.005,
                    }}>
                    <Marker
                      coordinate={{
                        latitude: location.latitude,
                        longitude: location.longitude,
                      }}
                    />
                  </MapView>
                ) : (
                  <Text style={styles.locationPlaceholderText}>
                    Location will appear here
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
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  photoPlaceholderText: {
    fontFamily: 'Poppins-Regular',
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
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationPlaceholderText: {
    fontFamily: 'Poppins-Regular',
    color: '#666666',
    textAlign: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
//change1
