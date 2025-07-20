import { SafeAreaView, ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import React from 'react';
import { Button, ButtonNavAdmin, Header } from '../../components';
// Import Firebase Realtime Database functions - following Scan component pattern
import { getDatabase, ref, update, get } from 'firebase/database';
import { getAuth } from 'firebase/auth';
import app from '../../config/Firebase'; // Adjust path as needed

// Move getAttendanceStatus function outside the component
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

// Updated UserDetailsCard component
const UserDetailsCard = ({ userData }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>User's details</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>{userData?.fullName || userData?.displayName || 'Unknown User'}</Text>
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

// Updated ScanDetailsCard component with improved status handling
const ScanDetailsCard = ({ attendanceData, userData, onStatusUpdate, currentStatus }) => {
  const [showStatusDropdown, setShowStatusDropdown] = React.useState(false);

  const statusOptions = ['Present', 'Late', 'Excused', 'Unexcused'];

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
    
    const { placeName, address, fullAddress } = attendanceData.location;
    
    if (placeName && address) {
      return `${placeName}, ${address}`;
    } else if (placeName) {
      return placeName;
    } else if (address) {
      return address;
    } else if (fullAddress) {
      return fullAddress;
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
                <Text style={styles.dropdownText}>{currentStatus}</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
              
              {showStatusDropdown && (
                <View style={styles.dropdownOptions}>
                  {statusOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownOption,
                        index === statusOptions.length - 1 && { borderBottomWidth: 0 }
                      ]}
                      onPress={() => handleStatusUpdate(option)}>
                      <Text style={[
                        styles.dropdownOptionText,
                        currentStatus === option && { fontFamily: 'Poppins-Bold', color: '#007AFF' }
                      ]}>
                        {option}
                      </Text>
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

      <View style={[styles.statusBadge, getStatusStyle(currentStatus).badge]}>
        <Text style={[styles.statusText, getStatusStyle(currentStatus).text]}>
          {currentStatus}
        </Text>
      </View>
    </View>
  );
};

// Main UserDetail component with improved Firebase integration
const UserDetail = ({ route, navigation }) => {
  const { 
    userId, 
    name, 
    nip, 
    department, 
    email, 
    attendanceData, 
    userData,
    attendanceId, 
    attendanceKey 
  } = route.params || {};

  // Initialize status based on attendance data or calculate from time
  const getInitialStatus = () => {
    // Check if attendanceData exists and has necessary properties
    if (!attendanceData) {
      console.warn('No attendance data provided');
      return 'Present';
    }

    // First priority: use existing status from database
    if (attendanceData.status) {
      return attendanceData.status;
    }
    
    // Second priority: calculate from time if available
    if (attendanceData.waktu) {
      try {
        return getAttendanceStatus(attendanceData.waktu);
      } catch (error) {
        console.error('Error calculating status from time:', error);
        return 'Present';
      }
    }
    
    // Default fallback
    return 'Present';
  };

  const [currentStatus, setCurrentStatus] = React.useState(getInitialStatus());
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false);

  // Get current admin user
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

  // Update attendance status in Firebase Realtime Database
  const updateAttendanceInFirebase = async (status, confirmed = false) => {
    const finalAttendanceKey = attendanceId || attendanceKey;
    
    if (!finalAttendanceKey) {
      Alert.alert('Error', 'Attendance ID not found. Cannot update record.');
      return false;
    }

    const targetUserId = userData?.uid || userId;
    if (!targetUserId) {
      Alert.alert('Error', 'User ID not found. Cannot update record.');
      return false;
    }

    try {
      setIsUpdating(true);
      
      const database = getDatabase(app);
      const currentUser = getCurrentUser();
      
      // Create reference to the specific attendance record
      const attendanceRef = ref(database, `attendance/${targetUserId}/${finalAttendanceKey}`);
      
      // First, check if the record exists
      const snapshot = await get(attendanceRef);
      if (!snapshot.exists()) {
        Alert.alert('Error', 'Attendance record not found in database.');
        return false;
      }

      // Prepare update data
      const updateData = {
        status: status,
        lastModified: new Date().toISOString(),
        modifiedBy: currentUser.email || 'admin',
      };

      if (confirmed) {
        updateData.confirmed = true;
        updateData.confirmedAt = new Date().toISOString();
        updateData.confirmedBy = currentUser.email || 'admin';
      }

      // Update the record in Firebase Realtime Database
      await update(attendanceRef, updateData);
      
      console.log('Attendance updated successfully:', { 
        userId: targetUserId, 
        attendanceKey: finalAttendanceKey, 
        status, 
        confirmed,
        timestamp: new Date().toISOString()
      });
      
      // Reset unsaved changes flag after successful update
      setHasUnsavedChanges(false);
      
      return true;
    } catch (error) {
      console.error('Error updating attendance:', error);
      
      let errorMessage = 'Failed to update attendance record. Please try again.';
      
      if (error.message === 'User not authenticated') {
        errorMessage = 'Admin user not authenticated. Please login again.';
      } else if (error.code === 'PERMISSION_DENIED') {
        errorMessage = 'Permission denied. You may not have access to update this record.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      Alert.alert('Update Failed', errorMessage);
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle status change from dropdown
  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === currentStatus) {
      return; // No change needed
    }

    setCurrentStatus(newStatus);
    setHasUnsavedChanges(true);
    
    // Show immediate feedback
    Alert.alert(
      'Status Updated',
      `Status changed to "${newStatus}". Don't forget to confirm to save changes.`,
      [{ text: 'OK' }]
    );
  };

  // Handle confirm button press
  const handleConfirm = async () => {
    if (isUpdating) {
      Alert.alert('Please Wait', 'Update in progress...');
      return;
    }

    const statusText = hasUnsavedChanges 
      ? `confirm this attendance record with the new status "${currentStatus}"` 
      : `confirm this attendance record with status "${currentStatus}"`;

    Alert.alert(
      'Confirm Attendance',
      `Are you sure you want to ${statusText}?`,
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
                'Attendance record has been confirmed and saved successfully.',
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

  // Handle back button press with unsaved changes
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges) {
        return; // No unsaved changes, allow navigation
      }

      // Prevent default behavior of leaving the screen
      e.preventDefault();

      // Prompt the user before leaving the screen
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure you want to discard them and leave?',
        [
          { text: "Don't leave", style: 'cancel', onPress: () => {} },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

  // Add error boundary for rendering
  if (!attendanceData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.contentWrapper}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <Header text="User Details"/>
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>No attendance data available</Text>
              <Button 
                text="Go Back" 
                onPress={() => navigation.goBack()}
              />
            </View>
          </ScrollView>
          <ButtonNavAdmin navigation={navigation} />
        </View>
      </SafeAreaView>
    );
  }

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
              currentStatus={currentStatus}
            />
          </View>
          
          <Button 
            text={isUpdating ? "Updating..." : hasUnsavedChanges ? "Confirm Changes" : "Confirm"} 
            onPress={handleConfirm}
            disabled={isUpdating}
          />

          {hasUnsavedChanges && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ You have unsaved changes. Confirm to save them.
              </Text>
            </View>
          )}
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 20,
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
    elevation: 5,
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
  warningContainer: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
    marginTop: 8,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
});