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
  Alert,
} from 'react-native';
import {ButtonNavAdmin, Header} from '../../components';
import {getDatabase, ref, onValue} from 'firebase/database';
import {getAuth, signOut} from 'firebase/auth';
import {showMessage} from 'react-native-flash-message';

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

const DashboardAdmin = ({navigation}: {navigation: any}) => {
  console.log('DASHBOARD NAVIGATION:', navigation);

  const [selectedDepartment, setSelectedDepartment] =
    useState('Select Department');
  const [searchName, setSearchName] = useState('');
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();

  const departments = [
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

  // Fetch users data from Firebase
  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');

    const usersUnsubscribe = onValue(usersRef, snapshot => {
      try {
        if (snapshot.exists()) {
          const userData = snapshot.val();
          const usersList = Object.keys(userData)
            .map(userId => ({
              id: userId,
              ...userData[userId],
            }))
            // Filter out admin users if needed
            .filter(user => user.role !== 'admin')
            // Sort alphabetically by name
            .sort((a, b) => {
              const nameA = (a.fullName || '').toLowerCase();
              const nameB = (b.fullName || '').toLowerCase();
              return nameA.localeCompare(nameB);
            });

          console.log('Fetched users data:', usersList.length, 'users');
          setUsers(usersList);
          setFilteredUsers(usersList);
        } else {
          setUsers([]);
          setFilteredUsers([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching users data:', error);
        setLoading(false);
      }
    });

    return () => {
      usersUnsubscribe();
    };
  }, []);

  // Filter users based on search and department
  useEffect(() => {
    let filtered = users;

    // Filter by name search
    if (searchName.trim()) {
      filtered = filtered.filter(user => {
        const userName = user.fullName || '';
        return userName.toLowerCase().includes(searchName.toLowerCase());
      });
    }

    // Filter by department
    if (
      selectedDepartment !== 'Select Department' &&
      selectedDepartment !== 'All Departments'
    ) {
      filtered = filtered.filter(user => {
        const userDepartment = user.department || '';
        return userDepartment === selectedDepartment;
      });
    }

    // Sort alphabetically by name
    filtered.sort((a, b) => {
      const nameA = (a.fullName || '').toLowerCase();
      const nameB = (b.fullName || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

    setFilteredUsers(filtered);
  }, [users, searchName, selectedDepartment]);

  const handleLogout = () => {
    Alert.alert('Keluar dari Admin', 'Anda yakin ingin keluar dari Admin?', [
      {
        text: 'Batal',
        style: 'cancel',
      },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            showMessage({
              message: 'Admin berhasil keluar',
              type: 'success',
              duration: 2000,
            });
            // Navigate back to login screen
            navigation.reset({
              index: 0,
              routes: [{name: 'Login'}],
            });
          } catch (error) {
            console.error('Logout error:', error);
            showMessage({
              message: 'Logout failed',
              description: 'Please try again',
              type: 'danger',
              duration: 3000,
            });
          }
        },
      },
    ]);
  };

  const renderUserCards = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text>Memuat user...</Text>
        </View>
      );
    }

    if (filteredUsers.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text>Tidak ditemukan</Text>
        </View>
      );
    }

    // Group users by first letter of their name
    const groupedUsers: Record<string, UserData[]> = {};
    filteredUsers.forEach(user => {
      const firstLetter = (user.fullName || 'Tidak diketahui')
        .charAt(0)
        .toUpperCase();
      if (!groupedUsers[firstLetter]) {
        groupedUsers[firstLetter] = [];
      }
      groupedUsers[firstLetter].push(user);
    });

    // Sort the letters
    const sortedLetters = Object.keys(groupedUsers).sort();

    return sortedLetters.map(letter => (
      <View key={letter} style={styles.letterGroup}>
        <Text style={styles.letterHeader}>{letter}</Text>
        {groupedUsers[letter].map(user => (
          <UserCard
            key={user.id}
            user={user}
            onPress={() => {
              console.log('User card pressed:', user);

              console.log(
                `This app was created by Elshera A. E. Dahlan & Lana L. L. Londah`,
              );
              navigation.navigate('UserProfile', {
                userId: user.id,
                name: user.fullName || 'Unknown User',
                nip: user.NIP || 'Not specified',
                department: user.department || 'Not specified',
                email: user.email || 'No email',
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
          {/* This app was created by Eishera A. E. Dahlan & L@na L. L. L0ondah */}
          <View style={styles.headerWithLogout}>
            <Header text="Admin" />
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Keluar</Text>
            </TouchableOpacity>
          </View>
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
                placeholder="Cari nama"
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

          <View>{renderUserCards()}</View>
        </ScrollView>
        <ButtonNavAdmin navigation={navigation} />
      </View>
    </SafeAreaView>
  );
};

// UserCard component for displaying user information
const UserCard = ({user, onPress}: {user: UserData; onPress: () => void}) => {
  return (
    <TouchableOpacity style={styles.userCard} onPress={onPress}>
      <View style={styles.detailsContainer}>
        <View style={styles.textSection}>
          <View style={styles.row}>
            <Text style={styles.label}>Nama:</Text>
            <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
              {user.fullName || 'Tidak diketahui'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>NIP:</Text>
            <Text style={styles.value}>{user.NIP || 'Tidak diketahui'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Departemen:</Text>
            <Text style={styles.value} numberOfLines={2} ellipsizeMode="tail">
              {user.department || 'Tidak diketahui'}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value} numberOfLines={1} ellipsizeMode="tail">
              {user.email || 'Tidak diketahui'}
            </Text>
          </View>

          {user.startDate && (
            <View style={styles.row}>
              <Text style={styles.label}>Tanggal Mulai:</Text>
              <Text style={styles.value}>{user.startDate}</Text>
            </View>
          )}
        </View>

        {/* Profile Photo Section */}
        <View style={styles.imageBox}>
          {user.profilePictureBase64 ? (
            <Image
              source={{
                uri: `data:image/jpeg;base64,${user.profilePictureBase64}`,
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
                {(user.fullName || 'U').charAt(0).toUpperCase()}
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
  letterGroup: {
    marginBottom: 20,
  },
  letterHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: '#F5F5F5',
    fontFamily: 'Poppins-Bold',
  },
  userCard: {
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
  // Profile image styles
  imageBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    backgroundColor: '#D1D5DB',
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
    color: '#64748B',
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
  },
  // Header with logout button aligned
  headerWithLogout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 16,
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
});
