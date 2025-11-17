import { TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

export interface BaseFormInputProps {
  label?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
}

export interface FormInputProps<T extends FieldValues = FieldValues>
  extends BaseFormInputProps,
    Omit<TextInputProps, 'style' | 'onChangeText' | 'value'> {
  name: FieldPath<T>;
  control: Control<T>;
}

export interface FormPasswordInputProps<T extends FieldValues = FieldValues>
  extends BaseFormInputProps,
    Omit<
      TextInputProps,
      'style' | 'onChangeText' | 'value' | 'secureTextEntry'
    > {
  name: FieldPath<T>;
  control: Control<T>;
}

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface FormSelectProps<T extends FieldValues = FieldValues>
  extends BaseFormInputProps {
  name: FieldPath<T>;
  control: Control<T>;
  options: SelectOption[];
  placeholder?: string;
}

export interface FormCheckboxProps<T extends FieldValues = FieldValues>
  extends BaseFormInputProps {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  checkboxPosition?: 'left' | 'right';
}

export interface FormRadioProps<T extends FieldValues = FieldValues>
  extends BaseFormInputProps {
  name: FieldPath<T>;
  control: Control<T>;
  options: SelectOption[];
  radioDirection?: 'horizontal' | 'vertical';
}

export interface FormSwitchProps<T extends FieldValues = FieldValues>
  extends BaseFormInputProps {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
}

export interface FormDatePickerProps<T extends FieldValues = FieldValues>
  extends BaseFormInputProps {
  name: FieldPath<T>;
  control: Control<T>;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
}
