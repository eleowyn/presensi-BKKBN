import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import React from 'react';

const Button = ({text = 'Press Button', ...rest}) => {
  return (
    <View>
      <TouchableOpacity style={styles.button} {...rest}>
        <Text style={styles.text}>{text}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Button;

const styles = StyleSheet.create({
  button: {
    width: 345,
    height: 55,

    borderRadius: 13,
    margin: 15,
    alignSelf: 'center',

    backgroundColor: '#1C272F',
  },
  text: {
    margin: 17,

    alignSelf: 'center',

    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
  },
});
