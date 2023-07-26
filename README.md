![Description of GIF](https://drive.google.com/file/d/1Ly9Q922pvYuQDSdb-rWs1JqS-gCBkYR2/view?usp=sharing)

Specification for React native Chat App using Typescript

Overview:
The React native Chat App is a real-time messaging application built using React Native and Firebase for the database. It allows users to login using their social media accounts, view a list of available chat rooms, send and receive messages within a chat room, receive push notifications for new messages, and upload images to chat rooms.

Features:

- src
- screens
  - SplashScreen.tsx: A component that displays the splash screen and handles the navigation logic based on login status.
  - SocialLogin.tsx: A component that handles the social login functionality using Facebook and Google APIs.
  - ChatRoomListScreen.tsx: Displays the list of available chat rooms and handles the navigation to Chat screen.
  - ChatRoomScreen.tsx: Represent an individual chat room that fetch and display messages for the specific chat room
- services
  - PushNotificationService.tsx: A service that handles push notifications and deep linking.
  - ImageUploadService.tsx: A service that handles image uploading functionality.
- utils
  - Firebase.tsx: Handles Firebase backend connection.
  - Chat.tsx: A component that displays the messages in a chat room and handles sending/receiving messages.
  - AuthContext.tsx: Creates a context for authentication, while exposing the current authenticated user's state.
- App.tsx
- package.json

- Display a clean and visually appealing splash screen while the application loads.
- Fade in the next screen after the loading is complete.
- Redirect the user to the appropriate screen based on their login status:

  - If the user is logged in, navigate to the Chat Rooms screen.
  - If the user is not logged in, navigate to the Login screen.

Social Login:

- Provide two sign-in methods: Facebook and Google.
- Allow users to login using their social media accounts.
- Upon successful login, navigate to the Chat Rooms screen.
- If an error occurs during the login process, display a dialog to the user.

Chat Rooms:

- Display a list of available chat rooms sorted by the newest message.
- Each room should show the name and a short description.
- Include a chevron icon on each row to indicate that it is clickable.
- Implement pull-to-refresh functionality to reload the list of rooms.
- When a user selects a room, navigate to the Send and Receive screen.

Send and Receive Messages:

- Load the last 50 messages when a chat room is opened.
- Implement scroll-to-load-more functionality to fetch older messages.
- Automatically add received messages to the message list.
- Display an input field at the bottom of the screen for composing messages.
- When the user taps on the input field, open the keyboard.
- When the user enters a message and presses "Send" or "Enter", send the message and add it to the message list.
- Each message should include the sender's avatar, name, message date, and message text.

Push Notifications (under development):

- Prompt the user to enable push notifications when they write a message in a room.
- Send a push notification to the user whenever a new message is added to a room they have participated in.
- When the user taps on a push notification, deep link them directly to the corresponding room/message.

Image Upload:

- Allow users to upload images to chat rooms.
- Provide options to upload images from the camera or phone gallery.
- Display the uploaded image in the chat room along with the messages.

Non-Standard Dependencies:

- React Native: A JavaScript framework for building native mobile apps.
- Firebase: A real-time database and backend as a service platform.
- Facebook API: An API for integrating Facebook login functionality.
- Google API: An API for integrating Google login functionality.
