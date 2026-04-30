import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { theme } from '../../styles/theme';

export default function ErrorState({ title = 'Erro', subtitle, actionButton, style }) {
  return (
    <View style={[styles.errorCard, style]}>
      <View style={styles.errorIconBox}>
        <AlertTriangle size={28} color={theme.colors.accentRed} />
      </View>
      <Text style={styles.errorTitle}>{title}</Text>
      {subtitle && <Text style={styles.errorText}>{subtitle}</Text>}
      {actionButton}
    </View>
  );
}

const styles = StyleSheet.create({
  errorCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.xl,
    padding: theme.spacing.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.accentRed + '20',
    marginTop: theme.spacing.sm,
  },
  errorIconBox: {
    width: 60,
    height: 60,
    borderRadius: theme.spacing.xl,
    backgroundColor: theme.colors.softRed,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  errorTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
});