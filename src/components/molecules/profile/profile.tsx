import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const ProfileCard = ({text = "isilah", placeholder = "blabla", loading = false}) => {
  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.text}>{text}</Text>
        <Text style={[styles.placeholder, loading && styles.loadingText]}>
          {loading ? 'Loading...' : placeholder}
        </Text>
      </View>
    </View>
  )
}

export default ProfileCard;

const styles = StyleSheet.create({
  container: {
    // Remove unnecessary container styles
  },
  cardContainer: {
    marginHorizontal: 30,
    marginVertical: 10,
    padding: 20,
    borderWidth: 1,
    borderRadius: 11,
    borderColor: 'gray',
    backgroundColor: 'white',
  },
  text: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
    color: '#333',
    marginBottom: 5,
  },
  placeholder: {
    fontFamily: 'Poppins-Medium',
    fontSize: 13,
    color: '#666',
  },
  loadingText: {
    fontStyle: 'italic',
    color: '#999',
  }
});
