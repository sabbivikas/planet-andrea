import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import {
  ImagePickerControlStyles,
  useImagePickerControlStyles,
} from './controls/image-picker-control/ImagePickerControlStyles';
import { FormControlStyles, useFormControlStyles } from './FormControlStyles';

export interface FormControlWithImageStyles extends FormControlStyles {
  imagePickerControlStyles?: ImagePickerControlStyles; // for type imagePicker
}

export function useFormControlWithImageStyles(): FormControlWithImageStyles {
  const { overrideStyles } = useStyleContext();
  const formControlStyles = useFormControlStyles();

  const defaultImagePickerControlStyles = useImagePickerControlStyles();
  const imagePickerControlStyles = overrideStyles(defaultImagePickerControlStyles, {});

  return {
    ...formControlStyles,
    imagePickerControlStyles,
  };
}
