import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import {ButtonNavAdmin, Header, Admincard} from '../../components';
import {getDatabase, ref, onValue} from 'firebase/database';

const DashboardAdmin = ({navigation}) => {
  console.log('DASHBOARD NAVIGATION:', navigation);

  const [selectedDepartment, setSelectedDepartment] = useState('Select Department');
  const [searchName, setSearchName] = useState('');
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [usersData, setUsersData] = useState({});
  const [loading, setLoading] = useState(true);

  const departments = [
    'All Departments',
    'IT Department',
    'HR Department', 
    'Finance Department',
    'Marketing Department',
  ];

  // Get today's date in Indonesian format
  const getTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fetch attendance records and user data from Firebase
  useEffect(() => {
    const db = getDatabase();
    const attendanceRef = ref(db, 'attendance');
    const usersRef = ref(db, 'users');
    
    // First, fetch users data for reference
    const usersUnsubscribe = onValue(usersRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUsersData(userData);
          console.log('Fetched users data:', Object.keys(userData).length, 'users');
        }
      } catch (error) {
        console.error('Error fetching users data:', error);
      }
    });

    // Then fetch attendance records
    const attendanceUnsubscribe = onValue(attendanceRef, (snapshot) => {
      try {
        if (snapshot.exists()) {
          const attendanceData = snapshot.val();
          const allAttendanceRecords = [];
          
          // Process attendance data for each user
          Object.keys(attendanceData).forEach(userId => {
            const userAttendance = attendanceData[userId];
            let attendanceArray = [];
            
            // Handle both array and object formats
            if (Array.isArray(userAttendance)) {
              attendanceArray = userAttendance.filter(item => item && item.timestamp);
            } else if (typeof userAttendance === 'object') {
              attendanceArray = Object.values(userAttendance).filter(item => item && item.timestamp);
            }
            
            // Add userId to each attendance record
            attendanceArray.forEach(record => {
              allAttendanceRecords.push({
                ...record,
                userId: userId
              });
            });
          });
          
          // Sort by timestamp (newest first)
          allAttendanceRecords.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          
          console.log('Fetched attendance records:', allAttendanceRecords.length);
          setAttendanceRecords(allAttendanceRecords);
        } else {
          setAttendanceRecords([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
        setLoading(false);
      }
    });

    return () => {
      usersUnsubscribe();
      attendanceUnsubscribe();
    };
  }, []);

  // Filter attendance records based on search and department
  const getFilteredAttendanceRecords = () => {
    let filtered = attendanceRecords;

    // Filter by name search
    if (searchName.trim()) {
      filtered = filtered.filter(record => {
        const userData = usersData[record.userId];
        const userName = userData?.fullName || '';
        return userName.toLowerCase().includes(searchName.toLowerCase());
      });
    }

    // Filter by department
    if (selectedDepartment !== 'Select Department' && selectedDepartment !== 'All Departments') {
      filtered = filtered.filter(record => {
        const userData = usersData[record.userId];
        const userDepartment = userData?.department || '';
        return userDepartment === selectedDepartment;
      });
    }

    return filtered;
  };

  const renderAttendanceCards = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text>Loading attendance records...</Text>
        </View>
      );
    }

    const filteredRecords = getFilteredAttendanceRecords();

    if (filteredRecords.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text>No attendance records found</Text>
        </View>
      );
    }

    // Group by date for better organization (optional)
    const groupedRecords = {};
    filteredRecords.forEach(record => {
      const date = record.tanggal || 'Unknown Date';
      if (!groupedRecords[date]) {
        groupedRecords[date] = [];
      }
      groupedRecords[date].push(record);
    });

    return Object.keys(groupedRecords).map(date => (
      <View key={date} style={styles.dateGroup}>
        <Text style={styles.dateHeader}>{date}</Text>
        {groupedRecords[date].map((record, index) => (
          <AttendanceCard
            key={`${record.userId}-${record.timestamp}-${index}`}
            attendanceRecord={record}
            userData={usersData[record.userId]}
            onPress={() => {
              console.log('Attendance card pressed:', record);
              // Navigate to attendance detail or user detail
              navigation.navigate('UserDetail', {
                userId: record.userId,
                name: usersData[record.userId]?.fullName || 'Unknown User',
                nip: usersData[record.userId]?.NIP || 'Not specified',
                department: usersData[record.userId]?.department || 'Not specified',
                email: usersData[record.userId]?.email || 'No email',
                attendanceData: record,
              });
            }}
          />
        ))}
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}>
          <Header text="Admin" />
          <View style={styles.filterContainer}>
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={styles.dropdownContainer}
                onPress={() =>
                  setShowDepartmentDropdown(!showDepartmentDropdown)
                }>
                <Text style={styles.dropdownText}>{selectedDepartment}</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.searchInput}
                placeholder="Search Name"
                placeholderTextColor="#999"
                value={searchName}
                onChangeText={setSearchName}
              />
            </View>
            {showDepartmentDropdown && (
              <View style={styles.dropdownOptions}>
                {departments.map((dept, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setSelectedDepartment(dept);
                      setShowDepartmentDropdown(false);
                    }}>
                    <Text style={styles.dropdownOptionText}>{dept}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View>
            {renderAttendanceCards()}
          </View>
        </ScrollView>
        <ButtonNavAdmin navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

// Custom AttendanceCard component for displaying attendance records with attendance photos
const AttendanceCard = ({attendanceRecord, userData, onPress}) => {
  const getAttendanceStatus = (waktu) => {
    if (!waktu) return 'Absent';
    
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
          badge: {backgroundColor: '#B4FFB1'},
          text: {color: '#2B6000'},
        };
      case 'Late':
        return {
          badge: {backgroundColor: '#FFF3B1'},
          text: {color: '#8A6E00'},
        };
      default:
        return {
          badge: {backgroundColor: '#FFB1B1'},
          text: {color: '#8A0000'},
        };
    }
  };

  const status = getAttendanceStatus(attendanceRecord.waktu);
  const statusStyle = getStatusStyle(status);

  return (
    <TouchableOpacity style={styles.attendanceCard} onPress={onPress}>
      <View style={[styles.statusBadge, statusStyle.badge]}>
        <Text style={[styles.statusText, statusStyle.text]}>
          {status}
        </Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.textSection}>
          <View style={styles.row}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
              {userData?.fullName || 'Unknown User'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>NIP:</Text>
            <Text style={styles.value}>
              {userData?.NIP || 'Not specified'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Department:</Text>
            <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
              {userData?.department || 'Not specified'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>
              {attendanceRecord.waktu || 'Not recorded'}
            </Text>
          </View>

          {attendanceRecord.location?.address && (
            <View style={styles.row}>
              <Text style={styles.label}>Location:</Text>
              <Text style={styles.value} numberOfLines={2} ellipsizeMode="tail">
                {attendanceRecord.location.address}
              </Text>
            </View>
          )}
        </View>

        {/* Attendance Photo Section - Updated to use attendance photo instead of profile photo */}
        <View style={styles.imageBox}>
          {attendanceRecord.photo ? (
            <Image
              source={{uri: attendanceRecord.photo}}
              style={styles.attendanceImage}
              resizeMode="cover"
              onError={(err) => {
                console.error('Attendance image load error:', err);
              }}
            />
          ) : attendanceRecord.photoBase64 ? (
            <Image
              source={{uri: attendanceRecord.photoBase64}}
              style={styles.attendanceImage}
              resizeMode="cover"
              onError={(err) => {
                console.error('Attendance image load error:', err);
              }}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>
                No Photo
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default DashboardAdmin;

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
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  dropdownContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  dropdownText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#999',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#333',
  },
  dropdownOptions: {
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#BEBBBB',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownOptionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#333',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    fontFamily: 'Poppins-SemiBold',
  },
  attendanceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 2,
    elevation: 3,
    borderColor: '#E8E8E8',
    borderWidth: 1,
  },
  statusBadge: {
    backgroundColor: '#B4FFB1',
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 37,
    marginBottom: 12,
    minWidth: 80,
  },
  statusText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#2B6000',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  // New styles for the layout with attendance image
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
  // Attendance image styles (matching Card component)
  imageBox: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#D1D5DB',
  },
  attendanceImage: {
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
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
});