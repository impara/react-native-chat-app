import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  FlatList,
  TextInput,
  Button,
  Text,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import {RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StackNavigatorParams} from '../../App';
import {fetchMessages, sendMessage} from '../utils/Chat';
import ImageUploadService from '../services/ImageUploadService';
import {useAuth} from '../utils/AuthContext';
import {setupMessageListener} from '../utils/Chat';

type Message = {
  id: string;
  senderName: string;
  text: string;
  date: string;
  senderPhotoURL?: string;
  imageMessageURL?: string;
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

type ChatRoomScreenNavigationProp = StackNavigationProp<
  StackNavigatorParams,
  'ChatRoom'
>;

type ChatRoomScreenRouteProp = RouteProp<StackNavigatorParams, 'ChatRoom'>;

type Props = {
  navigation: ChatRoomScreenNavigationProp;
  route: ChatRoomScreenRouteProp;
};

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 150,
    borderRadius: 10,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingLeft: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  bottomContainer: {
    marginBottom: 10,
  },
  messageContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: 'white',
  },
  messageHeader: {
    marginBottom: 5,
  },
  messageBody: {
    flexDirection: 'row',
  },
  messageTextContainer: {
    marginLeft: 10,
  },
  messageDate: {
    fontSize: 14,
    color: '#888',
  },
  senderPhotoURL: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

const ChatRoomScreen: React.FC<Props> = ({route}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allMessagesFetched, setAllMessagesFetched] = useState(false);
  const {user} = useAuth();

  const [totalMessagesFetched, setTotalMessagesFetched] = useState(50);

  const fetchChatRoomMessages = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedMessages = await fetchMessages(
        route.params.roomId,
        totalMessagesFetched,
      );
      setMessages(fetchedMessages);
      if (fetchedMessages.length < totalMessagesFetched) {
        setAllMessagesFetched(true);
      }
    } catch (error) {
      console.error('Error fetching chat room messages:', error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [route.params.roomId, totalMessagesFetched]);

  useEffect(() => {
    fetchChatRoomMessages();
  }, [fetchChatRoomMessages]);

  const handleLoadMore = () => {
    if (!allMessagesFetched) {
      setIsLoadingMore(true);
      setTotalMessagesFetched(prevTotal => prevTotal + 50);
    }
  };

  useEffect(() => {
    const unsubscribe = setupMessageListener(route.params.roomId, setMessages);

    // Clean up the listener when the component is unmounted
    return unsubscribe;
  }, [route.params.roomId]);

  const handleSend = useCallback(async () => {
    if (newMessage.trim().length === 0) {
      return;
    }

    try {
      setLoading(true);
      await sendMessage(route.params.roomId, newMessage, user?.photoURL || '');
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  }, [newMessage, route.params.roomId, user?.photoURL]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchChatRoomMessages();
    setRefreshing(false);
  }, [fetchChatRoomMessages]);

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}: {item: Message}) => (
          <View style={styles.messageContainer}>
            <View style={styles.messageHeader}>
              <Text style={styles.messageDate}>{formatDate(item.date)}</Text>
            </View>
            <View style={styles.messageBody}>
              {item.senderPhotoURL ? (
                <Image
                  key={item.id + 'senderPhotoURL'}
                  source={{uri: item.senderPhotoURL}}
                  style={styles.senderPhotoURL}
                />
              ) : null}
              {item.imageMessageURL ? (
                <Image
                  key={item.id + 'imageMessageURL'}
                  source={{uri: item.imageMessageURL}}
                  style={styles.image}
                  onError={error => console.log('Error loading image:', error)}
                />
              ) : null}
              <View style={styles.messageTextContainer}>
                <Text>{item.senderName}</Text>
                <Text>{item.text}</Text>
              </View>
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={isLoadingMore ? <ActivityIndicator /> : null}
      />

      <View style={styles.bottomContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={text => setNewMessage(text)}
        />
        <Button title="Send" onPress={handleSend} disabled={loading} />
        <ImageUploadService roomId={route.params.roomId} />
      </View>
    </View>
  );
};

export default ChatRoomScreen;
