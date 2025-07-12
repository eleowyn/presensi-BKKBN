import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ButtonNavAdmin, Header } from '../../components';
import Admincard from '../../components/molecules/adminCard';

const DashboardAdmin = () => {
  const [selectedDepartment, setSelectedDepartment] = useState('Select Department');
  const [searchName, setSearchName] = useState('');
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);

  const departments = ['All Departments', 'IT Department', 'HR Department', 'Finance Department', 'Marketing Department'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentWrapper}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <Header text="Admin"/>
          <View style={styles.filterContainer}>
            <View style={styles.filterRow}>
              <TouchableOpacity 
                style={styles.dropdownContainer}
                onPress={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
              >
                <Text style={styles.dropdownText}>{selectedDepartment}</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.searchInput}
                placeholder="Search Name"
                placeholderTextColor="#999"
                value={searchName}
                onChangeText={setSearchName}
              />
            </View>
            {showDepartmentDropdown && (
              <View style={styles.dropdownOptions}>
                {departments.map((dept, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dropdownOption}
                    onPress={() => {
                      setSelectedDepartment(dept);
                      setShowDepartmentDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownOptionText}>{dept}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View>
            <Admincard 
            status="Late"
            name = 'Elshera Dahlan'
            nip = '105022310036'
            department = 'IT Department'/>
            <Admincard 
            status="Present"
            name = 'Elshera Dahlan'
            nip = '105022310036'
            department = 'IT Department'/>
            <Admincard 
            status="Excused"
            name = 'Elshera Dahlan'
            nip = '105022310036'
            department = 'IT Department'/>
            <Admincard 
            status="Unexcused"
            name = 'Elshera Dahlan'
            nip = '105022310036'
            department = 'IT Department'/>
            <Admincard 
            status="Present"
            name = 'Elshera Dahlan'
            nip = '105022310036'
            department = 'IT Department'/>
          </View>
        </ScrollView>
        <ButtonNavAdmin />
      </View>
    </SafeAreaView>
  );
};

export default DashboardAdmin;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 130,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  dropdownContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E8E8E8',
  },
  dropdownText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#666',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#666',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: '#333',
  },
  dropdownOptions: {
    backgroundColor: '#E8E8E8',
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#BEBBBB',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownOptionText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#333',
  },
});
