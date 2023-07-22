import React, {useState} from 'react';
import {Button, View, ActivityIndicator} from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  CameraOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';
import firebaseInstance from '../utils/Firebase';
import {sendMessage} from '../utils/Chat';

const handleResponse = async (
  roomId: string,
  response: ImagePickerResponse,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  if (response.assets && response.assets.length > 0) {
    const imageUri = response.assets[0].uri;
    if (imageUri) {
      setLoading(true);
      const downloadUrl = await firebaseInstance.uploadImage(roomId, imageUri);
      await sendMessage(roomId, 'Here is an image', '', downloadUrl);
      setLoading(false);
    }
  }
};

const ImageUploadService: React.FC<{roomId: string}> = ({roomId}) => {
  const [loading, setLoading] = useState(false);

  const openCamera = (): void => {
    const options: CameraOptions = {mediaType: 'photo'};
    launchCamera(options, response =>
      handleResponse(roomId, response, setLoading),
    );
  };

  const openGallery = (): void => {
    const options: CameraOptions = {mediaType: 'photo'};
    launchImageLibrary(options, response =>
      handleResponse(roomId, response, setLoading),
    );
  };

  return (
    <View>
      <Button title="Open Camera" onPress={openCamera} />
      <Button title="Open Gallery" onPress={openGallery} />
      {loading && (
        <View>
          <ActivityIndicator size="large" />
        </View>
      )}
    </View>
  );
};

export default ImageUploadService;
