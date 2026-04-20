import { ReactNode } from 'react';

import { FormControlWithImageStyles } from './FormControlWithImageStyles';
import { formControlRendererWithImage } from './form-control-renderer-with-image';
import { FormControlProps } from './FormControl';

export interface FormControlWithImageProps extends FormControlProps {
  /**
   * FormControlWithImageStyles has an additional styles for ImagePickerControl when that feature enabled in the app
   */
  styles: FormControlWithImageStyles;
}

export function FormControlWithImage(props: FormControlWithImageProps): ReactNode {
  return formControlRendererWithImage(props);
}
