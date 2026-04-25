import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export default function EmptyState({ icon: Icon, title, subtitle, actionButton, style }) {
  return (
    <View style={[styles.emptyCard, style]}>
      {Icon && (
        <View style={styles.emptyIconBox}>
          <Icon size={28} color={theme.colors.accent} />
        </View>
      )}
      {title && <Text style={styles.emptyTitle}>{title}</Text>}
      {subtitle && <Text style={styles.emptyText}>{subtitle}</Text>}
      {actionButton}
    </View>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.xl,
    padding: theme.spacing.xxxl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: theme.spacing.sm,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: theme.spacing.xl,
    backgroundColor: theme.colors.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
});