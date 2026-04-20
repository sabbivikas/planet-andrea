import * as ImagePicker from 'expo-image-picker';
import { FormControlProps } from '../../FormControl';
import { alert } from '@/utils/alert';
import { Session, useSession } from '@supabase/auth-helpers-react';

/**
 * Interface representing the useImagePickerControl return value
 */
export interface ImagePickerControlFunc {
  session?: Session;
  onHandlePickImage: () => void;
}

export function useImagePickerControl(props: FormControlProps): ImagePickerControlFunc {
  const session = useSession();

  async function handlePickImageAsync() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        alert('Permission denied', 'Cannot access photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });

      const uri = result.assets?.[0]?.uri;

      if (!result.canceled && uri) {
        props.onValueChange(uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      alert('Image Selection Failed', 'There was a problem selecting your image. Please try again.');
    }
  }

  function onHandlePickImage() {
    handlePickImageAsync().catch((error) => {
      console.error('onHandlePickImage error:', error);
    });
  }

  return {
    session: session ?? undefined,
    onHandlePickImage,
  };
}
