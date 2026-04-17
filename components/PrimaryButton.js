import React from 'react';
import { Text, Pressable } from 'react-native';
import { commonStyles } from '../styles/commonStyles';

export default function PrimaryButton({ title, onPress, disabled, style, textStyle, ...props }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
      style={({ pressed }) => [
        commonStyles.buttonPrimary,
        pressed && commonStyles.buttonActive,
        disabled && commonStyles.buttonDisabled,
        style,
      ]}
      {...props}
    >
      <Text style={[commonStyles.buttonText, textStyle]}>{title}</Text>
    </Pressable>
  );
}
