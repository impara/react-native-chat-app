import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {LoginManager, AccessToken} from 'react-native-fbsdk-next';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {useAuth} from '../utils/AuthContext';
import {StackNavigatorParams} from '../../App';

type SocialLoginNavigationProp = StackNavigationProp<
  StackNavigatorParams,
  'Login'
>;

const SocialLogin = () => {
  const navigation = useNavigation<SocialLoginNavigationProp>();
  const {loginWithFacebook, loginWithGoogle} = useAuth();

  const handleFacebookLogin = async () => {
    try {
      // Log in with Facebook and request the required permissions
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      // Check if the user cancelled the login process
      if (result.isCancelled) {
        throw new Error('User cancelled the login process');
      }

      // Obtain the Facebook access token
      const data = await AccessToken.getCurrentAccessToken();

      // Check if the access token is available
      if (!data) {
        throw new Error('Something went wrong obtaining the access token');
      }

      // Call the loginWithFacebook function from AuthContext to authenticate with your backend server
      await loginWithFacebook(data.accessToken.toString());

      // Navigate to the next screen after successful login
      navigation.navigate('ChatRooms');
    } catch (error: any) {
      console.error('Facebook login error:', error);
      // Handle the error gracefully and display a user-friendly message
      Alert.alert('Error', error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Check if Google Play Services are available on the device
      await GoogleSignin.hasPlayServices();

      // Initiate Google Sign-In
      const userInfo = await GoogleSignin.signIn();

      // Check if Google ID token is available
      if (userInfo.idToken) {
        // Call Firebase API to authenticate with Google ID token
        await loginWithGoogle(userInfo.idToken);
      }

      // Navigate to Chat Rooms screen after successful login
      navigation.navigate('ChatRooms');
    } catch (error: any) {
      // Cast error to any
      console.log('Google Sign-In error:', error.message);
      // Handle the error gracefully and display a user-friendly message
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('Error', 'User cancelled the login process');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        Alert.alert('Error', 'Another login process is already in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Play services are not available');
      } else {
        Alert.alert('Error', 'Something went wrong');
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleFacebookLogin}>
        <Text style={styles.buttonText}>Login with Facebook</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
        <Text style={styles.buttonText}>Login with Google</Text>
      </TouchableOpacity>
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
  button: {
    width: '80%',
    height: 50,
    backgroundColor: '#3b5998',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SocialLogin;
