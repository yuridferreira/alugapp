import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export default function ActionCard({ icon: Icon, iconColor, bgColor, title, subtitle, onPress, compact, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickCard,
        compact && styles.quickCardCompact,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={[styles.quickCardIconBox, { backgroundColor: bgColor }]}>
        <Icon size={20} color={iconColor} />
      </View>
      <Text style={styles.quickCardTitle}>{title}</Text>
      <Text style={styles.quickCardSub}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  quickCard: {
    flex: 1,
    minHeight: 126,
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.medium,
    justifyContent: 'space-between',
  },
  quickCardCompact: {
    minHeight: 118,
    padding: theme.spacing.md,
  },
  quickCardIconBox: {
    width: 42,
    height: 42,
    borderRadius: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
  },
  quickCardTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.textPrimary,
    lineHeight: theme.typography.lineHeight.relaxed,
  },
  quickCardSub: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});