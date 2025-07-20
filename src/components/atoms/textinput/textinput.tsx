import {View, TextInput as Input, StyleSheet} from 'react-native';
import React from 'react';

const TextInput = ({
  placeholder = 'No Placeholder',
  marginBottom = 7,
  bg = '#FFFFFF',
  ...rest
}) => {
  return (
    <View style={styles.container(marginBottom)}>
      <Input
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0" // Tambahkan ini
        {...rest}
        style={styles.Input(bg)}
      />
    </View>
  );
};

export default TextInput;

const styles = StyleSheet.create({
  container: marginBottom => ({
    marginBottom: marginBottom,
  }),
  Input: bg => ({
    height: 60,
    width: 345,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 19,
    borderColor: '#CFCFCF',
    backgroundColor: bg, // Diperbaiki di sini
    color: '#000000', // Tambahkan warna teks default
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    alignSelf: 'center',
  }),
});
