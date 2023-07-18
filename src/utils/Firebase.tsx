import {
  REACT_APP_API_KEY,
  REACT_APP_AUTH_DOMAIN,
  REACT_APP_DATABASE_URL,
  REACT_APP_PROJECT_ID,
  REACT_APP_STORAGE_BUCKET,
  REACT_APP_ID,
} from '@env';
import {initializeApp} from '@firebase/app';
import {getAuth, signOut as authSignOut} from '@firebase/auth';
import {getDatabase, ref, push, get} from '@firebase/database';
import {
  ref as storageRef,
  getStorage,
  uploadBytesResumable,
  getDownloadURL,
} from '@firebase/storage';
import UrlParse from 'url-parse';

const config = {
  apiKey: REACT_APP_API_KEY,
  authDomain: REACT_APP_AUTH_DOMAIN,
  databaseURL: REACT_APP_DATABASE_URL,
  projectId: REACT_APP_PROJECT_ID,
  storageBucket: REACT_APP_STORAGE_BUCKET,
  appId: REACT_APP_ID,
};

class Firebase {
  app;
  auth;
  database;
  storage;

  constructor() {
    console.log('Initializing Firebase...'); // Log before initializing Firebase
    this.app = initializeApp(config);
    this.auth = getAuth(this.app);
    this.database = getDatabase(this.app);
    this.storage = getStorage(this.app);
  }

  // Method to create a new chat room
  createChatRoom = async (name: string, description: string) => {
    const chatRoomsRef = ref(this.database, '/chatRooms');
    await push(chatRoomsRef, {name, description});
  };

  // Method to sign out the current user
  signOut = async (): Promise<void> => {
    await authSignOut(this.auth);
  };

  // Database API - Get all chat rooms
  getChatRooms = async (): Promise<any[]> => {
    const chatRoomsRef = ref(this.database, '/chatRooms');
    const snapshot = await get(chatRoomsRef);
    return snapshot.val();
  };

  // Database API - Get messages for a specific chat room
  getMessages = async (roomId: string): Promise<any[]> => {
    const messagesRef = ref(this.database, `/chatRooms/${roomId}/messages`);
    const snapshot = await get(messagesRef);
    return snapshot.val();
  };

  // Storage API - Upload an image to a chat room
  uploadImage = async (roomId: string, imageUri: string): Promise<string> => {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const fileName = new Date().getTime().toString();

    // Create a reference to the file you want to upload
    const imageRef = storageRef(
      this.storage,
      `rooms/${roomId}/images/${fileName}`,
    );

    // Upload the file
    await uploadBytesResumable(imageRef, blob);

    // Get the download URL of the uploaded image
    const downloadUrl = await getDownloadURL(imageRef);
    console.log('Image uploaded:', downloadUrl);

    return downloadUrl;
  };

  // Other utility methods...

  // Method to handle deep links
  handleDeepLink = (url: string) => {
    // Parse the URL
    const parsedUrl = new UrlParse(url, true);
    const {pathname, query} = parsedUrl;

    // Handle the deep link based on the path and query
    if (pathname === '/chatroom') {
      const roomId = query.roomId;
      // Here you would handle the navigation to the chat room
      // This could involve dispatching an event or calling a method that your navigation system listens to
      console.log(`Navigate to chat room with ID: ${roomId}`);
    }
  };
}

const firebaseInstance = new Firebase();

export default firebaseInstance;
