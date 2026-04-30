import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export default function SummaryCard({ icon: Icon, iconColor, bgColor, label, title, subtitle, children, style }) {
  return (
    <View style={[styles.summaryCard, style]}>
      {(Icon || label || title) && (
        <View style={styles.summaryTop}>
          {Icon && (
            <View style={[styles.summaryIconBox, { backgroundColor: bgColor }]}>
              <Icon size={18} color={iconColor} />
            </View>
          )}
          <View style={{ flex: 1 }}>
            {label && <Text style={styles.summaryLabel}>{label}</Text>}
            {title && <Text style={styles.summaryTitle}>{title}</Text>}
          </View>
        </View>
      )}
      {subtitle && <Text style={styles.summaryText}>{subtitle}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  summaryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.medium,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  summaryIconBox: {
    width: 38,
    height: 38,
    borderRadius: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.extrabold,
    letterSpacing: theme.typography.letterSpacing.extraWide,
    textTransform: 'uppercase',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  summaryTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.textPrimary,
  },
  summaryText: {
    fontSize: theme.typography.fontSize.md,
    lineHeight: theme.typography.lineHeight.normal,
    color: theme.colors.textSecondary,
  },
});