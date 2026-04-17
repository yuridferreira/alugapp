import React from 'react';
import { View, Text } from 'react-native';
import { commonStyles } from '../styles/commonStyles';

export default function PageHeader({ icon: IconComponent, title, subtitle, style, titleStyle, subtitleStyle, iconProps }) {
  return (
    <View style={[commonStyles.pageHeader, style]}>
      {IconComponent ? <IconComponent {...iconProps} style={commonStyles.pageHeaderIcon} /> : null}
      <Text style={[commonStyles.pageTitle, titleStyle]}>{title}</Text>
      {subtitle ? <Text style={[commonStyles.pageSubtitle, subtitleStyle]}>{subtitle}</Text> : null}
    </View>
  );
}
