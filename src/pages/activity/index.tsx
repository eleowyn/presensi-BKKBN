import {StyleSheet, View, SafeAreaView} from 'react-native';
import React from 'react';
import {Buttonnavigation, Card, Header} from '../../components';
import {getDatabase, ref, onValue} from 'firebase/database';

const Activity = ({navigation}) => {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const attendanceRef = ref(db, 'attendance');

    const unsubscribe = onValue(attendanceRef, snapshot => {
      const data = snapshot.val();
      const activitiesList = [];

      if (data) {
        for (const userId in data) {
          for (const recordId in data[userId]) {
            const record = data[userId][recordId];
            activitiesList.push({
              id: recordId,
              status:
                record.statistics?.overall?.attendance === 0
                  ? 'Present'
                  : 'Unknown',
              date: record.tanggal || 'Unknown',
              location: record.location?.fullAddress || 'Unknown',
              time: record.waktu || 'Unknown',
              keterangan: record.keterangan || '',
            });
          }
        }
      }

      setActivities(activitiesList);
    });

    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Header text="History" />
      <Card />
      <View style={{marginBottom: 150}}></View>
      <Buttonnavigation navigation={navigation} />
    </SafeAreaView>
  );
};

export default Activity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'white',
  },
});
