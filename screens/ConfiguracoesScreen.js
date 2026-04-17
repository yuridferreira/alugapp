import React from 'react';
import { SafeAreaView } from 'react-native';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import SecondaryButton from '../components/SecondaryButton';
import { commonStyles } from '../styles/commonStyles';

export default function ConfiguracoesScreen({ navigation }) {
  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <PageContainer>
        <PageHeader title="Configurações" />
        <SecondaryButton title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} />
      </PageContainer>
    </SafeAreaView>
  );
}
