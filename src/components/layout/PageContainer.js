import React from 'react';
import { View, ScrollView, StyleSheet, Platform } from 'react-native';
import { theme } from '../../styles/theme';

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    width: '100%',
  },
  pageContainer: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.xxxl,
    backgroundColor: theme.colors.bg,
  },
  fullHeightView: {
    flexGrow: 1,
    ...(Platform.OS === 'web' && { minHeight: '100vh' }),
  },
});

export default function PageContainer({ children, scrollable, style, contentContainerStyle, ...props }) {
  return (
    <ScrollView
      contentContainerStyle={[styles.pageContainer, contentContainerStyle]}
      style={[styles.scrollViewContainer, style]}
      {...props}
    >
      <View style={styles.fullHeightView}>
        {children}
      </View>
    </ScrollView>
  );
}