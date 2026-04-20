import { type ReactNode } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { type ImageSource } from 'expo-image';

import { type Session } from '@supabase/auth-helpers-react';
import ImageViewer from '@/comp-lib/core/image-viewer/ImageViewer';
import { CustomButton } from '@/comp-lib/core/custom-button/CustomButton';

import type { PhotoPickerStyles } from './PhotoPickerStyles';
import { usePhotoPickerStyles } from './PhotoPickerStyles';

export interface PhotoPickerProps {
  session?: Session;
  disabled: boolean;
  placeholderImageSource: ImageSource;
  imageUrl?: string;
  onPickFromCamera: () => void;
  onPickFromGallery: () => void;
  galleryText: string;
  cameraText: string;
  loading?: boolean;
  customStyles?: PhotoPickerStyles;
}

export default function PhotoPicker(props: PhotoPickerProps): ReactNode {
  const photoPickerStyles = usePhotoPickerStyles();
  const styles = props.customStyles ?? photoPickerStyles;

  return (
    <View style={styles.container}>
      {/* Anti-pattern: the ImageViewer should not depend on supabase libraries for session. Resolving the image URL should be handled in the container level. */}
      <TouchableOpacity
        disabled={props.disabled || props.loading}
        onPress={props.onPickFromGallery}
        style={styles.pressableContainer}
      >
        <View style={styles.imageContainer}>
          <ImageViewer
            placeholderImageSource={props.placeholderImageSource}
            imageUrl={props.imageUrl}
            session={props.session}
            imageStyles={styles.image}
            placeholderImageStyles={styles.placeholderImage}
          />
          {props.loading && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color={styles.loaderColor} />
            </View>
          )}
        </View>
      </TouchableOpacity>
      <View style={styles.buttonContainer}>
        {props.onPickFromGallery && (
          <CustomButton
            onPress={props.onPickFromGallery}
            title={props.galleryText}
            styles={styles.galleryButtonStyles}
            disabled={props.disabled}
          />
        )}

        {props.onPickFromCamera && (
          <CustomButton
            onPress={props.onPickFromCamera}
            title={props.cameraText}
            styles={styles.cameraButtonStyles}
            disabled={props.disabled}
          />
        )}
      </View>
    </View>
  );
}
