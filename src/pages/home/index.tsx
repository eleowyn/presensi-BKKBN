import {StyleSheet, ScrollView, View, SafeAreaView, Text} from 'react-native';
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const db = getDatabase();
          const userRef = ref(db, `users/${user.uid}`);

          onValue(
            userRef,
            snapshot => {
              const userData = snapshot.val();

              if (userData) {
                // Set nama user dari data Firebase
                if (userData.fullName) {
                  const nameParts = userData.fullName.split(' ');
                  setFirstName(nameParts[0]); // Ambil nama depan saja
                }

                // Set data statistik jika ada
                if (userData.statistics) {
                  const stats = userData.statistics;

                  // Data mingguan
                  if (stats.weekly) {
                    setAttendanceWeekly(stats.weekly.attendance || 1);
                    setLateWeekly(stats.weekly.late || 1);
                    setExcusedWeekly(stats.weekly.excused || 1);
                    setUnexcusedWeekly(stats.weekly.unexcused || 1);
                  }

                  // Data keseluruhan
                  if (stats.overall) {
                    setAttendanceOverall(stats.overall.attendance || 1);
                    setLateOverall(stats.overall.late || 1);
                    setExcusedOverall(stats.overall.excused || 1);
                    setUnexcusedOverall(stats.overall.unexcused || 1);
                  }
                }
              }
            },
            error => {
              console.error('Error reading user data:', error);
              showMessage({
                message: 'Error',
                description: 'Gagal memuat data pengguna',
                type: 'danger',
                duration: 3000,
              });
            },
          );
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        showMessage({
          message: 'Error',
          description: 'Terjadi kesalahan saat memuat data',
          type: 'danger',
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Memuat data...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header text={`Hai, ${firstname}`} />
        <TextTitle text={'Here’s your weekly statistics'} />
        <WeeklyChart
          Attendance={attendanceWeekly}
          Late={lateWeekly}
          Excused={excusedWeekly}
          Unexcused={unexcusedWeekly}
        />
        <View style={{marginBottom: 30}}></View>
        <TextTitle text={'Here’s your overall statistics'} />
        <OverallChart
          Attendance={attendanceOverall}
          Late={lateOverall}
          Excused={excusedOverall}
          Unexcused={unexcusedOverall}
        />
        <View style={{marginBottom: 100}}></View>
      </ScrollView>
      <Buttonnavigation navigation={navigation} />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'white',
    justifyContent: 'center',
  },
});
