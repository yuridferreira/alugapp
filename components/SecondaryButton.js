import React from 'react';
import { Text, Pressable } from 'react-native';
import { commonStyles } from '../styles/commonStyles';

export default function SecondaryButton({ title, onPress, disabled, style, textStyle, ...props }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
      style={({ pressed }) => [
        commonStyles.buttonSecondary,
        pressed && commonStyles.buttonActive,
        disabled && commonStyles.buttonDisabled,
        style,
      ]}
      {...props}
    >
      <Text style={[commonStyles.buttonTextSecondary, textStyle]}>{title}</Text>
    </Pressable>
  );
}
