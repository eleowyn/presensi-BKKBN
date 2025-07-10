import React from 'react';
import {StyleSheet, ScrollView, Text, View} from 'react-native';
import PieChart from 'react-native-pie-chart';

const OverallChart = () => {
  return (
    <ScrollView style={{flex: 1}}>
      <View style={styles.container}>
        <Text style={styles.title}>Overall Progress</Text>
        <PieChart widthAndHeight={CHART_SIZE} series={CHART_SERIES} />
      </View>
    </ScrollView>
  );
};

export default OverallChart;

const CHART_SIZE = 250;

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
  title: {
    fontSize: 24,
    margin: 10,
  },
});
