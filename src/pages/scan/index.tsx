import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput as RNTextInput,
} from 'react-native';
import React, {useState} from 'react';
import {Button, Buttonnavigation, Header} from '../../components';

const Scan = ({navigation}: {navigation: any}) => {
  const [tanggal, setTanggal] = useState('11/09/2025');
  const [waktu, setWaktu] = useState('10.30');
  const [tempat, setTempat] = useState('Manado');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Header text="Absensi" />
        <View style={styles.content}>
          <View style={styles.photoSection}>
            <Text style={styles.sectionLabel}>Photo</Text>
            <View style={styles.photoPlaceholder} />
          </View>
          <View style={styles.bottomSection}>
            <View style={styles.formColumn}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tanggal</Text>
                <RNTextInput
                  value={tanggal}
                  onChangeText={setTanggal}
                  placeholder="DD/MM/YYYY"
                  style={styles.dateTimeInput}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Waktu</Text>
                <RNTextInput
                  value={waktu}
                  onChangeText={setWaktu}
                  placeholder="HH.MM"
                  style={styles.dateTimeInput}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Lokasi</Text>
                <RNTextInput
                  value={tempat}
                  onChangeText={setTempat}
                  placeholder="Location"
                  style={styles.dateTimeInput}
                />
              </View>
            </View>
          </View>
        </View>
        <Button text="Confirm" />
        <View style={{marginBottom: 100}}></View>
      </ScrollView>
      <Buttonnavigation navigation={navigation} />
    </SafeAreaView>
  );
};

export default Scan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  photoSection: {
    marginBottom: 30,
    alignItems: 'center',
  },
  sectionLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#000000',
    marginBottom: 10,
    alignSelf: 'center',
  },
  photoPlaceholder: {
    width: 350,
    height: 280,
    borderRadius: 20,
    backgroundColor: '#CCCCCC',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
  },
  formColumn: {
    flex: 1,
  },
  locationColumn: {
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 20,
    alignSelf: 'center',
  },
  inputLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: '#000000',
    marginBottom: 8,
  },
  dateTimeInput: {
    width: 345,
    height: 50,
    borderWidth: 2,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderColor: '#CFCFCF',
    backgroundColor: '#FFFFFF',
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.3,
    elevation: 8,
  },
  locationPlaceholder: {
    width: 170,
    height: 170,
    borderRadius: 15,
    backgroundColor: '#CCCCCC',
  },
});
