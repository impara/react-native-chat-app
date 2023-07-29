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

// Configure the notification channel
PushNotification.channelExists('channel-id', function (exists) {
  if (!exists) {
    PushNotification.createChannel(
      {
        channelId: 'cahtapp-b4e09-channel-id',
        channelName: 'chatapp channel',
      },
      created => console.log(`createChannel returned '${created}'`),
    );
  }
});

type NotificationScreenNavigationProp = StackNavigationProp<
  NotificationStackParamList,
  'ChatRoom'
>;

interface UserInfo {
  roomId: string;
  messageId: string;
}

class NotificationService {
  private static navigation: NotificationScreenNavigationProp | undefined;
  private userInfo: UserInfo | null = null; // Hold the user info

  static askForNotificationPermission = async (): Promise<boolean> => {
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
        if (!notification.foreground && this.userInfo) {
          // The notification was opened, so call handleNotificationPress
          this.handleNotificationPress();
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

  static sendPushNotification = async (
    message: string,
    roomId: string,
    messageId: string,
  ) => {
    PushNotification.localNotification({
      /* Android Only Properties */
      channelId: 'cahtapp-b4e09-channel-id', // (required) channelId, if the channel doesn't exist, notification will not trigger.
      message: message,
      userInfo: {roomId: roomId, messageId: messageId},
    });
  };

  handleNotificationPress = (): void => {
    if (NotificationService.navigation && this.userInfo) {
      // Navigate to the appropriate room/message
      NotificationService.navigation.navigate('ChatRoom', {
        roomId: this.userInfo.roomId,
        messageId: this.userInfo.messageId,
      });
    }
  };
}

export default NotificationService;
