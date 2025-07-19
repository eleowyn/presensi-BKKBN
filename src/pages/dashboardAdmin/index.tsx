import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {getDatabase, ref, onValue, off} from 'firebase/database';
import {getAuth} from 'firebase/auth';
import {showMessage} from 'react-native-flash-message';
import AdminCard from '../../components/molecules/adminCard';

interface UserData {
  fullName?: string;
  email?: string;
  department?: string;
  NIP?: string;
  startDate?: string;
  profilePictureBase64?: string;
  role?: string;
}

interface UserWithId extends UserData {
  id: string;
}

const Dashboard = ({navigation}: {navigation: any}) => {
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const fetchUsers = () => {
      try {
        const db = getDatabase();
        const usersRef = ref(db, 'users');

        const listener = onValue(
          usersRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const usersData = snapshot.val();
              const usersList: UserWithId[] = Object.keys(usersData)
                .map(userId => ({
                  id: userId,
                  ...usersData[userId]
                }))
                // Filter out admin users or current user if needed
                .filter(user => user.role !== 'admin' || user.id !== currentUser?.uid)
                .sort((a, b) => {
                  // Sort by name, putting users with names first
                  const nameA = a.fullName || '';
                  const nameB = b.fullName || '';
                  return nameA.localeCompare(nameB);
                });

              setUsers(usersList);
              setFilteredUsers(usersList);
              setError(null);
            } else {
              setUsers([]);
              setFilteredUsers([]);
              setError('No users found');
            }
            
            setLoading(false);
            setRefreshing(false);
          },
          (error: any) => {
            console.error('Firebase users fetch error:', error);
            
            let errorMessage = 'Failed to load users';
            
            if (error?.code === 'PERMISSION_DENIED') {
              errorMessage = 'Permission denied. Check Firebase security rules.';
            } else if (error?.code === 'NETWORK_ERROR') {
              errorMessage = 'Network error. Please check your connection.';
            }

            setError(errorMessage);
            setLoading(false);
            setRefreshing(false);

            showMessage({
              message: 'Database Error',
              description: errorMessage,
              type: 'danger',
              duration: 5000,
            });
          }
        );

        unsubscribe = () => off(usersRef, 'value', listener);
      } catch (error) {
        console.error('Setup error:', error);
        setError('Failed to initialize user data');
        setLoading(false);
      }
    };

    fetchUsers();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser?.uid]);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user => {
        const query = searchQuery.toLowerCase();
        return (
          user.fullName?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.department?.toLowerCase().includes(query) ||
          user.NIP?.toLowerCase().includes(query)
        );
      });
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const handleRefresh = () => {
    setRefreshing(true);
    setError(null);
    // The useEffect will handle the refresh automatically
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderUserCard = ({item}: {item: UserWithId}) => (
    <AdminCard
      userId={item.id}
      onPress={() => {
        navigation.navigate('UserDetail', {
          userId: item.id,
          name: item.fullName || 'Unknown User',
          nip: item.NIP || 'Not specified',
          department: item.department || 'Not specified',
          email: item.email || 'No email',
        });
      }}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>
        {searchQuery ? 'No users found' : 'No users available'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery 
          ? 'Try adjusting your search criteria'
          : 'Users will appear here once they register'
        }
      </Text>
      {searchQuery && (
        <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
          <Text style={styles.clearButtonText}>Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Manage user attendance and data</Text>
      
      {currentUser?.email && (
        <Text style={styles.info}>
          Logged in as: {currentUser.email}
        </Text>
      )}

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Total Users</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{filteredUsers.length}</Text>
          <Text style={styles.statLabel}>Filtered Results</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, department, or NIP..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={clearSearch} style={styles.clearSearchButton}>
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error && users.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to Load Users</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredUsers}
        renderItem={renderUserCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#0066CC']}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  errorTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#d32f2f',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
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
  header: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginBottom: 10,
  },
  info: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#0066CC',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    minWidth: 120,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#0066CC',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    position: 'relative',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  clearSearchButton: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{translateY: -10}],
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearSearchText: {
    fontSize: 16,
    color: '#999',
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  clearButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
});