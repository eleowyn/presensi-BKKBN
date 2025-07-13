import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { ButtonNavAdmin, Header, TextInputAdmin } from '../../components';
import Admincard from '../../components/molecules/adminCard';

const departments = [
  'All Departments',
  'IT Dept.',
  'HR Dept.',
  'Finance Dept.',
  'Marketing Dept.',
];

const Lists = ({ navigation }) => {
  const [selectedDept, setSelectedDept] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSelectDept = (dept) => {
    setSelectedDept(dept);
    setShowDropdown(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Header text="Lists" />

        <View style={styles.textinput}>
          <TextInputAdmin
            style={{ marginBottom: 15 }}
            text="Department"
            leftValue={selectedDept}
            onLeftPress={() => setShowDropdown(!showDropdown)}
            isLeftDropdown={true}
            placeholder="Search Name"
            rightValue={searchText}
            onRightChange={setSearchText}
          />

          {showDropdown && (
            <View style={styles.dropdownBox}>
              {departments.map((dept, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => handleSelectDept(dept)}
                >
                  <Text style={styles.dropdownText}>{dept}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <TextInputAdmin style={styles.textinput1} />
        </View>

        <View style={styles.card}>
          <Admincard />
          <Admincard />
          <Admincard />
          <Admincard />
        </View>
      </ScrollView>

      <ButtonNavAdmin navigation={navigation} />
    </View>
  );
};

export default Lists;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  scrollView: {},
  textinput: {
    paddingTop: 10,
  },
  textinput1: {
    marginBottom: 15,
  },
  card: {
    marginBottom: 130,
  },
  dropdownBox: {
    backgroundColor: '#fff',
    marginTop: -10,
    marginBottom: 10,
    marginHorizontal: 16,
    borderRadius: 8,
    borderColor: '#D0D0D0',
    borderWidth: 1,
    zIndex: 10,
    elevation: 3,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  dropdownText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
});
