import { SafeAreaView, ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import React from 'react';
import { Button, ButtonNavAdmin, Header } from '../../components';
// Import Firebase functions - adjust the import path based on your Firebase setup
import { doc, updateDoc, getFirestore } from 'firebase/firestore';

// Updated UserDetailsCard component
const UserDetailsCard = ({ userData }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>User's details</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{userData?.fullName || 'Unknown User'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>NIP:</Text>
        <Text style={styles.value}>{userData?.NIP || 'Not specified'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Department:</Text>
        <Text style={styles.value}>{userData?.department || 'Not specified'}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{userData?.email || 'No email'}</Text>
      </View>
    </View>
  );
};

// Updated ScanDetailsCard component
const ScanDetailsCard = ({ attendanceData, userData, onStatusUpdate, onMapPress }) => {
  const [status, setStatus] = React.useState('Present');
  const [showStatusDropdown, setShowStatusDropdown] = React.useState(false);

  const statusOptions = ['Present', 'Late', 'Excused', 'Unexcused'];

  // Update status based on attendance time when component mounts
  React.useEffect(() => {
    if (attendanceData?.status) {
      setStatus(attendanceData.status);
    } else if (attendanceData?.waktu) {
      const calculatedStatus = getAttendanceStatus(attendanceData.waktu);
      setStatus(calculatedStatus);
    }
  }, [attendanceData]);

  const getAttendanceStatus = (waktu) => {
    if (!waktu) return 'Unexcused';
    
    const [hours, minutes] = waktu.split(':').map(num => parseInt(num));
    const timeInMinutes = hours * 60 + minutes;
    const onTimeThreshold = 8 * 60; // 8:00 AM
    const lateThreshold = 8 * 60 + 30; // 8:30 AM
    
    if (timeInMinutes <= onTimeThreshold) {
      return 'Present';
    } else if (timeInMinutes <= lateThreshold) {
      return 'Late';
    } else {
      return 'Late';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Present':
        return {
          badge: { backgroundColor: '#B4FFB1' },
          text: { color: '#2B6000' },
        };
      case 'Late':
        return {
          badge: { backgroundColor: '#FFF3B1' },
          text: { color: '#8A6E00' },
        };
      case 'Excused':
        return {
          badge: { backgroundColor: '#B1D6FF' },
          text: { color: '#004E8A' },
        };
      case 'Unexcused':
        return {
          badge: { backgroundColor: '#FFB1B1' },
          text: { color: '#8A0000' },
        };
      default:
        return {
          badge: { backgroundColor: '#CCCCCC' },
          text: { color: '#333333' },
        };
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not recorded';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (waktu) => {
    if (!waktu) return 'Not recorded';
    // Convert 24-hour format to 12-hour format
    const [hours, minutes] = waktu.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleStatusUpdate = (newStatus) => {
    setStatus(newStatus);
    setShowStatusDropdown(false);
    if (onStatusUpdate) {
      onStatusUpdate(newStatus);
    }
  };

  const openMaps = () => {
    if (!attendanceData?.location?.latitude || !attendanceData?.location?.longitude) {
      Alert.alert('Location Not Available', 'No location coordinates found for this attendance record.');
      return;
    }

    const { latitude, longitude } = attendanceData.location;
    const label = attendanceData.location.placeName || attendanceData.location.address || 'Attendance Location';
    
    const scheme = Platform.select({ 
      ios: 'maps:0,0?q=', 
      android: 'geo:0,0?q=' 
    });
    const latLng = `${latitude},${longitude}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    // Try to open native maps first, fallback to Google Maps web
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback to Google Maps web
          const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
          return Linking.openURL(googleMapsUrl);
        }
      })
      .catch((err) => {
        console.error('Failed to open maps:', err);
        Alert.alert('Error', 'Unable to open maps application.');
      });
  };

  const formatLocationDisplay = () => {
    if (!attendanceData?.location) return 'Not recorded';
    
    const { placeName, address } = attendanceData.location;
    
    if (placeName && address) {
      return `${placeName}, ${address}`;
    } else if (placeName) {
      return placeName;
    } else if (address) {
      return address;
    }
    
    return 'Location recorded';
  };

  return (
    <View style={styles.scanCard}>
      <Text style={styles.title}>Scan details</Text>

      <View style={styles.rowBetween}>
        <View style={styles.textSection}>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {attendanceData?.tanggal || formatDate(attendanceData?.timestamp)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>
              {formatTime(attendanceData?.waktu)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                style={styles.dropdownContainer}
                onPress={() => setShowStatusDropdown(!showStatusDropdown)}>
                <Text style={styles.dropdownText}>{status}</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
              
              {showStatusDropdown && (
                <View style={styles.dropdownOptions}>
                  {statusOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownOption}
                      onPress={() => handleStatusUpdate(option)}>
                      <Text style={styles.dropdownOptionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.locationValue} numberOfLines={2}>
              {formatLocationDisplay()}
            </Text>
          </View>
        </View>

        {/* Clickable location/map image box */}
        <TouchableOpacity 
          style={styles.smallImageBox}
          onPress={openMaps}
          activeOpacity={0.7}
        >
          <Text style={styles.mapIcon}>📍</Text>
          <Text style={styles.placeholderText}>Open Map</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.statusBadge, getStatusStyle(status).badge]}>
        <Text style={[styles.statusText, getStatusStyle(status).text]}>
          {status}
        </Text>
      </View>
    </View>
  );
};

// Main UserDetail component
const UserDetail = ({ route, navigation }) => {
  const { 
    userId, 
    name, 
    nip, 
    department, 
    email, 
    attendanceData, 
    userData,
    attendanceId // Make sure this is passed from the previous screen
  } = route.params || {};

  const [currentStatus, setCurrentStatus] = React.useState(attendanceData?.status || 'Present');
  const [isUpdating, setIsUpdating] = React.useState(false);

  const db = getFirestore();

  const updateAttendanceInFirebase = async (status, confirmed = false) => {
    if (!attendanceId) {
      Alert.alert('Error', 'Attendance ID not found. Cannot update record.');
      return false;
    }

    try {
      setIsUpdating(true);
      
      const attendanceRef = doc(db, 'attendance', attendanceId); // Adjust collection name as needed
      const updateData = {
        status: status,
        lastModified: new Date().toISOString(),
        modifiedBy: 'admin', // You might want to get this from user context
      };

      if (confirmed) {
        updateData.confirmed = true;
        updateData.confirmedAt = new Date().toISOString();
      }

      await updateDoc(attendanceRef, updateData);
      
      console.log('Attendance updated successfully:', { attendanceId, status, confirmed });
      return true;
    } catch (error) {
      console.error('Error updating attendance:', error);
      Alert.alert('Update Failed', 'Failed to update attendance record. Please try again.');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setCurrentStatus(newStatus);
    
    // Update in Firebase immediately when status changes
    await updateAttendanceInFirebase(newStatus, false);
  };

  const handleConfirm = async () => {
    if (isUpdating) {
      Alert.alert('Please Wait', 'Update in progress...');
      return;
    }

    Alert.alert(
      'Confirm Attendance',
      `Are you sure you want to confirm this attendance record with status "${currentStatus}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            const success = await updateAttendanceInFirebase(currentStatus, true);
            if (success) {
              Alert.alert(
                'Success',
                'Attendance record has been confirmed successfully.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Header text="User Details"/>
          
          {/* Large attendance photo */}
          <View style={styles.imageContainer}>
            {attendanceData?.photo ? (
              <Image
                source={{ uri: attendanceData.photo }}
                style={styles.imageBox}
                resizeMode="cover"
                onError={(err) => {
                  console.error('Attendance image load error:', err);
                }}
              />
            ) : attendanceData?.photoBase64 ? (
              <Image
                source={{ uri: attendanceData.photoBase64 }}
                style={styles.imageBox}
                resizeMode="cover"
                onError={(err) => {
                  console.error('Attendance image load error:', err);
                }}
              />
            ) : (
              <View style={[styles.imageBox, styles.placeholderImageBox]}>
                <Text style={styles.placeholderImageText}>No Attendance Photo</Text>
              </View>
            )}
          </View>

          <View>
            <UserDetailsCard userData={userData || { fullName: name, NIP: nip, department, email }} />
            <ScanDetailsCard 
              attendanceData={attendanceData} 
              userData={userData}
              onStatusUpdate={handleStatusUpdate}
            />
          </View>
          
          <Button 
            text={isUpdating ? "Updating..." : "Confirm"} 
            onPress={handleConfirm}
            disabled={isUpdating}
          />
        </ScrollView>
        <ButtonNavAdmin navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

export default UserDetail;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 130,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  imageBox: {
    width: 306,
    height: 306,
    backgroundColor: '#CCCCCC',
    borderRadius: 12,
  },
  placeholderImageBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImageText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  // UserDetailsCard styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    color: '#999',
    marginBottom: 12,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  label: {
    fontFamily: 'Poppins-Bold',
    width: 90,
    fontSize: 14,
    color: '#333',
  },
  value: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  locationValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  // ScanDetailsCard styles
  scanCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    marginHorizontal: 18,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textSection: {
    flex: 1,
    paddingRight: 12,
  },
  smallImageBox: {
    width: 80,
    height: 80,
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4a90e2',
    borderStyle: 'dashed',
  },
  mapIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  placeholderText: {
    fontSize: 10,
    color: '#4a90e2',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
  dropdownWrapper: {
    flex: 1,
    position: 'relative',
  },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#C0C0C0',
    height: 35,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#666',
  },
  dropdownOptions: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C0C0C0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1000,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownOptionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
});