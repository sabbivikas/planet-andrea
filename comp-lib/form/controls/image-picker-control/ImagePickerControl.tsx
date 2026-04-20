import React, { type ReactNode } from 'react';
import { Image, Pressable } from 'react-native';
import { useImagePickerControlStyles } from './ImagePickerControlStyles';
import { FormControlWithImageProps } from '../../FormControlWithImage';
import ImageViewer from '@/comp-lib/core/image-viewer/ImageViewer';
import { useImagePickerControl } from './ImagePickerControlFunc';

const placeholderImage = require('@/assets/images/avatar-placeholder.png');

export function ImagePickerControl(props: FormControlWithImageProps): ReactNode {
  const defaultStyles = useImagePickerControlStyles();
  const styles = props.styles?.imagePickerControlStyles ?? defaultStyles;
  const { session, onHandlePickImage } = useImagePickerControl(props);

  return (
    <Pressable onPress={onHandlePickImage} style={styles.button}>
      {/**There are issues with pngs with expo-image, using react-native Image instead  */}
      {!props.value && <Image source={placeholderImage} style={styles.image} />}
      {props.value && (
        <ImageViewer
          imageUrl={props.value as string | undefined}
          session={session}
          imageStyles={styles.image}
          placeholderImageStyles={styles.image}
          placeholderImageSource={placeholderImage}
        />
      )}
    </Pressable>
  );
}
