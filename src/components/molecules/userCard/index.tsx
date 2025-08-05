import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import {getDatabase, ref, onValue, off} from 'firebase/database';
import {getAuth} from 'firebase/auth';
import app from '../../../config/Firebase'; // Adjust path as needed
import {showMessage} from 'react-native-flash-message';

interface LocationData {
  address?: string;
  fullAddress?: string;
  accuracy?: number;
  isHighAccuracy?: boolean;
  placeName?: string;
}

interface AttendanceItem {
  id: string;
  tanggal?: string;
  waktu?: string;
  location?: LocationData;
  timestamp?: number;
  photo?: string;
  status?: string; // Added status field
  keterangan?: string; // Added keterangan field
}

const Card = ({ navigation }: { navigation?: any }) => {
  const [attendanceData, setAttendanceData] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get current user
  const getCurrentUser = () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        return null;
      }

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  };

  // Convert timestamp to readable date
  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Fetch attendance data from Firebase
  const fetchAttendanceData = () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      setLoading(false);
      showMessage({
        message: 'Error',
        description: 'User is not authenticated. Please login',
        type: 'danger',
      });
      return null;
    }

    try {
      const database = getDatabase(app);
      const userAttendanceRef = ref(database, `attendance/${currentUser.uid}`);

      // Listen for data changes
      const unsubscribe = onValue(
        userAttendanceRef,
        snapshot => {
          try {
            const data = snapshot.val();

            if (data) {
              // Convert object to array and sort by timestamp (newest first)
              const attendanceArray: AttendanceItem[] = Object.keys(data)
                .map(key => ({
                  id: key,
                  ...data[key],
                  // Ensure status is included from Firebase data
                  status: data[key].status || 'Unknown',
                }))
                .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

              setAttendanceData(attendanceArray);
            } else {
              setAttendanceData([]);
            }

            setLoading(false);
            setRefreshing(false);
          } catch (error) {
            console.error('Error processing attendance data:', error);
            setAttendanceData([]);
            setLoading(false);
            setRefreshing(false);
          }
        },
        error => {
          console.error('Firebase fetch error:', error);
          showMessage({
            message: 'Error',
            description: 'Failed to get data' + error.message,
            type: 'danger',
          });
          setLoading(false);
          setRefreshing(false);
        },
      );

      // Return cleanup function that properly removes the listener
      return () => {
        try {
          off(userAttendanceRef, 'value', unsubscribe);
        } catch (error) {
          console.error('Error removing Firebase listener:', error);
        }
      };
    } catch (error) {
      console.error('Error setting up Firebase listener:', error);
      setLoading(false);
      setRefreshing(false);
      return null;
    }
  };

  useEffect(() => {
    let cleanup: (() => void) | null = null;

    try {
      cleanup = fetchAttendanceData();
    } catch (error) {
      console.error('Error in useEffect:', error);
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        try {
          cleanup();
        } catch (error) {
          console.error('Error during cleanup:', error);
        }
      }
    };
  }, []);

  // Handle refresh
  const onRefresh = () => {
    setRefreshing(true);
    try {
      fetchAttendanceData();
    } catch (error) {
      console.error('Error during refresh:', error);
      setRefreshing(false);
    }
  };

  // Get status style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Present':
        return {
          badge: {backgroundColor: '#B4FFB1'},
          text: {color: '#2B6000'},
        };
      case 'Late':
        return {
          badge: {backgroundColor: '#FFF3B1'},
          text: {color: '#8A6E00'},
        };
      case 'Excused':
        return {
          badge: {backgroundColor: '#B1D6FF'},
          text: {color: '#004E8A'},
        };
      case 'Unexcused':
        return {
          badge: {backgroundColor: '#FFB1B1'},
          text: {color: '#8A0000'},
        };
      default:
        return {
          badge: {backgroundColor: '#CCCCCC'},
          text: {color: '#333333'},
        };
    }
  };

  // Handle card press to navigate to scan details
  const handleCardPress = (item: AttendanceItem) => {
    try {
      if (navigation) {
        navigation.navigate('ScanDetails', {
          attendanceData: item,
        });
      } else {
        // Fallback to Alert if navigation is not available
        Alert.alert(
          'Detail Absensi',
          `Status: ${item.status || 'Tidak diketahui'}\nTanggal: ${
            item.tanggal || 'Tidak diketahui'
          }\nWaktu: ${item.waktu || 'Tidak diketahui'}\nLokasi: ${
            item.location?.address || 'Tidak diketahui'
          }\nAlamat Lengkap: ${
            item.location?.fullAddress || 'Tidak diketahui'
          }\nAkurasi: ±${
            item.location?.accuracy?.toFixed(1) || 0
          }m\nStatus Akurasi: ${
            item.location?.isHighAccuracy ? 'Tinggi' : 'Rendah'
          }`,
          [
            {
              text: 'Tutup',
              style: 'cancel',
            },
          ],
        );
      }
    } catch (error) {
      console.error('Error navigating to scan details:', error);
      showMessage({
        message: 'Error',
        description: 'Failed to open scan details',
        type: 'danger',
      });
    }
  };

  // Render single card item
  const renderCardItem = ({item}: {item: AttendanceItem}) => {
    try {
      const status = item.status || 'Unknown';
      const displayLocation = item.location?.placeName
        ? `${item.location.placeName}`
        : item.location?.address || 'Location Unknown';

      return (
        <TouchableOpacity onPress={() => handleCardPress(item)}>
          <View style={styles.card}>
            <View style={[styles.statusBadge, getStatusStyle(status).badge]}>
              <Text style={[styles.statusText, getStatusStyle(status).text]}>
                {status}
              </Text>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.textSection}>
                <View style={styles.row}>
                  <Text style={styles.label}>Date:</Text>
                  <Text style={styles.value}>
                    {item.tanggal || 'Tidak diketahui'}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Location:</Text>
                  <Text
                    style={styles.value}
                    numberOfLines={2}
                    ellipsizeMode="tail">
                    {displayLocation}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Time:</Text>
                  <Text style={styles.value}>
                    {item.waktu || 'Tidak diketahui'}
                  </Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>Accuracy:</Text>
                  <Text
                    style={[
                      styles.value,
                      item.location?.isHighAccuracy
                        ? styles.highAccuracy
                        : styles.lowAccuracy,
                    ]}>
                    {item.location?.isHighAccuracy ? 'Tinggi' : 'Rendah'} (±
                    {item.location?.accuracy?.toFixed(1) || 0}m)
                  </Text>
                </View>

                {item.keterangan && (
                  <View style={styles.row}>
                    <Text style={styles.label}>Note:</Text>
                    <Text
                      style={styles.value}
                      numberOfLines={2}
                      ellipsizeMode="tail">
                      {item.keterangan}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.imageContainer}>
                {item.photo ? (
                  <Image
                    source={{uri: item.photo}}
                    style={styles.imageBox}
                    resizeMode="cover"
                    onError={error => {
                      console.error('Image load error:', error);
                    }}
                  />
                ) : (
                  <View style={[styles.imageBox, styles.noImageBox]}>
                    <Text style={styles.noImageText}>No Photo</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      );
    } catch (error) {
      console.error('Error rendering card item:', error);
      return (
        <View style={styles.card}>
          <Text style={styles.errorText}>Error loading attendance record</Text>
        </View>
      );
    }
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Belum Ada Data Absensi</Text>
      <Text style={styles.emptySubtitle}>
        Lakukan absensi pertama Anda untuk melihat riwayat di sini
      </Text>
    </View>
  );

  // Show loading indicator
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Memuat data absensi...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={attendanceData}
        renderItem={renderCardItem}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0000ff']}
          />
        }
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={
          attendanceData.length === 0 ? styles.emptyListContainer : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 7,
    borderColor: '#E8E8E8',
    borderWidth: 1,
  },
  statusBadge: {
    backgroundColor: '#B4FFB1',
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 37,
    marginBottom: 16,
    width: 100,
  },
  statusText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#2B6000',
    fontSize: 12,
    alignSelf: 'center',
    fontWeight: '600',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textSection: {
    flex: 1,
    paddingRight: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  label: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#333333',
    fontWeight: '600',
    width: 80,
  },
  value: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
    flex: 1,
  },
  highAccuracy: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  lowAccuracy: {
    color: '#FF9800',
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
  },
  imageBox: {
    width: 130,
    height: 130,
    backgroundColor: '#D1D5DB',
    borderRadius: 12,
  },
  noImageBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#999',
    fontSize: 12,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
});

export default Card;
