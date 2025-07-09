import {View, TextInput as Input, StyleSheet} from 'react-native';
import React from 'react';

const TextInput = ({
  placeholder = 'No Placeholder',
  marginBottom = 30,
  ...rest
}) => {
  return (
    <View style={styles.container(marginBottom)}>
      <Input placeholder={placeholder} {...rest} style={styles.Input} />
    </View>
  );
};

export default TextInput;

const styles = StyleSheet.create({
  container: marginBottom => ({
    marginBottom: marginBottom,
  }),
  Input: {
    height: 60,
    width: 345,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 19,

    borderColor: '#CFCFCF',
    backgroundColor: '#FFFFFF',

    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    alignSelf: 'center',
  },
});
