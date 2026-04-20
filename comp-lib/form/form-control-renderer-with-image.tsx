import { ReactNode } from 'react';

import { FormControlWithImageProps } from './FormControlWithImage';
import { ImagePickerControl } from './controls/image-picker-control/ImagePickerControl';
import { formControlRenderer } from './form-control-renderer';

export function formControlRendererWithImage(props: FormControlWithImageProps): ReactNode {
  if (props.type === 'imagePicker') {
    return <ImagePickerControl {...props} />;
  }

  return formControlRenderer(props);
}
