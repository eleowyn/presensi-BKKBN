import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ScanDetailsCard = () => {
  const [status, setStatus] = React.useState('Present');
  const [showStatusDropdown, setShowStatusDropdown] = React.useState(false);

  const statusOptions = ['Present', 'Late', 'Excused', 'Unexcused'];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Present':
        return {
          badge: { backgroundColor: '#B4FFB1' },
          text: { color: '#2B6000' },
        };
      case 'Late':
        return {
          badge: { backgroundColor: '#FFF3B1' },
          text: { color: '#8A6E00' },
        };
      case 'Excused':
        return {
          badge: { backgroundColor: '#B1D6FF' },
          text: { color: '#004E8A' },
        };
      case 'Unexcused':
        return {
          badge: { backgroundColor: '#FFB1B1' },
          text: { color: '#8A0000' },
        };
      default:
        return {
          badge: { backgroundColor: '#CCCCCC' },
          text: { color: '#333333' },
        };
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Scan details</Text>

      <View style={styles.rowBetween}>
        <View style={styles.textSection}>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>11/11/2025</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Time:</Text>
            <Text style={styles.value}>10.50 am</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                style={styles.dropdownContainer}
                onPress={() => setShowStatusDropdown(!showStatusDropdown)}>
                <Text style={styles.dropdownText}>{status}</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
              
              {showStatusDropdown && (
                <View style={styles.dropdownOptions}>
                  {statusOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.dropdownOption}
                      onPress={() => {
                        setStatus(option);
                        setShowStatusDropdown(false);
                      }}>
                      <Text style={styles.dropdownOptionText}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.imageBox} />
      </View>

      <View style={[styles.statusBadge, getStatusStyle(status).badge]}>
        <Text style={[styles.statusText, getStatusStyle(status).text]}>
          {status}
        </Text>
      </View>
    </View>
  );
};

export default ScanDetailsCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    marginHorizontal: 18,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  title: {
    fontFamily: 'Poppins-Medium',
    color: '#777',
    marginBottom: 12,
    fontSize: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textSection: {
    flex: 1,
    paddingRight: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontFamily: 'Poppins-Bold',
    width: 70,
    fontSize: 14,
    color: '#333',
  },
  value: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  imageBox: {
    width: 130,
    height: 130,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
  },
  dropdownWrapper: {
    flex: 1,
    position: 'relative',
  },
  dropdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#C0C0C0',
    height: 35,
  },
  dropdownText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#000',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#666',
  },
  dropdownOptions: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C0C0C0',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1000,
  },
  dropdownOption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownOptionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    textAlign: 'center',
  },
});
