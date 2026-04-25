import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export default function LoadingState({ title = 'Carregando...', subtitle, style }) {
  return (
    <View style={[styles.loadingCard, style]}>
      <ActivityIndicator size="large" color={theme.colors.accent} />
      {title && <Text style={styles.loadingTitle}>{title}</Text>}
      {subtitle && <Text style={styles.loadingText}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.xl,
    padding: theme.spacing.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.sm,
  },
  loadingTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed,
    textAlign: 'center',
  },
});