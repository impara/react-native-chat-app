import PushNotification, {
  ReceivedNotification,
} from 'react-native-push-notification';
import {Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import {StackNavigationProp} from '@react-navigation/stack';
import PushNotificationIOS from '@react-native-community/push-notification-ios';

type NotificationStackParamList = {
  ChatRoom: {roomId: string; messageId?: string};
};

type NotificationScreenNavigationProp = StackNavigationProp<
  NotificationStackParamList,
  'ChatRoom'
>;

class NotificationService {
  private static navigation: NotificationScreenNavigationProp | undefined;

  static setNavigation = (
    navigation: NotificationScreenNavigationProp | undefined,
  ): void => {
    NotificationService.navigation = navigation;
  };

  configure = () => {
    PushNotification.configure({
      onRegister: function (token) {
        console.log('TOKEN:', token);
      },
      onNotification: (
        notification: Omit<ReceivedNotification, 'userInfo'>,
      ) => {
        console.log('NOTIFICATION:', notification);
        if (!notification.foreground) {
          // The notification was opened, so call handleNotificationPress
          this.handleNotificationPress(notification);
        }
        notification.finish(PushNotificationIOS.FetchResult.NoData);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });
  };

  askForNotificationPermission = async (): Promise<boolean> => {
    const enabled = await messaging().hasPermission();
    if (enabled) {
      return true;
    } else {
      try {
        await messaging().requestPermission();
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    }
  };

  sendPushNotification = (
    message: string,
    roomId: string,
    messageId: string,
  ): void => {
    PushNotification.localNotification({
      message: message,
      data: {roomId: roomId, messageId: messageId},
      userInfo: {roomId: roomId, messageId: messageId},
    });
  };

  handleNotificationPress = (
    notification: Omit<ReceivedNotification, 'userInfo'>,
  ): void => {
    const roomId = notification?.data?.roomId as string | undefined;
    const messageId = notification?.data?.messageId as string | undefined;

    if (NotificationService.navigation && roomId) {
      // Navigate to the appropriate room/message
      NotificationService.navigation.navigate('ChatRoom', {
        roomId: roomId,
        messageId: messageId,
      });
    }
  };
}

export default NotificationService;
