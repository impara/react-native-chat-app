import {
  ref,
  get,
  set,
  push,
  Query,
  onChildAdded,
  off,
  query,
  orderByChild,
  limitToLast,
  update,
} from '@firebase/database';
import NotificationService from '../services/NotificationService';
import firebaseInstance from './Firebase';
import {Alert} from 'react-native';

type ChatRoom = {
  id: string;
  name: string;
  description: string;
  latestMessage?: Message;
  latestMessageTimestamp?: number;
};

type Message = {
  id: string;
  senderName: string;
  text: string;
  date: string;
  senderPhotoURL?: string;
  imageMessageURL?: string;
};

export const fetchChatRooms = async (): Promise<ChatRoom[]> => {
  try {
    const chatRoomsRef = ref(firebaseInstance.database, 'chatRooms');
    const snapshot = await get(chatRoomsRef);
    const chatRooms: ChatRoom[] = [];

    snapshot.forEach(childSnapshot => {
      const chatRoom = childSnapshot.val();
      chatRooms.push({
        id: childSnapshot.key,
        name: chatRoom.name,
        description: chatRoom.description,
        latestMessageTimestamp: chatRoom.latestMessageTimestamp,
      });
    });

    // Sort the rooms by the timestamp of the latest message
    chatRooms.sort((a, b) => {
      const aTimestamp = a.latestMessageTimestamp || 0;
      const bTimestamp = b.latestMessageTimestamp || 0;
      return bTimestamp - aTimestamp;
    });

    return chatRooms;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchMessages = async (
  roomId: string,
  limit: number = 50,
): Promise<Message[]> => {
  try {
    const messagesRef = ref(
      firebaseInstance.database,
      `chatRooms/${roomId}/messages`,
    );
    const messagesQuery = query(
      messagesRef,
      orderByChild('date'),
      limitToLast(limit),
    );
    const snapshot = await get(messagesQuery);
    const messages: Message[] = [];

    snapshot.forEach(childSnapshot => {
      const message = childSnapshot.val();
      messages.push({
        id: childSnapshot.key,
        senderName: message.senderName,
        text: message.text,
        date: message.date,
        senderPhotoURL: message.senderPhotoURL,
        imageMessageURL: message.imageMessageURL,
      });
    });

    return messages;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

type Unsubscribe = () => void;

export const setupMessageListener = (
  roomId: string,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>,
): Unsubscribe => {
  const messagesRef = ref(
    firebaseInstance.database,
    `chatRooms/${roomId}/messages`,
  ) as Query;

  // Listen for new messages
  const handleNewMessage = (snapshot: any) => {
    const message = snapshot.val();
    setMessages((prevMessages: Message[]) => {
      if (!prevMessages.find(msg => msg.id === snapshot.key)) {
        // If the message doesn't exist, append it to the state
        // And send a push notification
        NotificationService.sendPushNotification(
          message.text,
          roomId,
          snapshot.key,
        );

        return [
          ...prevMessages,
          {
            id: snapshot.key,
            senderName: message.senderName,
            text: message.text,
            date: message.date,
            senderPhotoURL: message.senderPhotoURL,
            imageMessageURL: message.imageMessageURL,
          },
        ];
      } else {
        // If the message already exists, return the previous state
        return prevMessages;
      }
    });
  };

  onChildAdded(messagesRef, handleNewMessage);

  // Return a function to clean up the listener
  return () => {
    off(messagesRef, 'child_added', handleNewMessage);
  };
};

export const sendMessage = async (
  roomId: string,
  message: string,
  photoURL: string,
  imageMessageURL: string = '',
): Promise<void> => {
  try {
    const hasPermission =
      await NotificationService.askForNotificationPermission();
    if (!hasPermission) {
      Alert.alert('Please enable notifications to send a message');
      return;
    }

    const currentUser = firebaseInstance.auth.currentUser;
    if (!currentUser || !currentUser.displayName) {
      throw new Error(
        'User must be logged in and have a display name to send a message',
      );
    }

    const messagesRef = ref(
      firebaseInstance.database,
      `chatRooms/${roomId}/messages`,
    );
    const newMessageRef = push(messagesRef);
    const timestamp = Date.now();

    await set(newMessageRef, {
      senderName: currentUser.displayName,
      text: message,
      date: timestamp,
      senderPhotoURL: photoURL,
      imageMessageURL: imageMessageURL,
    });

    // Update the timestamp of the latest message in the chat room
    const chatRoomRef = ref(firebaseInstance.database, `chatRooms/${roomId}`);
    await update(chatRoomRef, {
      latestMessageTimestamp: timestamp,
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
