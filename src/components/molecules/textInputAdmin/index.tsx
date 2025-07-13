import { StyleSheet, TextInput, View, Text, TouchableOpacity } from 'react-native';
import React from 'react';

const TextInputAdmin = ({
  text = "Choose date",
  placeholder = "Choose session",
  leftValue,
  rightValue,
  onLeftChange,
  onRightChange,
  onLeftPress,
  onRightPress,
  isLeftDropdown = false,
  isRightDropdown = false,
  placeholderTextColor = "#999",
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, style]}>
      {isLeftDropdown ? (
        <TouchableOpacity
          style={styles.input}
          onPress={onLeftPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.dropdownText, !leftValue && { color: placeholderTextColor }]}>
            {leftValue || text}
          </Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>
      ) : (
        <TextInput
          style={styles.input}
          placeholder={text}
          placeholderTextColor={placeholderTextColor}
          value={leftValue}
          onChangeText={onLeftChange}
          {...props}
        />
      )}

      {isRightDropdown ? (
        <TouchableOpacity
          style={styles.input}
          onPress={onRightPress}
          activeOpacity={0.7}
        >
          <Text style={[styles.dropdownText, !rightValue && { color: placeholderTextColor }]}>
            {rightValue || placeholder}
          </Text>
          <Text style={styles.dropdownIcon}>▼</Text>
        </TouchableOpacity>
      ) : (
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          value={rightValue}
          onChangeText={onRightChange}
          {...props}
        />
      )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#333',
  },
  dropdownIcon: {
    fontSize: 10,
    color: '#999',
    marginLeft: 8,
  },
});
