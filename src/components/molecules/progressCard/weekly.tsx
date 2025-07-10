import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import PieChart from 'react-native-pie-chart';

const WeeklyChart = ({
  size = 150,
  Attendance = 0,
  Late = 0,
  Excused = 0,
  Unexcused = 0,
}) => {
  const CHART_SIZE = size;
  const TotalMeetings = Attendance + Late + Excused + Unexcused;

  const allSeries = [
    {
      value: Attendance,
      color: '#fbd203',
      label: {
        text: 'Attendance',
        fontSize: 9,
        fontFamily: 'Poppins-Medium',
      },
    },
    {
      value: Late,
      color: '#ffb300',
      label: {
        text: 'Late',
        fontSize: 9,
        fontFamily: 'Poppins-Medium',
      },
    },
    {
      value: Excused,
      color: '#ff9100',
      label: {
        text: 'Excused',
        fontSize: 9,
        fontFamily: 'Poppins-Medium',
      },
    },
    {
      value: Unexcused,
      color: '#ff6c00',
      label: {
        text: 'Unexcused',
        fontSize: 9,
        fontFamily: 'Poppins-Medium',
      },
    },
  ];

  const CHART_SERIES =
    TotalMeetings === 0
      ? [
          {
            value: 1,
            color: '#CCCCCC',
            label: {
              text: 'No Record',
              offsetY: -50,
              fontFamily: 'Poppins-Medium',
            },
          },
        ]
      : allSeries.filter(item => item.value > 0);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.data}>
          <View style={styles.value}>
            <Text style={styles.font}>Total Meetings</Text>
            <Text style={styles.font}>Attendance</Text>
            <Text style={styles.font}>Late</Text>
            <Text style={styles.font}>Excused</Text>
            <Text style={styles.font}>Unexcused</Text>
          </View>
          <View style={styles.value}>
            <Text style={styles.font}>{TotalMeetings}</Text>
            <Text style={styles.font}>{Attendance}</Text>
            <Text style={styles.font}>{Late}</Text>
            <Text style={styles.font}>{Excused}</Text>
            <Text style={styles.font}>{Unexcused}</Text>
          </View>
        </View>
        <PieChart
          widthAndHeight={CHART_SIZE}
          series={CHART_SERIES}
          cover={0.45}
        />
      </View>
    </View>
  );
};

export default WeeklyChart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignSelf: 'center',
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#FFFCEF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 7,
    overflow: 'hidden',
  },
  card: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 50,
  },
  data: {
    flexDirection: 'row',
    gap: 5,
  },
  value: {
    gap: 10,
    margin: 5,
  },
  font: {
    fontFamily: 'Poppins-Medium',
  },
});
