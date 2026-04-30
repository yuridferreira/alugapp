import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
  },
  buttonActive: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
});

export default function PrimaryButton({ title, onPress, disabled, style, textStyle, ...props }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonActive,
        disabled && styles.buttonDisabled,
        style,
      ]}
      {...props}
    >
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </Pressable>
  );
}
