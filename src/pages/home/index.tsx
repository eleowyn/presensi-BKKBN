import {
  StyleSheet,
  ScrollView,
  View,
  SafeAreaView,
  Text,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  Buttonnavigation,
  WeeklyChart,
  OverallChart,
  TextTitle,
  Header,
} from '../../components/index';
import {getDatabase, ref, onValue} from 'firebase/database';
import {getAuth} from 'firebase/auth';
import {showMessage} from 'react-native-flash-message';

const Home = ({navigation}) => {
  const [firstname, setFirstName] = useState('User');
  const [loading, setLoading] = useState(true);
  const [attendanceWeekly, setAttendanceWeekly] = useState(0);
  const [lateWeekly, setLateWeekly] = useState(0);
  const [excusedWeekly, setExcusedWeekly] = useState(0);
  const [unexcusedWeekly, setUnexcusedWeekly] = useState(0);
  const [attendanceOverall, setAttendanceOverall] = useState(0);
  const [lateOverall, setLateOverall] = useState(0);
  const [excusedOverall, setExcusedOverall] = useState(0);
  const [unexcusedOverall, setUnexcusedOverall] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentWeekRange, setCurrentWeekRange] = useState('');

  // Helper function to get start and end of current week
  const getWeekRange = () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0); // Set to beginning of day

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday
    endOfWeek.setHours(23, 59, 59, 999); // Set to end of day

    return {startOfWeek, endOfWeek};
  };

  // Helper function to check if date is within current week
  const isDateInCurrentWeek = (
    dateToCheck: Date,
    startOfWeek: Date,
    endOfWeek: Date,
  ) => {
    return dateToCheck >= startOfWeek && dateToCheck <= endOfWeek;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          setLoading(false);
          showMessage({
            message: 'Error',
            description: 'User not authenticated',
            type: 'danger',
            duration: 3000,
          });
          return;
        }

        const db = getDatabase();
        const {startOfWeek, endOfWeek} = getWeekRange();

        setCurrentWeekRange(
          `${startOfWeek.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
          })} - ${endOfWeek.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
          })}`,
        );

        const userRef = ref(db, `users/${user.uid}`);
        onValue(userRef, snapshot => {
          const userData = snapshot.val();
          if (userData?.fullName) {
            const nameParts = userData.fullName.split(' ');
            setFirstName(nameParts[0]);
          }
        });

        const attendanceRef = ref(db, `attendance/${user.uid}`);
        onValue(
          attendanceRef,
          snapshot => {
            const attendanceData = snapshot.val();
            let weeklyCounts = {
              present: 0,
              late: 0,
              excused: 0,
              unexcused: 0,
              total: 0,
            };
            let overallCounts = {
              present: 0,
              late: 0,
              excused: 0,
              unexcused: 0,
              total: 0,
            };
            if (attendanceData) {
              Object.values(attendanceData).forEach((record: any) => {
                const recordTimestamp = record.tanggal;

                let recordDate;
                if (
                  typeof recordTimestamp === 'string' &&
                  recordTimestamp.includes('/')
                ) {
                  const parts = recordTimestamp.split('/');
                  recordDate = new Date(
                    Number(parts[2]),
                    Number(parts[1]) - 1,
                    Number(parts[0]),
                  );
                } else {
                  recordDate = new Date(recordTimestamp);
                }

                // Pengecekan tanggal tidak valid
                if (isNaN(recordDate.getTime())) {
                  console.warn(
                    'Invalid date format, skipping record:',
                    recordTimestamp,
                  );
                  return;
                }

                console.log('======================================');
                console.log('Mengecek Record:', recordTimestamp);
                console.log(
                  '--> Tanggal Hasil Parse (recordDate):',
                  recordDate.toISOString(),
                );
                console.log(
                  '--> Awal Minggu (startOfWeek):',
                  startOfWeek.toISOString(),
                );
                console.log(
                  '--> Akhir Minggu (endOfWeek):',
                  endOfWeek.toISOString(),
                );
                console.log(
                  '--> Apakah Dalam Minggu Ini?:',
                  isDateInCurrentWeek(recordDate, startOfWeek, endOfWeek),
                );
                console.log('======================================');

                const status = record.status?.toLowerCase();

                // Count for overall statistics
                overallCounts.total++;
                if (status) {
                  switch (status) {
                    case 'present':
                      overallCounts.present++;
                      break;
                    case 'late':
                      overallCounts.late++;
                      break;
                    case 'excused':
                      overallCounts.excused++;
                      break;
                    case 'unexcused':
                      overallCounts.unexcused++;
                      break;
                  }
                }

                // Count for weekly statistics if within current week
                if (isDateInCurrentWeek(recordDate, startOfWeek, endOfWeek)) {
                  // Jika console.log di atas menunjukkan "true", maka record ini akan dihitung
                  weeklyCounts.total++;
                  if (status) {
                    switch (status) {
                      case 'present':
                        weeklyCounts.present++;
                        break;
                      case 'late':
                        weeklyCounts.late++;
                        break;
                      case 'excused':
                        weeklyCounts.excused++;
                        break;
                      case 'unexcused':
                        weeklyCounts.unexcused++;
                        break;
                    }
                  }
                }
              });
            }

            setTotalRecords(overallCounts.total);
            setAttendanceWeekly(weeklyCounts.present);
            setLateWeekly(weeklyCounts.late);
            setExcusedWeekly(weeklyCounts.excused);
            setUnexcusedWeekly(weeklyCounts.unexcused);
            setAttendanceOverall(overallCounts.present);
            setLateOverall(overallCounts.late);
            setExcusedOverall(overallCounts.excused);
            setUnexcusedOverall(overallCounts.unexcused);
            setLoading(false);
          },
          error => {
            console.error('Error reading attendance data:', error);
            showMessage({
              message: 'Error',
              description: 'Failed to load attendance data',
              type: 'danger',
              duration: 3000,
            });
            setLoading(false);
          },
        );
      } catch (error) {
        console.error('Error fetching data:', error);
        showMessage({
          message: 'Error',
          description: 'An error occurred while loading data',
          type: 'danger',
          duration: 3000,
        });
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header text={`Hai, ${firstname}`} />

        <TextTitle text={`Here's Your Weekly Statistics`} />
        <Text style={styles.weekRange}>Minggu Ini: {currentWeekRange}</Text>
        <WeeklyChart
          Attendance={attendanceWeekly}
          Late={lateWeekly}
          Excused={excusedWeekly}
          Unexcused={unexcusedWeekly}
        />

        <View style={styles.sectionSpacer} />

        <TextTitle text={`Here's Your Overall Statistics`} />
        <OverallChart
          Attendance={attendanceOverall}
          Late={lateOverall}
          Excused={excusedOverall}
          Unexcused={unexcusedOverall}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>
      <Buttonnavigation navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  totalRecords: {
    textAlign: 'center',
    marginVertical: 10,
    fontSize: 16,
    color: '#666',
  },
  weekRange: {
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  sectionSpacer: {
    marginBottom: 30,
  },
  bottomSpacer: {
    marginBottom: 100,
  },
});

export default Home;
