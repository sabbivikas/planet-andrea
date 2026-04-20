import React, { type ReactNode } from 'react';

import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { CustomTextInput } from '@/comp-lib/core/custom-text-input/CustomTextInput';
import { useStyleContext } from '@/comp-lib/styles/StyleContext';
import { ChevronDown } from 'lucide-react-native';

import { type DateType, useDatePickerControl } from './DatePickerControlFunc';
import type { FormControlProps } from '../../FormControl';

export function DatePickerControl(props: FormControlProps): ReactNode {
  const {
    valueDate,
    displayValue,
    isDatePickerVisible,
    maximumDate,
    minimumDate,
    locale,
    toggleDatePicker,
    handleConfirm,
    handleCancel,
  } = useDatePickerControl(props);
  const { textInputPresets } = useStyleContext();
  const textInputStyles = props.styles?.customTextInputStyles ?? textInputPresets.DefaultInput;

  return (
    <>
      <CustomTextInput
        pressableOnly
        showFocusedStyle={isDatePickerVisible}
        value={displayValue}
        placeholder={props.placeholder}
        onPress={toggleDatePicker}
        styles={textInputStyles}
        rightIcon={({ size, color }) => <ChevronDown size={size} color={color} />}
        showErrorStyle={!!props.showTextInputErrorStyle}
        cursivePlaceholder={props.cursivePlaceholder}
      />
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode={props.dataType as DateType}
        display="spinner"
        locale={locale}
        date={valueDate}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        {...props.styles?.datePickerControlStyles}
      />
    </>
  );
}
