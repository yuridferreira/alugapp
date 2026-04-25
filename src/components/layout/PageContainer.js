import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { theme } from '../../styles/theme';

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.xxxl,
    backgroundColor: theme.colors.bg,
  },
});

export default function PageContainer({ children, scrollable, style, contentContainerStyle, ...props }) {
  if (scrollable) {
    return (
      <ScrollView
        contentContainerStyle={[styles.pageContainer, contentContainerStyle]}
        style={{ flex: 1, width: '100%' }}
        {...props}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.pageContainer, style]} {...props}>
      {children}
    </View>
  );
}
