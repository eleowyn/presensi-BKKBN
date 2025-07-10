import {StyleSheet, ScrollView, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
  Buttonnavigation,
  WeeklyChart,
  OverallChart,
  TextTitle,
  Header,
} from '../../components/index';

const Home = () => {
  const [firstname, setFirstName] = useState('User');
  const [loading, setLoading] = useState(true);
  //   const [totalMeetingsWeekly, setTotalMeetingsWeekly] = useState(0);
  const [attendanceWeekly, setAttendanceWeekly] = useState(0);
  const [lateWeekly, setLateWeekly] = useState(0);
  const [excusedWeekly, setExcusedWeekly] = useState(0);
  const [unexcusedWeekly, setUnexcusedWeekly] = useState(0);
  //   const [totalMeetingsOverall, setTotalMeetingsOverall] = useState(0);
  const [attendanceOverall, setAttendanceOverall] = useState(0);
  const [lateOverall, setLateOverall] = useState(0);
  const [excusedOverall, setExcusedOverall] = useState(0);
  const [unexcusedOverall, setUnexcusedOverall] = useState(0);

  return (
    <View>
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
    </View>
  );
};

export default Home;
