import React from 'react';
import {
  SwiftUIPicker,
  SwiftUIPickerProps,
  PickerOption,
} from '@/components/swiftui/SwiftUIPicker';

export type SelectOption = PickerOption;
export interface SelectProps extends SwiftUIPickerProps {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (props, ref) => {
    return <SwiftUIPicker ref={ref} {...props} />;
  }
);

Select.displayName = 'Select';
