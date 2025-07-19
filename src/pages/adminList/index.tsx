import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ButtonNavAdmin, Header, TextInputAdmin } from '../../components';
import { getDatabase, ref, onValue } from 'firebase/database';

const departments = [
  'All Departments',
  'IT Department',
  'HR Department',
  'Finance Department',
  'Marketing Department',
];

const Lists = ({ navigation }) => {
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [usersData, setUsersData] = useState({});
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleSelectDept = (dept) => {
    setSelectedDept(dept);
    setShowDropdown(false);
  };

  // Fetch users and attendance data from Firebase
  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    const attendanceRef = ref(db, 'attendance');

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

  // Get today's date for filtering today's attendance
  const getTodayDateString = () => {
    const today = new Date();
    return today.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  // Filter attendance records based on department and search text
  const getFilteredAttendanceRecords = () => {
    let filtered = attendanceRecords;

    // Filter by name search
    if (searchText.trim()) {
      filtered = filtered.filter(record => {
        const userData = usersData[record.userId];
        const userName = userData?.fullName || '';
        return userName.toLowerCase().includes(searchText.toLowerCase());
      });
    }

    // Filter by department
    if (selectedDept && selectedDept !== 'All Departments') {
      filtered = filtered.filter(record => {
        const userData = usersData[record.userId];
        const userDepartment = userData?.department || '';
        return userDepartment === selectedDept;
      });
    }

    return filtered;
  };

  // Render attendance cards
  const renderAttendanceCards = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Loading attendance records...</Text>
        </View>
      );
    }

    const filteredRecords = getFilteredAttendanceRecords();

    if (filteredRecords.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No attendance records found</Text>
        </View>
      );
    }

    // Group by date for better organization
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
              // Navigate to user detail with attendance data
              navigation.navigate('UserDetail', {
                userId: record.userId,
                name: usersData[record.userId]?.fullName || 'Unknown User',
                nip: usersData[record.userId]?.NIP || 'Not specified',
                department: usersData[record.userId]?.department || 'Not specified',
                email: usersData[record.userId]?.email || 'No email',
                attendanceData: record,
                userData: usersData[record.userId],
              });
            }}
          />
        ))}
      </View>
    ));
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Header text="Lists" />

        <View style={styles.textinput}>
          <TextInputAdmin
            style={{ marginBottom: 15 }}
            text="Department"
            leftValue={selectedDept}
            onLeftPress={() => setShowDropdown(!showDropdown)}
            isLeftDropdown={true}
            placeholder="Search Name"
            rightValue={searchText}
            onRightChange={setSearchText}
          />

          {showDropdown && (
            <View style={styles.dropdownBox}>
              {departments.map((dept, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    index === departments.length - 1 && { borderBottomWidth: 0 }
                  ]}
                  onPress={() => handleSelectDept(dept)}
                >
                  <Text style={[
                    styles.dropdownText,
                    selectedDept === dept && styles.selectedDropdownText
                  ]}>
                    {dept}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TextInputAdmin style={styles.textinput1} />
        </View>

        <View style={styles.card}>
          {renderAttendanceCards()}
        </View>
      </ScrollView>

      <ButtonNavAdmin navigation={navigation} />
    </View>
  );
};

// Custom AttendanceCard component for displaying attendance records
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

        {/* Attendance Photo Section */}
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

export default Lists;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  scrollView: {},
  textinput: {
    paddingTop: 10,
  },
  textinput1: {
    marginBottom: 15,
  },
  card: {
    marginBottom: 130,
  },
  dropdownBox: {
    backgroundColor: '#fff',
    marginTop: -10,
    marginBottom: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    borderColor: '#D0D0D0',
    borderWidth: 1,
    zIndex: 10,
    elevation: 3,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  dropdownText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  selectedDropdownText: {
    color: '#007AFF',
    fontFamily: 'Poppins-SemiBold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins-Regular',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
  },
  // Date grouping styles
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
  // Attendance card styles
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
  // Attendance image styles
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