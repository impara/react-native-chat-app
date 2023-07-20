import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  Button,
  ActivityIndicator,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  RefreshControl,
  Modal,
} from 'react-native';
import {ListItem} from 'react-native-elements';
import Icon from 'react-native-vector-icons/FontAwesome';
import {StackNavigationProp} from '@react-navigation/stack';
import {StackNavigatorParams} from '../../App';
import {fetchChatRooms} from '../utils/Chat';
import {useAuth} from '../utils/AuthContext';
import database from '@react-native-firebase/database';

type ChatRoom = {
  id: string;
  name: string;
  description: string;
  latestMessage?: Message;
};

type Message = {
  id: string;
  senderName: string;
  text: string;
  date: string;
  senderPhotoURL?: string;
  imageMessageURL?: string;
};

type ChatRoomListScreenNavigationProp = StackNavigationProp<
  StackNavigatorParams,
  'ChatRooms'
>;

type Props = {
  navigation: ChatRoomListScreenNavigationProp;
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

const ChatRoomListScreen: React.FC<Props> = ({navigation}) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {signOut} = useAuth();
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Function to fetch the list of chat rooms
  const fetchChatRoomList = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedChatRooms = await fetchChatRooms();
      setChatRooms(fetchedChatRooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      // Display a user-friendly error message here
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChatRoomList();
  }, [fetchChatRoomList]);

  // Function to handle pull-to-refresh action
  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchChatRoomList();
    } catch (error) {
      console.error('Error refreshing chat rooms:', error);
      // Display a user-friendly error message here
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchChatRoomList]);

  const handlePress = (room: ChatRoom) => {
    navigation.navigate('ChatRoom', {roomId: room.id});
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
      // Display a user-friendly error message here
    }
  };

  const handleCreateRoom = async () => {
    try {
      // Create a new room
      const roomName = newRoomName;
      const roomDescription = newRoomDescription;

      // Get a reference to the 'chatRooms' node in your Firebase database
      const chatRoomsRef = database().ref('/chatRooms');

      // Push a new chat room to the 'chatRooms' node
      await chatRoomsRef.push({
        name: roomName,
        description: roomDescription,
      });

      // Fetch the updated list of chat rooms
      await fetchChatRoomList();

      // Clear the input fields
      setNewRoomName('');
      setNewRoomDescription('');

      // Close the Modal
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error creating chat room:', error);
      // Display a user-friendly error message here
    }
  };

  const styles = StyleSheet.create({
    // Define styles here (if applicable)
    view: {
      flex: 1,
      justifyContent: 'space-between',
    },
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      borderRadius: 5,
      padding: 10,
      marginBottom: 10,
      backgroundColor: 'white',
    },
    modalView: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
    },
    moreIcon: {
      color: '#d6d7da',
    },
  });

  return (
    <ScrollView
      contentContainerStyle={styles.view}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.view}>
        <View>
          {isLoading ? (
            <ActivityIndicator size="large" />
          ) : chatRooms.length > 0 ? (
            chatRooms.map((room, i) => (
              <ListItem key={i} bottomDivider onPress={() => handlePress(room)}>
                <ListItem.Content>
                  <ListItem.Title>{room.name}</ListItem.Title>
                  <ListItem.Subtitle>{room.description}</ListItem.Subtitle>
                  {room.latestMessage && (
                    <View>
                      <Text>{room.latestMessage.text}</Text>
                      <Text>{formatDate(room.latestMessage.date)}</Text>
                    </View>
                  )}
                </ListItem.Content>
                <Icon name="chevron-right" size={15} style={styles.moreIcon} />
              </ListItem>
            ))
          ) : (
            <Text>No chat rooms available</Text>
          )}
        </View>
        <View>
          <Button title="Create Room" onPress={() => setIsModalVisible(true)} />
          <Button title="Logout" onPress={handleLogout} />
        </View>
        <Modal visible={isModalVisible} animationType="slide">
          <View style={styles.modalView}>
            <TextInput
              style={styles.input}
              placeholder="Room Name"
              value={newRoomName}
              onChangeText={setNewRoomName}
            />
            <TextInput
              style={styles.input}
              placeholder="Room Description"
              value={newRoomDescription}
              onChangeText={setNewRoomDescription}
            />
            <Button title="Create Room" onPress={handleCreateRoom} />
            <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

export default ChatRoomListScreen;
