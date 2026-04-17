import React from 'react';
import { View, ScrollView } from 'react-native';
import { commonStyles } from '../styles/commonStyles';

export default function PageContainer({ children, scrollable, style, contentContainerStyle, ...props }) {
  if (scrollable) {
    return (
      <ScrollView
        contentContainerStyle={[commonStyles.pageContainer, contentContainerStyle]}
        style={{ flex: 1, width: '100%' }}
        {...props}
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[commonStyles.pageContainer, style]} {...props}>
      {children}
    </View>
  );
}
