import React from 'react';
import { SwiftUISheet, SwiftUISheetProps } from '@/components/swiftui/SwiftUISheet';

export interface ModalProps extends SwiftUISheetProps {}

export const Modal: React.FC<ModalProps> = (props) => {
  return <SwiftUISheet {...props} />;
};
