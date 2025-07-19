import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getDatabase, ref, onValue, off} from 'firebase/database';
import {getAuth} from 'firebase/auth';
import {showMessage} from 'react-native-flash-message';

interface UserData {
  fullName?: string;
  email?: string;
  department?: string;
  NIP?: string;
  startDate?: string;
  profilePictureBase64?: string;
  role?: string;
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
}

interface AdminCardProps {
  userId: string; // Required prop to identify which user's data to fetch
  onPress?: () => void;
}

const AdminCard = ({userId, onPress}: AdminCardProps) => {
  const navigation = useNavigation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get today's date in format used by your app
  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Determine attendance status based on time
  const getAttendanceStatus = (waktu?: string): string => {
    if (!todayAttendance || !waktu) {
      return 'Absent';
    }
    
    // Extract hour and minute from time string (format: "HH:MM")
    const [hours, minutes] = waktu.split(':').map(num => parseInt(num));
    const timeInMinutes = hours * 60 + minutes;
    
    // Define time thresholds (adjust according to your business rules)
    const onTimeThreshold = 8 * 60; // 08:00 in minutes
    const lateThreshold = 8 * 60 + 30; // 08:30 in minutes
    
    if (timeInMinutes <= onTimeThreshold) {
      return 'Present';
    } else if (timeInMinutes <= lateThreshold) {
      return 'Late';
    } else {
      return 'Late';
    }
  };

  useEffect(() => {
    let userUnsubscribe: (() => void) | null = null;
    let attendanceUnsubscribe: (() => void) | null = null;

    const fetchData = async () => {
      try {
        const db = getDatabase();
        
        // Fetch user data
        const userRef = ref(db, `users/${userId}`);
        const userListener = onValue(
          userRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              setUserData(data);
            } else {
              setError('User data not found');
            }
          },
          (error) => {
            console.error('Firebase user data error:', error);
            setError('Failed to load user data');
          }
        );

        userUnsubscribe = () => off(userRef, 'value', userListener);

        // Fetch today's attendance data
        const attendanceRef = ref(db, `attendance/${userId}`);
        const attendanceListener = onValue(
          attendanceRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              const todayDate = getTodayDate();
              
              // Find today's attendance
              const todayRecord = Object.values(data).find(
                (record: any) => record.tanggal === todayDate
              ) as AttendanceData;
              
              setTodayAttendance(todayRecord || null);
            } else {
              setTodayAttendance(null);
            }
            
            setLoading(false);
          },
          (error) => {
            console.error('Firebase attendance data error:', error);
            // Don't set error for attendance, just set loading to false
            setLoading(false);
          }
        );

        attendanceUnsubscribe = () => off(attendanceRef, 'value', attendanceListener);

      } catch (error) {
        console.error('Setup error:', error);
        setError('Failed to initialize data');
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      if (userUnsubscribe) {
        userUnsubscribe();
      }
      if (attendanceUnsubscribe) {
        attendanceUnsubscribe();
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
    if (onPress) {
      onPress();
    } else if (userData) {
      navigation.navigate('UserDetail', {
        userId,
        name: userData.fullName || 'Unknown User',
        nip: userData.NIP || 'Not specified',
        department: userData.department || 'Not specified',
        email: userData.email || 'No email',
        status: getAttendanceStatus(todayAttendance?.waktu),
        attendanceData: todayAttendance,
      });
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