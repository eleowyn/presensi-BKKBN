import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import PieChart from 'react-native-pie-chart';

const WeeklyChart = () => {
  return (
    <View style={styles.card}>
      <View style={styles.container}>
        <View style={styles.data}>
          <View style={styles.value}>
            <Text>Total Meetings</Text>
            <Text>Attendance</Text>
            <Text>Late</Text>
            <Text>Excused</Text>
            <Text>Unexcused</Text>
          </View>
          <View style={styles.value}>
            <Text>3</Text>
            <Text>1</Text>
            <Text>2</Text>
            <Text>0</Text>
            <Text>0</Text>
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

const CHART_SIZE = 150;

const CHART_SERIES = [
  {value: 430, color: '#fbd203', label: {text: 'A', fontWeight: 'bold'}},
  {
    value: 321,
    color: '#ffb300',
    label: {text: 'mobile', offsetY: 10, offsetX: 10},
  },
  {
    value: 185,
    color: '#ff9100',
    label: {text: '%22', fontSize: 8, fontStyle: 'italic', outline: 'white'},
  },
  {value: 123, color: '#ff6c00'},
];

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignSelf: 'center',
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#FFFCEF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 9,
    elevation: 7,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 50,
  },
  data: {
    flexDirection: 'row',
  },
  value: {
    gap: 10,
    margin: 10,
  },
  title: {
    fontSize: 24,
    margin: 10,
  },
});
