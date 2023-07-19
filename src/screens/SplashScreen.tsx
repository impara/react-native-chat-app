import React, {useEffect} from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useAuth} from '../utils/AuthContext';
import {StackNavigatorParams} from '../../App';

type SplashScreenNavigationProp = StackNavigationProp<
  StackNavigatorParams,
  'Loading'
>;

type Props = {
  navigation: SplashScreenNavigationProp;
};

const SplashScreen: React.FC<Props> = ({navigation}) => {
  const {user} = useAuth();

  useEffect(() => {
    const splashTimeout = setTimeout(() => {
      if (user) {
        navigation.replace('ChatRooms');
      } else {
        navigation.replace('Login');
      }
    }, 2000);

    return () => {
      clearTimeout(splashTimeout);
    };
  }, [navigation, user]);

  return (
    <View style={styles.container}>
      {/* Loading indicator */}
      <View style={styles.content}>
        <Text>Loading...</Text>
        <ActivityIndicator size="large" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20, // Add some padding for better visibility
    backgroundColor: '#f2f2f2', // Add a background color to the header
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SplashScreen;
