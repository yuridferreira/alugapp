import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    color: theme.colors.accent,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.extrabold,
  },
});

export default function SecondaryButton({ title, onPress, disabled, style, textStyle, ...props }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
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
