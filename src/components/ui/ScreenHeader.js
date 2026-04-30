import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

export default function ScreenHeader({ subtitle, title, icon: Icon, style }) {
  return (
    <View style={[styles.header, style]}>
      <View>
        <Text style={styles.headerSub}>{subtitle}</Text>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      {Icon && (
        <View style={styles.headerIconBox}>
          <Icon size={22} color={theme.colors.accent} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
    marginTop: theme.spacing.xs,
  },
  headerSub: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.semibold,
    letterSpacing: theme.typography.letterSpacing.extraWide,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.colossal,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.textPrimary,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  headerIconBox: {
    width: 46,
    height: 46,
    borderRadius: theme.spacing.lg,
    backgroundColor: theme.colors.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
});