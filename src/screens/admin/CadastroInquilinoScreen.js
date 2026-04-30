import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Alert,
  Platform,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { UserRound, BadgeInfo, Phone, Mail, Users } from 'lucide-react-native';
import { db } from '../../services/localdb/db';
import PageContainer from '../../components/layout/PageContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import HeroBanner from '../../components/ui/HeroBanner';
import SummaryCard from '../../components/ui/SummaryCard';
import FormField, { FormInput } from '../../components/ui/FormField';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import { theme } from '../../styles/theme';

export default function CadastroInquilinoScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await db.init();
      } catch (e) {
        console.warn(e);
      }
    };
    init();
  }, []);

  const showAlert = (title, message, buttons, options) => {
    if (Platform.OS === 'web') {
      if (!message) {
        window.alert(title);
        return;
      }
      window.alert(`${title}\n\n${message}`);
      return;
    }
    Alert.alert(title, message, buttons, options);
  };

  const handleSalvar = async () => {
    if (!nome || !cpf || !telefone || !email) {
      showAlert('Preencha todos os campos!');
      return;
    }

    const inquilino = {
      name: nome,
      cpf,
      phone: telefone,
      email,
    };

    try {
      setLoading(true);
      await db.saveInquilino(inquilino);

      showAlert('Inquilino cadastrado com sucesso!');
      setNome('');
      setCpf('');
      setTelefone('');
      setEmail('');
    } catch (error) {
      console.error('Erro ao salvar inquilino:', error);
      showAlert('Erro ao salvar o inquilino', error.message || error.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <PageContainer scrollable>
          <ScreenHeader
            subtitle="Cadastros"
            title="Cadastro de Inquilino"
            icon={Users}
          />

          <HeroBanner
            title="Cadastre novos inquilinos com facilidade"
            subtitle="Registre os dados principais do locatário para utilizar em contratos, pagamentos e comunicação."
          />

          <SummaryCard
            label="Dados do inquilino"
            title="Preencha as informações principais"
            subtitle="Esses dados serão usados para identificação, contato e vinculação com contratos no sistema."
          >
            <View style={styles.fieldsGroup}>
              <FormField
                icon={UserRound}
                iconColor={theme.colors.accent}
                bgColor={theme.colors.softBlue}
                label="Nome"
              >
                <FormInput
                  placeholder="Digite o nome"
                  value={nome}
                  onChangeText={setNome}
                />
              </FormField>

              <FormField
                icon={BadgeInfo}
                iconColor={theme.colors.accentPurple}
                bgColor={theme.colors.softPurple}
                label="CPF"
              >
                <FormInput
                  placeholder="Digite o CPF"
                  value={cpf}
                  onChangeText={setCpf}
                  keyboardType="numeric"
                />
              </FormField>

              <FormField
                icon={Phone}
                iconColor={theme.colors.accentGreen}
                bgColor={theme.colors.softGreen}
                label="Telefone"
              >
                <FormInput
                  placeholder="Digite o telefone"
                  value={telefone}
                  onChangeText={setTelefone}
                  keyboardType="phone-pad"
                />
              </FormField>

              <FormField
                icon={Mail}
                iconColor={theme.colors.accentYellow}
                bgColor={theme.colors.softYellow}
                label="Email"
              >
                <FormInput
                  placeholder="Digite o email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </FormField>
            </View>
          </SummaryCard>

          <PrimaryButton
            title={loading ? 'Salvando...' : 'Salvar'}
            onPress={handleSalvar}
            disabled={loading}
          />

          <SecondaryButton
            title="Voltar para o Menu"
            onPress={() => navigation.navigate('Home')}
          />
        </PageContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },

  fieldsGroup: {
    gap: theme.spacing.md,
  },
});