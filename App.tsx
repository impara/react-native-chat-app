// App.tsx
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import SplashScreen from './src/screens/SplashScreen';
import SocialLogin from './src/screens/SocialLogin';
import ChatRoomListScreen from './src/screens/ChatRoomListScreen';
import ChatRoomScreen from './src/screens/ChatRoomScreen';
import {AuthProvider} from './src/utils/AuthContext';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {webClientId} from '@env';
import {Easing} from 'react-native-reanimated';

GoogleSignin.configure({
  webClientId: webClientId,
  offlineAccess: true,
});

export type StackNavigatorParams = {
  Loading: undefined;
  Login: undefined;
  ChatRooms: undefined;
  ChatRoom: {roomId: string};
};

const Stack = createStackNavigator<StackNavigatorParams>();

const App: React.FC = () => {
  return (
    // Wrap the entire app with AuthProvider
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Loading"
          screenOptions={{
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            transitionSpec: {
              open: {
                animation: 'timing',
                config: {
                  duration: 500,
                  easing: Easing.inOut(Easing.ease),
                },
              },
              close: {
                animation: 'timing',
                config: {
                  duration: 500,
                  easing: Easing.inOut(Easing.ease),
                },
              },
            },
            cardStyleInterpolator: ({current, next, layouts}) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                    {
                      scale: next
                        ? next.progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 0.9],
                          })
                        : 1,
                    },
                  ],
                },
                overlayStyle: {
                  opacity: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 0.5],
                  }),
                },
              };
            },
          }}>
          {/* Screens */}
          <Stack.Screen name="Loading" component={SplashScreen} />
          <Stack.Screen name="Login" component={SocialLogin} />
          <Stack.Screen name="ChatRooms" component={ChatRoomListScreen} />
          <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
