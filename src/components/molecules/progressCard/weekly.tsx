import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import PieChart from 'react-native-pie-chart';

const WeeklyChart = ({
  size = 150,
  Hadir = 0,
  Terlambat = 0,
  Izin = 0,
  Absen = 0,
}) => {
  const CHART_SIZE = size;
  const TotalMeetings = Hadir + Terlambat + Izin + Absen;

  const allSeries = [
    {
      value: Hadir,
      color: '#fbd203',
      label: {
        text: 'Present',
        fontSize: 9,
        fontFamily: 'Poppins-Medium',
      },
    },
    {
      value: Terlambat,
      color: '#ffb300',
      label: {
        text: 'Late',
        fontSize: 9,
        fontFamily: 'Poppins-Medium',
      },
    },
    {
      value: Izin,
      color: '#ff9100',
      label: {
        text: 'Excused',
        fontSize: 9,
        fontFamily: 'Poppins-Medium',
      },
    },
    {
      value: Absen,
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
            <Text style={styles.font}>Total</Text>
            <Text style={styles.font}>Present</Text>
            <Text style={styles.font}>Late</Text>
            <Text style={styles.font}>Excused</Text>
            <Text style={styles.font}>Unexcused</Text>
          </View>
          <View style={styles.value}>
            <Text style={styles.font}>{TotalMeetings}</Text>
            <Text style={styles.font}>{Hadir}</Text>
            <Text style={styles.font}>{Terlambat}</Text>
            <Text style={styles.font}>{Izin}</Text>
            <Text style={styles.font}>{Absen}</Text>
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
