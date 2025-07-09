import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const TextTitle = ({text = 'Text template'}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

export default TextTitle;

const styles = StyleSheet.create({
  container: {
    margin: 10,
    marginLeft: 30,
  },
  text: {
    fontFamily: 'Poppins-Medium',
  },
});
