import { StyleSheet, Text, View } from 'react-native';
import React from 'react';

const UserDetailsCard = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>User’s details</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Name:</Text>
        <Text style={styles.value}>Elshera Dahlan</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>NIP:</Text>
        <Text style={styles.value}>105022310036</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Department:</Text>
        <Text style={styles.value}>IT</Text>
      </View>
    </View>
  );
};

export default UserDetailsCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    color: '#999',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontFamily:'Poppins-Bold',
    width: 130,
  },
  value: {
    fontFamily: 'Poppins-Bold',
  },
});