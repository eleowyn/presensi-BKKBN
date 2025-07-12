import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

interface AdminCardProps {
  status?: string;
  name?: string;
  nip?: string;
  department?: string;
}

const Admincard = ({
  status = 'Present',
  name = 'Elshera Dahlan',
  nip = '105022310036',
  department = 'IT Department',
}: AdminCardProps) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Present':
        return {
          badge: {backgroundColor: '#B4FFB1'},
          text: {color: '#2B6000'},
        };
      case 'Late':
        return {
          badge: {backgroundColor: '#FFF3B1'},
          text: {color: '#8A6E00'},
        };
      case 'Excused':
        return {
          badge: {backgroundColor: '#B1D6FF'},
          text: {color: '#004E8A'},
        };
      case 'Unexcused':
        return {
          badge: {backgroundColor: '#FFB1B1'},
          text: {color: '#8A0000'},
        };
      default:
        return {
          badge: {backgroundColor: '#CCCCCC'},
          text: {color: '#333333'},
        };
    }
  };
  return (
    <TouchableOpacity>
      <View style={styles.card}>
        <View style={[styles.statusBadge, getStatusStyle(status).badge]}>
          <Text style={[styles.statusText, getStatusStyle(status).text]}>
            {status}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <View style={styles.textSection}>
            <View style={styles.row}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{name}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>NIP:</Text>
              <Text style={styles.value}>{nip}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Department:</Text>
              <Text style={styles.value}>{department}</Text>
            </View>
          </View>
          <View style={styles.imageBox} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    marginHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 2,
    elevation: 3,
    borderColor: '#E8E8E8',
    borderWidth: 1,
  },
  statusBadge: {
    backgroundColor: '#B4FFB1',
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderRadius: 37,
    marginBottom: 16,
    width: 100,
  },
  statusText: {
    fontFamily: 'Poppins-SemiBold',
    color: '#2B6000',
    fontSize: 12,
    alignSelf: 'center',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textSection: {
    flex: 1,
    paddingRight: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 12,
    color: '#333333',
    fontWeight: '600',
    width: 90,
  },
  value: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#666666',
    flex: 1,
  },
  imageBox: {
    width: 100,
    height: 100,
    backgroundColor: '#CCCCCC',
    borderRadius: 12,
  },
});

export default Admincard;
