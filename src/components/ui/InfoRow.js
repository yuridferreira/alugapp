import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export default function InfoRow({ icon: Icon, iconColor, bgColor, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconBox, { backgroundColor: bgColor }]}>
        <Icon size={16} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Não informado'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  infoIconBox: {
    width: 30,
    height: 30,
    borderRadius: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xs,
  },
  infoLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: theme.typography.letterSpacing.wide,
    marginBottom: theme.spacing.xs,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.fontWeight.semibold,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
});