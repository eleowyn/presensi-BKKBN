import { StyleSheet, TextInput, View } from 'react-native';
import React from 'react';

const TextInputAdmin = ({
  text = "Choose date",
  placeholder = "Choose session",
  leftValue,
  rightValue,
  onLeftChange,
  onRightChange,
  placeholderTextColor = "#999",
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={[styles.input]}
        placeholder={text}
        placeholderTextColor={placeholderTextColor}
        value={leftValue}
        onChangeText={onLeftChange}
        editable={false}
        {...props}
      />
      <TextInput
        style={[styles.input]}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        value={rightValue}
        onChangeText={onRightChange}
        editable={false}
        {...props}
      />
    </View>
  );
};

export default TextInputAdmin;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#333',
    textAlign: 'left',
  },
});
