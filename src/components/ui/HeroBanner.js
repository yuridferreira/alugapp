import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export default function HeroBanner({ title, subtitle, style }) {
  return (
    <View style={[styles.banner, style]}>
      <View style={{ flex: 1 }}>
        <Text style={styles.bannerTitle}>{title}</Text>
        <Text style={styles.bannerSub}>{subtitle}</Text>
      </View>
      <View style={styles.bannerDecor} />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.spacing.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
  },
  bannerTitle: {
    fontSize: theme.typography.fontSize.huge,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: '#FFFFFF',
    marginBottom: theme.spacing.sm,
  },
  bannerSub: {
    fontSize: theme.typography.fontSize.md,
    color: 'rgba(255,255,255,0.68)',
    lineHeight: theme.typography.lineHeight.normal,
  },
  bannerDecor: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.accent + '20',
    right: -24,
    top: -20,
  },
});