import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Button, ButtonNavAdmin, Header, ScanDetailsCard, UserDetailsCard } from '../../components';

const UserDetail = ({navigation}) => {
  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.contentWrapper}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <Header text="User Details"/>
                <View>
                    <View style={styles.imageBox} />
                </View>
                <View>
                    <View>
                        <UserDetailsCard/>
                        <ScanDetailsCard/>
                    </View>
                </View>
                <Button text="Confirm"/>
            </ScrollView>
            <ButtonNavAdmin navigation={navigation} />
        </View>
    </SafeAreaView>
  );
};

export default UserDetail;

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
  imageBox: {
    width: 306,
    height: 306,
    backgroundColor: '#CCCCCC',
    borderRadius: 12,
    alignSelf: 'center',
  },
});