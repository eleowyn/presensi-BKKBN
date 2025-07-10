import React from 'react';
import {StyleSheet, ScrollView, Text, View} from 'react-native';
import PieChart from 'react-native-pie-chart';

const OverallChart = ({
  size = 250,
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
        fontSize: 13,
      },
    },
    {
      value: Late,
      color: '#ffb300',
      label: {
        text: 'Late',
        fontSize: 13,
      },
    },
    {
      value: Excused,
      color: '#ff9100',
      label: {
        text: 'Excused',
        fontSize: 13,
      },
    },
    {
      value: Unexcused,
      color: '#ff6c00',
      label: {
        text: 'Unexcused',
        fontSize: 13,
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
              fontSize: 20,
              fontFamily: 'Poppins-Medium',
            },
          },
        ]
      : allSeries.filter(item => item.value > 0);

  return (
    <ScrollView style={{flex: 1}}>
      <View style={styles.container}>
        <PieChart widthAndHeight={CHART_SIZE} series={CHART_SERIES} />
      </View>
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
      </View>
    </ScrollView>
  );
};

export default OverallChart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    margin: 10,
  },
  font: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
  },
  data: {
    flexDirection: 'row',
    gap: 20,
  },
  value: {
    gap: 10,
    margin: 5,
  },
  card: {
    flex: 1,
    alignSelf: 'center',
    flexDirection: 'row',
    borderRadius: 10,
    gap: 50,
    backgroundColor: '#FFFCEF',
    margin: 40,
    padding: 30,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 7,
    overflow: 'hidden',
  },
});
