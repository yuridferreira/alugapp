import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, XCircle, Loader } from 'lucide-react-native';
import Toast from 'react-native-toast-message';
import { theme } from '../styles/theme';

const ToastCard = ({ icon: Icon, iconColor, bgColor, text1, text2 }) => (
  <View style={styles.card}>
    <View style={[styles.iconBox, { backgroundColor: bgColor }]}>
      <Icon size={20} color={iconColor} />
    </View>
    <View style={styles.textBox}>
      {text1 ? <Text style={styles.title} numberOfLines={2}>{text1}</Text> : null}
      {text2 ? <Text style={styles.message} numberOfLines={3}>{text2}</Text> : null}
    </View>
  </View>
);

export const toastConfig = {
  success: ({ text1, text2 }) => (
    <ToastCard
      icon={CheckCircle2}
      iconColor={theme.colors.accentGreen}
      bgColor={theme.colors.softGreen}
      text1={text1}
      text2={text2}
    />
  ),
  error: ({ text1, text2 }) => (
    <ToastCard
      icon={XCircle}
      iconColor={theme.colors.accentRed}
      bgColor={theme.colors.softRed}
      text1={text1}
      text2={text2}
    />
  ),
  loading: ({ text1, text2 }) => (
    <ToastCard
      icon={Loader}
      iconColor={theme.colors.accent}
      bgColor={theme.colors.softBlue}
      text1={text1}
      text2={text2}
    />
  ),
};

export function showSuccess(title, message) {
  Toast.show({ type: 'success', text1: title, text2: message, position: 'top' });
}

export function showError(title, message) {
  Toast.show({ type: 'error', text1: title, text2: message, position: 'top', autoHide: true, visibilityTime: 4500 });
}

export function showLoading(title) {
  Toast.show({ type: 'loading', text1: title, position: 'top', autoHide: false });
}

export function hideToast() {
  Toast.hide();
}

const styles = StyleSheet.create({
  card: {
    width: '92%',
    minHeight: 64,
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    ...theme.shadows.medium,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.textPrimary,
  },
  message: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
