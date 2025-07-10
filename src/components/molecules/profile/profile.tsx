import { ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';

const ProfileCard = ({text = "isilah", placeholder = "blabla"}) => {
  return (
    <ScrollView>
      <View style={styles.container}>
        <View style={styles.cardContainer}>
          <Text style={styles.text}>{text}</Text>
          <Text style={styles.placeholder}>{placeholder}</Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default ProfileCard;

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 30,
    marginVertical: 10,
    padding: 20,
    borderWidth: 1,
    borderRadius: 11,
    borderColor: 'gray',
  },
  text: {
    fontFamily: 'Poppins-Medium',
    fontSize: 15,
  },
  placeholder: {
    fontFamily: 'Poppins-Light',
    fontSize: 13,
  }
});