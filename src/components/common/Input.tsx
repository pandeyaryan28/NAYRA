import React from 'react';
import {
  SwiftUITextField,
  SwiftUITextFieldProps,
} from '@/components/swiftui/SwiftUITextField';

export interface InputProps extends SwiftUITextFieldProps {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    return <SwiftUITextField ref={ref} {...props} />;
  }
);

Input.displayName = 'Input';
