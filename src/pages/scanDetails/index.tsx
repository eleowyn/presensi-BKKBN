import { SafeAreaView, ScrollView, StyleSheet, Text, View, Image, TouchableOpacity, Linking, Platform, Alert } from 'react-native';
import React from 'react';
import { Buttonnavigation, Header } from '../../components';
import { autoFixCloudinaryUrl, getFileTypeFromUrl } from '../../utils/fileUpload';

interface LocationData {
  address?: string;
  fullAddress?: string;
  accuracy?: number;
  isHighAccuracy?: boolean;
  placeName?: string;
  latitude?: number;
  longitude?: number;
}

interface AttendanceData {
  id: string;
  tanggal?: string;
  waktu?: string;
  location?: LocationData;
  timestamp?: number;
  photo?: string;
  photoBase64?: string;
  status?: string;
  keterangan?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: string;
  // New structure from scan page
  uploadedFile?: {
    url: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
  };
  // Additional fields from scan page
  kegiatan?: string;
  additionalImages?: Array<{
    data: string;
    index: number;
    uploadedAt: string;
  }>;
}

// ScanDetailsCard component for read-only display
const ScanDetailsCard = ({ attendanceData, navigation }: { attendanceData: AttendanceData; navigation: any }) => {
  const getStatusStyle = (status: string) => {
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

  const formatDate = (timestamp: number): string => {
    if (!timestamp) return 'Not recorded';
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (waktu: string): string => {
    if (!waktu || waktu === 'undefined' || waktu.trim() === '') {
      return 'Not recorded';
    }
    
    try {
      // Handle different time formats
      let timeString = waktu.toString().trim();
      
      // Check if it contains colon or dot separator
      if (!timeString.includes(':') && !timeString.includes('.')) {
        return 'Not recorded';
      }
      
      // Replace dot with colon for Indonesian format
      timeString = timeString.replace('.', ':');
      
      const timeParts = timeString.split(':');
      if (timeParts.length < 2) {
        return 'Not recorded';
      }
      
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      
      // Validate hours and minutes
      if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        return 'Not recorded';
      }
      
      // Convert 24-hour format to 12-hour format
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedMinutes = minutes.toString().padStart(2, '0');
      
      return `${hour12}:${formattedMinutes} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Not recorded';
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
    }) || 'geo:0,0?q=';
    const latLng = `${latitude},${longitude}`;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    }) || `${scheme}${latLng}(${label})`;

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

  const openFile = () => {
    // Check for file in both old and new structure
    const fileUrl = attendanceData?.uploadedFile?.url || attendanceData?.fileUrl;
    const fileName = attendanceData?.uploadedFile?.name || attendanceData?.fileName;
    const fileType = attendanceData?.uploadedFile?.type || attendanceData?.fileType;
    const fileSize = attendanceData?.uploadedFile?.size ? 
      `${(attendanceData.uploadedFile.size / (1024 * 1024)).toFixed(2)} MB` : 
      attendanceData?.fileSize;

    if (!fileUrl) {
      Alert.alert('File Not Available', 'No file was uploaded for this attendance record.');
      return;
    }

    try {
      // Fix the Cloudinary URL if needed
      const correctedFileUrl = autoFixCloudinaryUrl(fileUrl);
      
      // Determine file type from URL if not provided
      const detectedFileType = fileType || getFileTypeFromUrl(fileUrl);
      
      console.log('Opening file:', {
        originalUrl: fileUrl,
        correctedUrl: correctedFileUrl,
        fileName: fileName,
        fileType: detectedFileType,
        fileSize: fileSize
      });
      
      // Navigate to FilePreview page for better preview experience
      if (navigation) {
        navigation.navigate('FilePreview', {
          fileUrl: correctedFileUrl,
          fileName: fileName || 'Uploaded File',
          fileType: detectedFileType,
          fileSize: fileSize || 'Unknown size',
        });
      } else {
        // Fallback to opening with external app
        Linking.canOpenURL(correctedFileUrl)
          .then((supported) => {
            if (supported) {
              return Linking.openURL(correctedFileUrl);
            } else {
              Alert.alert('Error', 'Unable to open the file.');
            }
          })
          .catch((err) => {
            console.error('Failed to open file:', err);
            Alert.alert('Error', 'Unable to open the file.');
          });
      }
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert('Error', 'Unable to open the file.');
    }
  };

  const formatLocationDisplay = () => {
    if (!attendanceData?.location) return 'Not recorded';
    
    const { placeName, address, fullAddress } = attendanceData.location;
    
    // Show location name first, then full address information
    if (placeName && fullAddress) {
      return `${placeName}\n${fullAddress}`;
    } else if (placeName && address) {
      return `${placeName}\n${address}`;
    } else if (fullAddress) {
      return fullAddress;
    } else if (placeName) {
      return placeName;
    } else if (address) {
      return address;
    }
    
    return 'Location recorded';
  };

  const currentStatus = attendanceData?.status || 'Unknown';

  return (
    <View style={styles.scanCard}>
      <Text style={styles.title}>Scan Details</Text>

      <View style={styles.rowBetween}>
        <View style={styles.textSection}>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>
              {attendanceData?.tanggal || formatDate(attendanceData?.timestamp || 0)}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>
              {formatTime(attendanceData?.waktu || '')}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={[styles.value, styles.statusValue]}>
              {currentStatus}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Location:</Text>
            <Text style={styles.locationValue} numberOfLines={3}>
              {formatLocationDisplay()}
            </Text>
          </View>

          {attendanceData?.kegiatan && (
            <View style={styles.row}>
              <Text style={styles.label}>Activity:</Text>
              <Text style={styles.value}>
                {attendanceData.kegiatan === 'rapat' ? 'Rapat' : 
                 attendanceData.kegiatan === 'dinas luar' ? 'Dinas Luar' : 
                 attendanceData.kegiatan}
              </Text>
            </View>
          )}

          {attendanceData?.keterangan && (
            <View style={styles.row}>
              <Text style={styles.label}>Note:</Text>
              <Text style={styles.value} numberOfLines={3}>
                {attendanceData.keterangan}
              </Text>
            </View>
          )}

          {(attendanceData?.uploadedFile?.url || attendanceData?.fileUrl) && (
            <View style={styles.row}>
              <Text style={styles.label}>File:</Text>
              <TouchableOpacity onPress={openFile}>
                <Text style={styles.fileLink}>
                  {attendanceData?.uploadedFile?.name || attendanceData?.fileName || 'View Uploaded File'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
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

// Main ScanDetails component
const ScanDetails = ({ route, navigation }: { route: any; navigation: any }) => {
  const { attendanceData } = route.params || {};

  // Add error boundary for rendering
  if (!attendanceData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.contentWrapper}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            <Header text="Scan Details"/>
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>No scan data available</Text>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <Buttonnavigation navigation={navigation} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Header text="Scan Details"/>
          
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
                <Text style={styles.placeholderImageText}>No Scan Photo</Text>
              </View>
            )}
          </View>

          <ScanDetailsCard attendanceData={attendanceData} navigation={navigation} />
          
          {/* Additional Images Gallery */}
          {attendanceData?.additionalImages && attendanceData.additionalImages.length > 0 && (
            <View style={styles.additionalImagesSection}>
              <Text style={styles.sectionTitle}>Additional Images</Text>
              <View style={styles.imagesGrid}>
                {attendanceData.additionalImages.map((imageItem: {data: string; index: number; uploadedAt: string}, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.additionalImageContainer}
                    onPress={() => {
                      Alert.alert(
                        'Image Preview',
                        `Image ${imageItem.index || index + 1}`,
                        [
                          {
                            text: 'Close',
                            style: 'cancel',
                          },
                        ]
                      );
                    }}
                  >
                    <Image
                      source={{ uri: imageItem.data }}
                      style={styles.additionalImage}
                      resizeMode="cover"
                      onError={(err) => {
                        console.error('Additional image load error:', err);
                      }}
                    />
                    <View style={styles.imageIndexBadge}>
                      <Text style={styles.imageIndexText}>{imageItem.index || index + 1}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
        <Buttonnavigation navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

export default ScanDetails;

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
  backButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
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
  },
  title: {
    fontFamily: 'Poppins-Medium',
    color: '#777',
    marginBottom: 12,
    fontSize: 14,
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
  row: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  label: {
    fontFamily: 'Poppins-Bold',
    width: 70,
    fontSize: 14,
    color: '#333',
  },
  value: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  statusValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 14,
  },
  locationValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#000',
    flex: 1,
  },
  fileLink: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
    flex: 1,
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
  // Additional Images Gallery styles
  additionalImagesSection: {
    marginHorizontal: 18,
    marginVertical: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#333',
    marginBottom: 12,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  additionalImageContainer: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f0f0f0',
  },
  additionalImage: {
    width: '100%',
    height: '100%',
  },
  imageIndexBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndexText: {
    color: '#fff',
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
  },
});
