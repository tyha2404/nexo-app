# React Native Form Controls

A comprehensive set of reusable form controls for React Native applications built with React Hook Form and Yup validation.

## Components

### 📝 FormInput

Basic text input with validation support.

```tsx
<FormInput
  name="firstName"
  control={control}
  label="First Name"
  placeholder="Enter your first name"
  required
/>
```

**Props:**

- `name`: Field name (required)
- `control`: React Hook Form control (required)
- `label`: Input label
- `placeholder`: Placeholder text
- `required`: Shows required indicator
- `disabled`: Disables the input
- `containerStyle`: Custom container style
- `labelStyle`: Custom label style
- `inputStyle`: Custom input style
- `errorStyle`: Custom error style

### 🔐 FormPasswordInput

Password input with show/hide toggle functionality.

```tsx
<FormPasswordInput
  name="password"
  control={control}
  label="Password"
  placeholder="Enter your password"
  required
/>
```

**Props:** Same as FormInput plus password-specific styling.

### 📋 FormSelect

Dropdown select component with modal picker.

```tsx
<FormSelect
  name="country"
  control={control}
  label="Country"
  options={countryOptions}
  placeholder="Select your country"
  required
/>
```

**Props:**

- `options`: Array of `{ label: string, value: string | number }`
- `placeholder`: Placeholder text when no value is selected
- All FormInput props

### ☑️ FormCheckbox

Checkbox component with customizable position.

```tsx
<FormCheckbox
  name="terms"
  control={control}
  label="I accept the terms and conditions"
  required
/>
```

**Props:**

- `checkboxPosition`: 'left' | 'right' (default: 'left')
- All FormInput props

### 🎯 FormRadio

Radio button group with horizontal/vertical layout.

```tsx
<FormRadio
  name="gender"
  control={control}
  label="Gender"
  options={genderOptions}
  required
/>
```

**Props:**

- `options`: Array of `{ label: string, value: string | number }`
- `radioDirection`: 'horizontal' | 'vertical' (default: 'vertical')
- All FormInput props

### 🔄 FormSwitch

iOS-style toggle switch component.

```tsx
<FormSwitch
  name="notifications"
  control={control}
  label="Enable email notifications"
/>
```

**Props:**

- All FormInput props

### 📅 FormDatePicker

Date picker component with multiple modes.

```tsx
<FormDatePicker
  name="birthDate"
  control={control}
  label="Birth Date"
  mode="date"
  required
/>
```

**Props:**

- `mode`: 'date' | 'time' | 'datetime' (default: 'date')
- `minimumDate`: Minimum selectable date
- `maximumDate`: Maximum selectable date
- All FormInput props

## Usage Example

```tsx
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  FormInput,
  FormPasswordInput,
  FormCheckbox,
} from '@/components/ui/form';

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
  terms: yup.boolean().oneOf([true]).required(),
});

function MyForm() {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <View>
      <FormInput
        name="email"
        control={control}
        label="Email"
        keyboardType="email-address"
        required
      />

      <FormPasswordInput
        name="password"
        control={control}
        label="Password"
        required
      />

      <FormCheckbox
        name="terms"
        control={control}
        label="I accept the terms"
        required
      />

      <Button onPress={handleSubmit(onSubmit)} disabled={!isValid}>
        Submit
      </Button>
    </View>
  );
}
```

## Features

✅ **TypeScript Support**: Full TypeScript support with proper typing  
✅ **React Hook Form Integration**: Seamless integration with React Hook Form  
✅ **Yup Validation**: Built-in validation support with Yup  
✅ **Consistent Styling**: Unified design system across all components  
✅ **Accessibility**: Proper accessibility labels and hints  
✅ **Customizable**: Extensive customization options via props  
✅ **Error Handling**: Automatic error display and styling  
✅ **Responsive**: Works across different screen sizes

## Dependencies

- `react-hook-form`: Form state management
- `@hookform/resolvers`: Validation resolver integration
- `yup`: Schema validation
- `lucide-react-native`: Icon components
- `@react-native-community/datetimepicker`: Date/time picker (optional)

## Installation

The components are already included in your project. If you want to use the date picker, make sure to install:

```bash
npm install @react-native-community/datetimepicker
# or
yarn add @react-native-community/datetimepicker
```

## Demo

Check out the demo screen at `/src/app/form-demo.tsx` to see all form controls in action.
