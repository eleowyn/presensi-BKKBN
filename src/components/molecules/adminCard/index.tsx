import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getDatabase, ref, onValue} from 'firebase/database';

interface UserData {
  fullName?: string;
  email?: string;
  department?: string;
  NIP?: string;
  startDate?: string;
  profilePictureBase64?: string;
  role?: string;
  uid?: string;
}

interface AttendanceData {
  tanggal?: string;
  waktu?: string;
  location?: {
    address?: string;
    accuracy?: number;
    isHighAccuracy?: boolean;
  };
  timestamp?: number;
  attendanceKey?: string; // Add this to store the key
}

interface AdminCardProps {
  userId: string;
  onPress?: () => void;
}

const AdminCard = ({userId, onPress}: AdminCardProps) => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceData | null>(null);
  const [attendanceKey, setAttendanceKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTodayDate = () => {
    try {
      const today = new Date();
      return today.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (err) {
      console.error('Error getting today date:', err);
      return new Date().toISOString().split('T')[0];
    }
  };

  const getAttendanceStatus = (waktu?: string): string => {
    try {
      if (!todayAttendance || !waktu) {
        return 'Absent';
      }
      
      const [hours, minutes] = waktu.split(':').map(num => parseInt(num));
      const timeInMinutes = hours * 60 + minutes;
      const onTimeThreshold = 8 * 60;
      const lateThreshold = 8 * 60 + 30;
      
      if (timeInMinutes <= onTimeThreshold) {
        return 'Present';
      } else if (timeInMinutes <= lateThreshold) {
        return 'Late';
      } else {
        return 'Late';
      }
    } catch (err) {
      console.error('Error calculating attendance status:', err);
      return 'Unknown';
    }
  };

  const createFallbackUserData = (id: string): UserData => {
    const safeId = id || 'unknown';
    const displayId = safeId.length >= 8 ? safeId.substring(0, 8) : safeId;
    
    return {
      fullName: 'User ' + displayId,
      email: 'No email provided',
      department: 'Unknown',
      NIP: safeId,
      uid: id // Add the uid here
    };
  };

  useEffect(() => {
    if (!userId) {
      console.error('AdminCard: userId is required but not provided');
      setError('User ID is required');
      setLoading(false);
      return;
    }

    let userUnsubscribe: (() => void) | null = null;
    let attendanceUnsubscribe: (() => void) | null = null;

    const fetchData = async () => {
      try {
        const db = getDatabase();
        
        // Fetch user data
        const userRef = ref(db, `users/${userId}`);
        userUnsubscribe = onValue(
          userRef,
          (snapshot) => {
            try {
              if (snapshot.exists()) {
                const data = snapshot.val();
                // Make sure to include the uid
                setUserData({...data, uid: userId});
                setError(null);
              } else {
                // Handle case where user exists but has no profile data
                const attendanceRef = ref(db, `attendance/${userId}`);
                onValue(attendanceRef, (attendanceSnapshot) => {
                  try {
                    if (attendanceSnapshot.exists()) {
                      setUserData(createFallbackUserData(userId));
                      setError(null);
                    } else {
                      setUserData(createFallbackUserData(userId));
                      setError(null);
                    }
                  } catch (innerErr) {
                    console.error('Error processing attendance snapshot:', innerErr);
                    setError('Failed to process user data');
                  }
                });
              }
            } catch (err) {
              console.error('Error processing user snapshot:', err);
              setError('Failed to process user data');
            }
          },
          (err) => {
            console.error('Firebase user data error:', err);
            setUserData(createFallbackUserData(userId));
            setError(null);
          }
        );

        // Fetch attendance data
        const attendanceRef = ref(db, `attendance/${userId}`);
        attendanceUnsubscribe = onValue(
          attendanceRef,
          (snapshot) => {
            try {
              if (snapshot.exists()) {
                const data = snapshot.val();
                console.log('Raw attendance data for user', userId, ':', data);
                
                let attendanceEntries: Array<{data: AttendanceData, key: string}> = [];
                
                if (Array.isArray(data)) {
                  // Handle array format - use actual indices that exist in Firebase
                  attendanceEntries = data
                    .map((item: any, index: number) => {
                      if (item && item.timestamp) {
                        return {
                          data: {...item, attendanceKey: index.toString()},
                          key: index.toString()
                        };
                      }
                      return null;
                    })
                    .filter((entry): entry is {data: AttendanceData, key: string} => entry !== null);
                } else if (typeof data === 'object') {
                  // Handle object format - use actual Firebase keys
                  attendanceEntries = Object.entries(data)
                    .map(([key, value]) => {
                      if (value && (value as any).timestamp) {
                        return {
                          data: {...(value as any), attendanceKey: key},
                          key: key
                        };
                      }
                      return null;
                    })
                    .filter((entry): entry is {data: AttendanceData, key: string} => entry !== null);
                }
                
                console.log('Processed attendance entries:', attendanceEntries);
                
                // Sort by timestamp (most recent first)
                const sortedEntries = attendanceEntries
                  .sort((a, b) => (b.data.timestamp || 0) - (a.data.timestamp || 0));
                
                const todayDate = getTodayDate();
                console.log('Looking for today date:', todayDate);
                
                const todayEntry = sortedEntries.find(
                  (entry) => entry.data.tanggal === todayDate
                );
                
                console.log('Found today entry:', todayEntry);
                
                if (todayEntry) {
                  setTodayAttendance(todayEntry.data);
                  setAttendanceKey(todayEntry.key);
                  console.log('Set attendance key:', todayEntry.key);
                } else {
                  setTodayAttendance(null);
                  setAttendanceKey(null);
                  console.log('No attendance found for today');
                }
              } else {
                console.log('No attendance data exists for user:', userId);
                setTodayAttendance(null);
                setAttendanceKey(null);
              }
              
              setLoading(false);
            } catch (err) {
              console.error('Error processing attendance data:', err);
              setLoading(false);
              setError('Failed to process attendance data');
            }
          },
          (err) => {
            console.error('Firebase attendance data error:', err);
            setLoading(false);
          }
        );

      } catch (err) {
        console.error('Setup error:', err);
        setError('Failed to initialize data');
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      try {
        if (userUnsubscribe) userUnsubscribe();
        if (attendanceUnsubscribe) attendanceUnsubscribe();
      } catch (err) {
        console.error('Error during cleanup:', err);
      }
    };
  }, [userId]);

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
      case 'Absent':
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

  const handlePress = () => {
    try {
      if (onPress) {
        onPress();
      } else if (userData && navigation) {
        const navigationParams = {
          userId,
          name: userData.fullName || 'Unknown User',
          nip: userData.NIP || 'Not specified',
          department: userData.department || 'Not specified',
          email: userData.email || 'No email',
          status: getAttendanceStatus(todayAttendance?.waktu),
          attendanceData: todayAttendance,
          userData: userData, // Pass the complete user data
          attendanceId: attendanceKey, // Pass the attendance key
          attendanceKey: attendanceKey, // Also pass as attendanceKey for backward compatibility
        };
        
        console.log('Navigating with params:', navigationParams);
        console.log('Attendance Key:', attendanceKey);
        (navigation as any).navigate('UserDetail', navigationParams);
      } else {
        console.error('Missing userData or navigation:', { userData: !!userData, navigation: !!navigation });
        Alert.alert('Error', 'Unable to navigate. Missing required data.');
      }
    } catch (err) {
      console.error('Error during navigation:', err);
      Alert.alert(
        'Navigation Error',
        'Failed to open user details. Please try again.',
        [{text: 'OK', style: 'default'}]
      );
    }
  };

  const handleError = () => {
    Alert.alert(
      'Error',
      error || 'Failed to load user data',
      [
        {
          text: 'OK',
          style: 'default',
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.card, styles.loadingCard]}>
        <ActivityIndicator size="small" color="#0000ff" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error || !userData) {
    return (
      <TouchableOpacity style={[styles.card, styles.errorCard]} onPress={handleError}>
        <Text style={styles.errorText}>
          {error || 'User data not available'}
        </Text>
        <Text style={styles.errorSubtext}>Tap to see details</Text>
      </TouchableOpacity>
    );
  }

  const currentStatus = getAttendanceStatus(todayAttendance?.waktu);
  const statusStyle = getStatusStyle(currentStatus);

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={[styles.statusBadge, statusStyle.badge]}>
        <Text style={[styles.statusText, statusStyle.text]}>
          {currentStatus}
        </Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.textSection}>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
              {userData.fullName || 'Unknown User'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>NIP:</Text>
            <Text style={styles.value}>
              {userData.NIP || 'Not specified'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Department:</Text>
            <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
              {userData.department || 'Not specified'}
            </Text>
          </View>

          {todayAttendance?.waktu && (
            <View style={styles.row}>
              <Text style={styles.label}>Time:</Text>
              <Text style={styles.value}>
                {todayAttendance.waktu}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.imageBox}>
          {userData.profilePictureBase64 ? (
            <Image
              source={{uri: userData.profilePictureBase64}}
              style={styles.profileImage}
              resizeMode="cover"
              onError={(err) => {
                console.error('Image load error:', err);
              }}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>
                {userData.fullName ? userData.fullName.charAt(0).toUpperCase() : 'U'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 2,
    elevation: 3,
    borderColor: '#E8E8E8',
    borderWidth: 1,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  errorCard: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 120,
    backgroundColor: '#FFF5F5',
    borderColor: '#FED7D7',
  },
  errorText: {
    fontSize: 14,
    color: '#E53E3E',
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#A0AEC0',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  statusBadge: {
    backgroundColor: '#B4FFB1',
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 37,
    marginBottom: 16,
    minWidth: 100,
  },
  statusText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#2B6000',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  detailsContainer: {
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
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  label: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#333333',
    fontWeight: '600',
    width: 90,
  },
  value: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
    flex: 1,
  },
  imageBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#64748B',
    fontFamily: 'Poppins-Bold',
  },
});

export default AdminCard;