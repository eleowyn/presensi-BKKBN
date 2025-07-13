import {
  StyleSheet,
  View,
  ScrollView,
  SafeAreaView,
  Text,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Buttonnavigation, Card, Header} from '../../components';
import {getDatabase, ref, onValue} from 'firebase/database';
import {getAuth} from 'firebase/auth';

const Activity = ({navigation}) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const db = getDatabase();
      const activitiesRef = ref(db, `activities/${user.uid}`);

      const unsubscribe = onValue(activitiesRef, snapshot => {
        const data = snapshot.val();
        if (data) {
          const formatted = Object.values(data);
          setActivities(formatted);
        } else {
          setActivities([]);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setActivities([]);
      setLoading(false);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Header text="History" />
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : activities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Activity</Text>
          </View>
        ) : (
          activities.map((item, index) => (
            <Card
              key={index}
              status={item.status}
              date={item.date}
              location={item.location}
              time={item.time}
              keterangan={item.keterangan || ''}
            />
          ))
        )}
        <View style={{marginBottom: 150}} />
      </ScrollView>
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
  scrollContainer: {
    paddingBottom: 150,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#888',
  },
});
