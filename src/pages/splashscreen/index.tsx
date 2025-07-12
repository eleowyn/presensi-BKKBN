import {StyleSheet, View, Animated, Dimensions} from 'react-native';
import React, {useEffect, useRef} from 'react';
import Logo from '../../assets/Logo_Kementerian_Kependudukan_dan_Pembangunan_Keluarga_-_BKKBN_(2024)_.svg';
import LogoBkkbn from '../../assets/textBKKBN.svg';
import {useNavigation} from '@react-navigation/native';
const {width, height} = Dimensions.get('window');

const SplashScreen = () => {
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const slideAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  useEffect(() => {
    // First animation: Logo 1 fades in
    Animated.timing(fadeAnim1, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      // After fade in, wait 500ms then slide first logo to the left
      setTimeout(() => {
        Animated.timing(slideAnim1, {
          toValue: -75, // Move left by 75 pixels (half logo width + some spacing)
          duration: 600,
          useNativeDriver: true,
        }).start(() => {
          // After first logo slides to the left, fade in second logo
          Animated.timing(fadeAnim2, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }).start(() => {
            // After all animations complete, navigate to Login screen after 1 second
            setTimeout(() => {
              navigation.navigate('Login');
            }, 1000);
          });
        });
      }, 500);
    });
  }, [fadeAnim1, slideAnim1, fadeAnim2]);

  return (
    <View style={styles.container}>
      {/* First Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          styles.firstLogoContainer,
          {
            opacity: fadeAnim1,
            transform: [{translateX: slideAnim1}],
          },
        ]}>
        <Logo style={styles.logo} />
      </Animated.View>

      {/* Second Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          styles.secondLogoContainer,
          {
            opacity: fadeAnim2,
          },
        ]}>
        <LogoBkkbn style={styles.logo} />
      </Animated.View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 125,
    height: 125,
  },
  firstLogoContainer: {
    top: height / 2 - 62.5, // Center vertically
    left: width / 2 - 50.5, // Center horizontally (will slide left)
  },
  secondLogoContainer: {
    top: height / 2 - 62.5, // Same vertical position as first logo
    left: width / 2 + 5, // Position to the right of center (75px slide left + 20px spacing + 62.5px center offset)
  },
  logo: {
    width: 125,
    height: 125,
  },
});
