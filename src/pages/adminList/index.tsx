import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Image, Modal, Platform } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ButtonNavAdmin, Header, TextInputAdmin } from '../../components';
import { getDatabase, ref, onValue } from 'firebase/database';
import DateTimePicker from '@react-native-community/datetimepicker';

// Type definitions
interface AttendanceRecord {
  userId: string;
  timestamp?: number;
  tanggal?: string;
  waktu?: string;
  status?: string;
  photo?: string;
  photoBase64?: string;
  location?: {
    address?: string;
  };
  confirmed?: boolean;
}

interface UserData {
  fullName?: string;
  NIP?: string;
  department?: string;
  email?: string;
}

interface NavigationProps {
  navigate: (screen: string, params?: any) => void;
}

const departments = [
  'All Departments',
  'PERENCANAAN DAN MANAJEMEN KINERJA',
  'KEUANGAN DAN ANGGARAN',
  'HUKUM, KEPEGAWAIAN DAN PELAYANAN PUBLIK',
  'PENGEMBANGAN SDM',
  'UMUM DAN PENGELOLAAN ΒΜΝ',
  'ADVOKASI, KIE, KEHUMASAN, HUBUNGAN ANTAR LEMBAGA DAN INFORMASI PUBLIK',
  'PELAPORAN, STATISTIK, DAN PENGELOLAAN TIK',
  'KELUARGA BERENCANA DAN KESEHATAN REPRODUKSI',
  'PENGENDALIAN PENDUDUK',
  'PENGELOLAAN DAN PEMBINAAN LINI LAPANGAN',
  'KEBIJAKAN STRATEGI, PPS, GENTING, DAN MBG',
  'KETAHANAN KELUARGA BALITA, ANAK, DAN REMAJA',
  'KETAHANAN KELUARGA LANSIA DAN PEMBERDAYAAN EKONOMI KELUARGA',
  'ZI WBK/WBBM DAN SPIP',
];

const sessionStatuses = [
  'All Sessions',
  'Present',
  'Late',
  'Excused',
  'Unexcused',
];

const Lists = ({ navigation }: { navigation: NavigationProps }) => {
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [usersData, setUsersData] = useState<Record<string, UserData>>({});
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New state for date and session filtering
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSession, setSelectedSession] = useState('All Sessions');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSessionDropdown, setShowSessionDropdown] = useState(false);
  const [datePickerDate, setDatePickerDate] = useState(new Date());

  const handleSelectDept = (dept: string) => {
    setSelectedDept(dept);
    setShowDropdown(false);
  };

  const handleSelectSession = (session: string) => {
    setSelectedSession(session);
    setShowSessionDropdown(false);
  };

  const handleDateSelect = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      setDatePickerDate(date);
    }
  };

  const handleQuickDateSelect = (date: Date) => {
    setSelectedDate(date);
    setDatePickerDate(date);
    setShowDatePicker(false);
  };

  const clearDateFilter = () => {
    setSelectedDate(null);
  };

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
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
          const allAttendanceRecords: AttendanceRecord[] = [];
          
          // Process attendance data for each user
          Object.keys(attendanceData).forEach(userId => {
            const userAttendance = attendanceData[userId];
            let attendanceArray = [];
            
            // Handle both array and object formats
            if (Array.isArray(userAttendance)) {
              attendanceArray = userAttendance.filter((item: any) => item && item.timestamp);
            } else if (typeof userAttendance === 'object') {
              attendanceArray = Object.values(userAttendance).filter((item: any) => item && item.timestamp);
            }
            
            // Add userId to each attendance record
            attendanceArray.forEach((record: any) => {
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


  // Get attendance status from record
  const getAttendanceStatus = (record: AttendanceRecord) => {
    // First, check if there's a status field in the record (from Firebase)
    if (record.status) {
      return record.status;
    }
    
    // Fallback to time-based calculation if no status field exists
    const waktu = record.waktu;
    if (!waktu) return 'Unexcused';
    
    const [hours, minutes] = waktu.split(':').map((num: string) => parseInt(num));
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

  // Helper function to normalize date strings for comparison
  const normalizeDateString = (dateStr: string) => {
    if (!dateStr) return '';
    
    // Remove extra spaces and normalize
    return dateStr.trim().toLowerCase();
  };


  // Alternative date formats to try
  const getAlternativeDateFormats = (date: Date) => {
    const formats = [
      // Indonesian long format
      date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }),
      // Indonesian short format
      date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      // ISO date format
      date.toISOString().split('T')[0],
      // Simple format
      `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`,
      // Alternative Indonesian format
      date.toLocaleDateString('id-ID'),
    ];
    
    return formats;
  };

  // Filter attendance records based on department, search text, date, and session
  const getFilteredAttendanceRecords = () => {
    let filtered = attendanceRecords;

    console.log('Total attendance records:', attendanceRecords.length);

    // Filter by name search
    if (searchText.trim()) {
      filtered = filtered.filter((record: AttendanceRecord) => {
        const userData = usersData[record.userId];
        const userName = userData?.fullName || '';
        return userName.toLowerCase().includes(searchText.toLowerCase());
      });
      console.log('After name filter:', filtered.length);
    }

    // Filter by department
    if (selectedDept && selectedDept !== 'All Departments') {
      filtered = filtered.filter((record: AttendanceRecord) => {
        const userData = usersData[record.userId];
        const userDepartment = userData?.department || '';
        return userDepartment === selectedDept;
      });
      console.log('After department filter:', filtered.length);
    }

    // Filter by date
    if (selectedDate) {
      const possibleDateFormats = getAlternativeDateFormats(selectedDate);
      console.log('Selected date:', selectedDate);
      console.log('Possible date formats to match:', possibleDateFormats);
      
      // Log some sample record dates for debugging
      const sampleDates = filtered.slice(0, 5).map(record => record.tanggal);
      console.log('Sample record dates:', sampleDates);
      
      filtered = filtered.filter((record: AttendanceRecord) => {
        const recordDate = record.tanggal || '';
        const normalizedRecordDate = normalizeDateString(recordDate);
        
        // Try to match against any of the possible date formats
        const matches = possibleDateFormats.some(format => {
          const normalizedFormat = normalizeDateString(format);
          return normalizedRecordDate === normalizedFormat;
        });
        
        // Also try timestamp-based comparison if available
        if (!matches && record.timestamp) {
          const recordDateFromTimestamp = new Date(record.timestamp);
          const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
          const recordDateOnly = new Date(recordDateFromTimestamp.getFullYear(), recordDateFromTimestamp.getMonth(), recordDateFromTimestamp.getDate());
          
          return selectedDateOnly.getTime() === recordDateOnly.getTime();
        }
        
        return matches;
      });
      
      console.log('After date filter:', filtered.length);
    }

    // Filter by session status
    if (selectedSession && selectedSession !== 'All Sessions') {
      filtered = filtered.filter((record: AttendanceRecord) => {
        const status = getAttendanceStatus(record);
        return status === selectedSession;
      });
      console.log('After session filter:', filtered.length);
    }

    console.log('Final filtered records:', filtered.length);
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
    const groupedRecords: Record<string, AttendanceRecord[]> = {};
    filteredRecords.forEach((record: AttendanceRecord) => {
      const date = record.tanggal || 'Unknown Date';
      if (!groupedRecords[date]) {
        groupedRecords[date] = [];
      }
      groupedRecords[date].push(record);
    });

    return Object.keys(groupedRecords).map(date => (
      <View key={date} style={styles.dateGroup}>
        <Text style={styles.dateHeader}>{date}</Text>
        {groupedRecords[date].map((record: AttendanceRecord, index: number) => (
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
          {/* Department and Name Search Row */}
          <TextInputAdmin
            style={{ marginBottom: 15 }}
            text="Department"
            leftValue={selectedDept}
            onLeftPress={() => setShowDropdown(!showDropdown)}
            onLeftChange={() => {}}
            onRightPress={() => {}}
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

          {/* Date and Session Filter Row using TextInputAdmin */}
          <TextInputAdmin
            style={{ marginBottom: 15 }}
            text={formatDateDisplay(selectedDate)}
            leftValue={formatDateDisplay(selectedDate)}
            onLeftPress={() => setShowDatePicker(true)}
            onLeftChange={() => {}}
            isLeftDropdown={true}
            placeholder="Session Status"
            rightValue={selectedSession}
            onRightPress={() => setShowSessionDropdown(!showSessionDropdown)}
            onRightChange={() => {}}
            isRightDropdown={true}
          />

          {/* Clear Date Filter Button */}
          {selectedDate && (
            <View style={styles.clearDateContainer}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearDateFilter}
              >
                <Text style={styles.clearButtonText}>Clear Date Filter</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Session Dropdown */}
          {showSessionDropdown && (
            <View style={styles.sessionDropdownBox}>
              {sessionStatuses.map((session, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownItem,
                    index === sessionStatuses.length - 1 && { borderBottomWidth: 0 }
                  ]}
                  onPress={() => handleSelectSession(session)}
                >
                  <Text style={[
                    styles.dropdownText,
                    selectedSession === session && styles.selectedDropdownText
                  ]}>
                    {session}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Native Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={datePickerDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateSelect}
              maximumDate={new Date()}
            />
          )}

          {/* Enhanced Date Selection Modal with Quick Options */}
          <Modal
            visible={showDatePicker && Platform.OS === 'ios'}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.datePickerContainer}>
                <Text style={styles.datePickerTitle}>Select Date</Text>
                <Text style={styles.datePickerSubtitle}>Choose a date to filter attendance records</Text>
                
                {/* Quick Date Options */}
                <View style={styles.quickDateOptions}>
                  <TouchableOpacity
                    style={styles.quickDateButton}
                    onPress={() => handleQuickDateSelect(new Date())}
                  >
                    <Text style={styles.quickDateText}>Today</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickDateButton}
                    onPress={() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      handleQuickDateSelect(yesterday);
                    }}
                  >
                    <Text style={styles.quickDateText}>Yesterday</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.quickDateButton}
                    onPress={() => {
                      const lastWeek = new Date();
                      lastWeek.setDate(lastWeek.getDate() - 7);
                      handleQuickDateSelect(lastWeek);
                    }}
                  >
                    <Text style={styles.quickDateText}>Last Week</Text>
                  </TouchableOpacity>
                </View>

                {/* iOS Date Picker */}
                <DateTimePicker
                  value={datePickerDate}
                  mode="date"
                  display="spinner"
                  onChange={(event: any, date?: Date) => {
                    if (date) {
                      setDatePickerDate(date);
                    }
                  }}
                  maximumDate={new Date()}
                  style={styles.iosDatePicker}
                />

                <View style={styles.datePickerButtons}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => {
                      setSelectedDate(datePickerDate);
                      setShowDatePicker(false);
                    }}
                  >
                    <Text style={styles.confirmButtonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.card}>
          {renderAttendanceCards()}
        </View>
      </ScrollView>

      <ButtonNavAdmin navigation={navigation} />
    </View>
  );
};

// Updated AttendanceCard component with improved status handling (matching DashboardAdmin)
const AttendanceCard = ({
  attendanceRecord,
  userData,
  onPress
}: {
  attendanceRecord: AttendanceRecord;
  userData: UserData;
  onPress: () => void;
}) => {
  // Updated getAttendanceStatus to prioritize Firebase status field (same as DashboardAdmin)
  const getAttendanceStatus = (record: AttendanceRecord) => {
    // First, check if there's a status field in the record (from Firebase)
    if (record.status) {
      return record.status;
    }
    
    // Fallback to time-based calculation if no status field exists
    const waktu = record.waktu;
    if (!waktu) return 'Unexcused';
    
    const [hours, minutes] = waktu.split(':').map((num: string) => parseInt(num));
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

  // Updated getStatusStyle to handle all status types (same as DashboardAdmin)
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

  // Use the updated function that checks Firebase status first
  const status = getAttendanceStatus(attendanceRecord);
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

          {/* Show confirmation status if available */}
          {attendanceRecord.confirmed && (
            <View style={styles.row}>
              <Text style={styles.label}>Confirmed:</Text>
              <Text style={[styles.value, {color: '#2B6000', fontFamily: 'Poppins-SemiBold'}]}>
                ✓ Yes
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
              onError={(err: any) => {
                console.error('Attendance image load error:', err);
              }}
            />
          ) : attendanceRecord.photoBase64 ? (
            <Image
              source={{uri: attendanceRecord.photoBase64}}
              style={styles.attendanceImage}
              resizeMode="cover"
              onError={(err: any) => {
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
  // Clear date filter styles
  clearDateContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  clearButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  clearButtonText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: 'white',
  },
  sessionDropdownBox: {
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
  // Date picker modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  datePickerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 10,
  },
  datePickerSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  quickDateOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    width: '100%',
  },
  quickDateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  quickDateText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: 'white',
  },
  datePickerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '100%',
    gap: 10,
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  confirmButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: 'white',
  },
  iosDatePicker: {
    width: '100%',
    marginVertical: 10,
  },
});
