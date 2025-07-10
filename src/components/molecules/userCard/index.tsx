import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

const Card = ({ status = 'Present', date = '08 July 2025', location = 'GK2 - 108', time = '07.30', keterangan = '' }) => {
  return (
    <View style={styles.card}>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.textSection}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{date}</Text>

          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{location}</Text>

          <Text style={styles.label}>Start Time:</Text>
          <Text style={styles.value}>{time}</Text>

          <Text style={styles.label}>Keterangan:</Text>
          <Text style={styles.value}>{keterangan}</Text>
        </View>
        <View style={styles.imageBox} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    borderColor: '#E0E0E0',
    borderWidth: 1,
  },
  statusBadge: {
    backgroundColor: '#B5F2C8',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 12,
  },
  statusText: {
    color: '#1A7F37',
    fontFamily: 'Poppins-Semibold',
    fontSize: 15,
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textSection: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontFamily: 'Poppins-Semibold',
    fontSize: 14,
    color: '#333',
  },
  value: {
    marginBottom: 6,
    fontSize: 14,
    color: '#000',
  },
  imageBox: {
    width: 80,
    height: 80,
    backgroundColor: '#D9D9D9',
    borderRadius: 16,
    marginLeft: 12,
  },
});

export default Card;