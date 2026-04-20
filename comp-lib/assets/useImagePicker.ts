import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

/**
 * Interface for the return value of the useImagePicker hook
 */
export interface ImagePickerFunc {
  /**
   * Function to launch device's image library for photo selection
   * Returns the selected image asset if successful
   */
  pickImageFromLibrary: () => Promise<ImagePicker.ImagePickerAsset | undefined>;

  /**
   * Function to launch device's camera for photo capture
   * Requests camera permissions if not granted
   * Returns the captured image asset if successful
   */
  pickCameraImage: () => Promise<ImagePicker.ImagePickerAsset | undefined>;

  /**
   * Indicates whether the image picker or camera interface is currently open
   */
  isPickerOpen: boolean;

  /**
   * Currently selected or captured image asset
   * Undefined if no image has been selected/captured
   */
  currentImage?: ImagePicker.ImagePickerAsset;
}

export function useImagePicker(): ImagePickerFunc {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<ImagePicker.ImagePickerAsset | undefined>();

  const pickImageFromLibrary = async () => {
    setIsPickerOpen(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });
    setIsPickerOpen(false);

    if (!result.canceled) {
      setCurrentImage(result.assets[0]);
      return result.assets[0];
    }
  };

  const pickCameraImage = async () => {
    // if (!session?.user) throw new Error('No user on the session!');

    setIsPickerOpen(true);
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== ImagePicker.PermissionStatus.GRANTED) {
        alert('Sorry, we need camera permissions to make this work!');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.3,
        base64: true,
      });
      if (!result.canceled) {
        setCurrentImage(result.assets[0]);
        return result.assets[0];
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsPickerOpen(false);
    }
  };
  return {
    pickImageFromLibrary,
    pickCameraImage,
    isPickerOpen,
    currentImage,
  };
}
