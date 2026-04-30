import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export default function FormField({
  icon: Icon,
  iconColor,
  bgColor,
  label,
  children,
  style,
  errorMessage,
  helperText,
  rightElement
}) {
  return (
    <View style={[styles.fieldBlock, style]}>
      {label && <Text style={styles.fieldLabel}>{label}</Text>}
      <View style={styles.fieldWrapper}>
        {Icon && (
          <View style={[styles.fieldIconBox, { backgroundColor: bgColor }]}>
            <Icon size={16} color={iconColor} />
          </View>
        )}
        <View style={{ flex: 1 }}>{children}</View>
        {rightElement && <View style={styles.rightElement}>{rightElement}</View>}
      </View>
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      {helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
}

export function FormInput({
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  secureTextEntry = false,
  multiline = false,
  numberOfLines = 1,
  ...props
}) {
  return (
    <TextInput
      style={[styles.input, multiline && styles.inputMultiline]}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      numberOfLines={numberOfLines}
      textAlignVertical={multiline ? 'top' : 'center'}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  fieldBlock: {
    marginBottom: theme.spacing.md,
  },
  fieldLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  fieldWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    minHeight: 54,
  },
  fieldIconBox: {
    width: 34,
    height: 34,
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textPrimary,
    paddingVertical: theme.spacing.md,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: theme.spacing.md,
  },
  rightElement: {
    marginLeft: theme.spacing.md,
    justifyContent: 'center',
  },
  errorText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.accentRed,
    marginTop: theme.spacing.xs,
  },
  helperText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
});