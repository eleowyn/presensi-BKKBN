import {StyleSheet, ScrollView, View, SafeAreaView} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  Buttonnavigation,
  WeeklyChart,
  OverallChart,
  TextTitle,
  Header,
} from '../../components/index';

const Home = ({navigation}) => {
  const [firstname, setFirstName] = useState('User');
  const [loading, setLoading] = useState(true);
  //   const [totalMeetingsWeekly, setTotalMeetingsWeekly] = useState(0);
  const [attendanceWeekly, setAttendanceWeekly] = useState(1);
  const [lateWeekly, setLateWeekly] = useState(1);
  const [excusedWeekly, setExcusedWeekly] = useState(1);
  const [unexcusedWeekly, setUnexcusedWeekly] = useState(1);
  //   const [totalMeetingsOverall, setTotalMeetingsOverall] = useState(1);
  const [attendanceOverall, setAttendanceOverall] = useState(1);
  const [lateOverall, setLateOverall] = useState(1);
  const [excusedOverall, setExcusedOverall] = useState(1);
  const [unexcusedOverall, setUnexcusedOverall] = useState(1);

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
      <Buttonnavigation />
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },
});
