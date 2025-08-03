import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {ButtonNavAdmin, Header} from '../../components';
import {getDatabase, ref, onValue} from 'firebase/database';

interface UserData {
  id: string;
  fullName?: string;
  email?: string;
  department?: string;
  NIP?: string;
  startDate?: string;
  profilePictureBase64?: string;
  role?: string;
}

interface AttendanceRecord {
  id: string;
  tanggal?: string;
  waktu?: string;
  timestamp?: number;
  status?: string;
  photo?: string;
  photoBase64?: string;
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  confirmed?: boolean;
}

const UserProfile = ({route, navigation}: {route: any; navigation: any}) => {
  const {userId, name, nip, department, email} = route.params || {};

  const [userInfo, setUserInfo] = useState<UserData | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<
    AttendanceRecord[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data and attendance history
  useEffect(() => {
    if (!userId) {
      setError('User ID not provided');
      setLoading(false);
      return;
    }

    const db = getDatabase();

    // Fetch user information
    const userRef = ref(db, `users/${userId}`);
    const userUnsubscribe = onValue(userRef, snapshot => {
      try {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserInfo({
            id: userId,
            ...userData,
          });
        } else {
          // Fallback to route params if user not found in database
          setUserInfo({
            id: userId,
            fullName: name,
            NIP: nip,
            department: department,
            email: email,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user information');
      }
    });

    // Fetch attendance history
    const attendanceRef = ref(db, `attendance/${userId}`);
    const attendanceUnsubscribe = onValue(attendanceRef, snapshot => {
      try {
        if (snapshot.exists()) {
          const attendanceData = snapshot.val();
          const attendanceList: AttendanceRecord[] = [];

          // Handle both array and object formats
          if (Array.isArray(attendanceData)) {
            attendanceData.forEach((record, index) => {
              if (record && record.timestamp) {
                attendanceList.push({
                  id: index.toString(),
                  ...record,
                });
              }
            });
          } else if (typeof attendanceData === 'object') {
            Object.keys(attendanceData).forEach(key => {
              const record = attendanceData[key];
              if (record && record.timestamp) {
                attendanceList.push({
                  id: key,
                  ...record,
                });
              }
            });
          }

          // Sort by timestamp (newest first)
          attendanceList.sort(
            (a, b) => (b.timestamp || 0) - (a.timestamp || 0),
          );

          console.log(
            'Fetched attendance history:',
            attendanceList.length,
            'records',
          );
          setAttendanceHistory(attendanceList);
        } else {
          setAttendanceHistory([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setError('Failed to load attendance history');
        setLoading(false);
      }
    });

    return () => {
      userUnsubscribe();
      attendanceUnsubscribe();
    };
  }, [userId, name, nip, department, email]);

  // Get attendance status from time or existing status
  const getAttendanceStatus = (record: AttendanceRecord): string => {
    // First, check if there's a status field in the record
    if (record.status) {
      return record.status;
    }

    // Fallback to time-based calculation if no status field exists
    const waktu = record.waktu;
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

  // Format date for display
  const formatDate = (timestamp: number): string => {
    if (!timestamp) return 'Unknown Date';
    const date = new Date(timestamp);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format time for display
  const formatTime = (waktu: string): string => {
    if (!waktu) return 'Not recorded';
    return waktu;
  };

  // Render user profile section
  const renderUserProfile = () => {
    if (!userInfo) return null;

    return (
      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            {userInfo.profilePictureBase64 ? (
              <Image
                source={{
                  uri: `data:image/jpeg;base64,${userInfo.profilePictureBase64}`,
                }}
                style={styles.profileImage}
                resizeMode="cover"
                onError={err => {
                  console.error('Profile image load error:', err);
                }}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>
                  {(userInfo.fullName || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>
              {userInfo.fullName || 'Unknown User'}
            </Text>
            <Text style={styles.userRole}>{userInfo.role || 'Employee'}</Text>
          </View>
        </View>

        <View style={styles.userDetailsCard}>
          <Text style={styles.cardTitle}>User Information</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>NIP:</Text>
            <Text style={styles.detailValue}>
              {userInfo.NIP || 'Not specified'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Department:</Text>
            <Text style={styles.detailValue} numberOfLines={2}>
              {userInfo.department || 'Not specified'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>
              {userInfo.email || 'No email'}
            </Text>
          </View>

          {userInfo.startDate && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Start Date:</Text>
              <Text style={styles.detailValue}>{userInfo.startDate}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Render attendance history section
  const renderAttendanceHistory = () => {
    if (attendanceHistory.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No attendance records found</Text>
        </View>
      );
    }

    // Group attendance by date
    const groupedAttendance: {[key: string]: AttendanceRecord[]} = {};
    attendanceHistory.forEach(record => {
      const date = record.tanggal || formatDate(record.timestamp || 0);
      if (!groupedAttendance[date]) {
        groupedAttendance[date] = [];
      }
      groupedAttendance[date].push(record);
    });

    // Sort dates (newest first)
    const sortedDates = Object.keys(groupedAttendance).sort((a, b) => {
      // Try to parse dates for proper sorting
      const dateA = new Date(a);
      const dateB = new Date(b);
      if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
        return dateB.getTime() - dateA.getTime();
      }
      return b.localeCompare(a);
    });

    return (
      <View style={styles.attendanceSection}>
        <Text style={styles.sectionTitle}>
          Attendance History ({attendanceHistory.length} records)
        </Text>

        {sortedDates.map(date => (
          <View key={date} style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{date}</Text>
            {groupedAttendance[date].map(record => (
              <AttendanceCard
                key={record.id}
                record={record}
                onPress={() => {
                  console.log(
                    `This app was created by Elshera A. E. Dahlan & Lana L. L. Londah`,
                  );
                  // Navigate to attendance detail if needed
                  navigation.navigate('UserDetail', {
                    userId: userId,
                    name: userInfo?.fullName || name,
                    nip: userInfo?.NIP || nip,
                    department: userInfo?.department || department,
                    email: userInfo?.email || email,
                    attendanceData: record,
                    userData: userInfo,
                    attendanceId: record.id,
                  });
                }}
              />
            ))}
          </View>
        ))}
      </View>
    );
  };

  // Attendance card component
  const AttendanceCard = ({
    record,
    onPress,
  }: {
    record: AttendanceRecord;
    onPress: () => void;
  }) => {
    const status = getAttendanceStatus(record);
    const statusStyle = getStatusStyle(status);

    return (
      <TouchableOpacity style={styles.attendanceCard} onPress={onPress}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, statusStyle.badge]}>
            <Text style={[styles.statusText, statusStyle.text]}>{status}</Text>
          </View>
          {record.confirmed && (
            <View style={styles.confirmedBadge}>
              <Text style={styles.confirmedText}>✓ Confirmed</Text>
            </View>
          )}
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardTextSection}>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>Time:</Text>
              <Text style={styles.cardValue}>
                {formatTime(record.waktu || '')}
              </Text>
            </View>
            {/* This app was created by Eishera A. E. Dahlan & L@na L. L. L0ondah */}
            {record.location?.address && (
              <View style={styles.cardRow}>
                <Text style={styles.cardLabel}>Location:</Text>
                <Text
                  style={styles.cardValue}
                  numberOfLines={2}
                  ellipsizeMode="tail">
                  {record.location.address}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.cardImageSection}>
            {record.photo || record.photoBase64 ? (
              <Image
                source={{uri: record.photo || record.photoBase64}}
                style={styles.attendanceImage}
                resizeMode="cover"
                onError={err => {
                  console.error('Attendance image load error:', err);
                }}
              />
            ) : (
              <View style={styles.placeholderAttendanceImage}>
                <Text style={styles.placeholderAttendanceText}>No Photo</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.contentWrapper}>
          <Header text="User Profile" />
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066CC" />
            <Text style={styles.loadingText}>Loading user profile...</Text>
          </View>
          <ButtonNavAdmin navigation={navigation} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.contentWrapper}>
          <Header text="User Profile" />
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setError(null);
                setLoading(true);
              }}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
          <ButtonNavAdmin navigation={navigation} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Header text="User Profile" />
          {renderUserProfile()}
          {renderAttendanceHistory()}
        </ScrollView>
        <ButtonNavAdmin navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  // Profile section styles
  profileSection: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    marginRight: 16,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    color: '#64748B',
    fontFamily: 'Poppins-Bold',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  userDetailsCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    flex: 1,
  },
  // Attendance section styles
  attendanceSection: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  // Attendance card styles
  attendanceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
    borderColor: '#E8E8E8',
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    textAlign: 'center',
  },
  confirmedBadge: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confirmedText: {
    fontSize: 10,
    fontFamily: 'Poppins-Medium',
    color: '#2B6000',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTextSection: {
    flex: 1,
    paddingRight: 12,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-start',
  },
  cardLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    width: 70,
  },
  cardValue: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    flex: 1,
  },
  cardImageSection: {
    width: 60,
    height: 60,
  },
  attendanceImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholderAttendanceImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderAttendanceText: {
    fontSize: 10,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
});
