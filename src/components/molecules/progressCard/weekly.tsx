import React from 'react';
import {StyleSheet, ScrollView, Text, View} from 'react-native';
import PieChart from 'react-native-pie-chart';

const WeeklyChart = () => {
  return (
    <ScrollView style={{flex: 1}}>
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
    </ScrollView>
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
  container: {
    flex: 1,
    alignItems: 'center',
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
