import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  Alert,
  Platform,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { UserRound, BadgeInfo, Phone, Mail, Users } from 'lucide-react-native';
import db from '../db/db';
import PageContainer from '../components/PageContainer';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';

const COLORS = {
  primary: '#1A1A2E',
  accent: '#4F8EF7',
  accentGreen: '#22C55E',
  accentYellow: '#F59E0B',
  accentPurple: '#8B5CF6',
  card: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  bg: '#F5F7FF',
  softBlue: '#EAF1FF',
  softGreen: '#EAFBF1',
  softYellow: '#FFF7E6',
  softPurple: '#F2ECFF',
  border: '#E8EEFF',
};

function Field({ icon: Icon, iconColor, bgColor, label, children }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.fieldWrapper}>
        <View style={[styles.fieldIconBox, { backgroundColor: bgColor }]}>
          <Icon size={16} color={iconColor} />
        </View>
        <View style={{ flex: 1 }}>{children}</View>
      </View>
    </View>
  );
}

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
          <View style={styles.header}>
            <View>
              <Text style={styles.headerSub}>Cadastros</Text>
              <Text style={styles.headerTitle}>Cadastro de Inquilino</Text>
            </View>
            <View style={styles.headerIconBox}>
              <Users size={22} color={COLORS.accent} />
            </View>
          </View>

          <View style={styles.banner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Cadastre novos inquilinos com facilidade</Text>
              <Text style={styles.bannerSub}>
                Registre os dados principais do locatário para utilizar em contratos, pagamentos e comunicação.
              </Text>
            </View>
            <View style={styles.bannerDecor} />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Dados do inquilino</Text>
            <Text style={styles.formTitle}>Preencha as informações principais</Text>
            <Text style={styles.formSub}>
              Esses dados serão usados para identificação, contato e vinculação com contratos no sistema.
            </Text>

            <View style={styles.fieldsGroup}>
              <Field
                icon={UserRound}
                iconColor={COLORS.accent}
                bgColor={COLORS.softBlue}
                label="Nome"
              >
                <TextInput
                  style={styles.input}
                  placeholder="Digite o nome"
                  placeholderTextColor="#9CA3AF"
                  value={nome}
                  onChangeText={setNome}
                />
              </Field>

              <Field
                icon={BadgeInfo}
                iconColor={COLORS.accentPurple}
                bgColor={COLORS.softPurple}
                label="CPF"
              >
                <TextInput
                  style={styles.input}
                  placeholder="Digite o CPF"
                  placeholderTextColor="#9CA3AF"
                  value={cpf}
                  onChangeText={setCpf}
                  keyboardType="numeric"
                />
              </Field>

              <Field
                icon={Phone}
                iconColor={COLORS.accentGreen}
                bgColor={COLORS.softGreen}
                label="Telefone"
              >
                <TextInput
                  style={styles.input}
                  placeholder="Digite o telefone"
                  placeholderTextColor="#9CA3AF"
                  value={telefone}
                  onChangeText={setTelefone}
                  keyboardType="phone-pad"
                />
              </Field>

              <Field
                icon={Mail}
                iconColor={COLORS.accentYellow}
                bgColor={COLORS.softYellow}
                label="Email"
              >
                <TextInput
                  style={styles.input}
                  placeholder="Digite o email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Field>
            </View>
          </View>

          <PrimaryButton
            title={loading ? 'Salvando...' : 'Salvar'}
            onPress={handleSalvar}
            disabled={loading}
            style={styles.primaryButton}
          />

          <SecondaryButton
            title="Voltar para o Menu"
            onPress={() => navigation.navigate('Home')}
            style={styles.secondaryButton}
          />
        </PageContainer>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  headerSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  headerIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: COLORS.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },

  banner: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bannerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.68)',
    lineHeight: 19,
  },
  bannerDecor: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.accent + '20',
    right: -24,
    top: -20,
  },

  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  formSub: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
    marginBottom: 18,
  },

  fieldsGroup: {
    gap: 14,
  },
  fieldBlock: {
    marginBottom: 2,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  fieldWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    minHeight: 54,
  },
  fieldIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: 12,
  },

  primaryButton: {
    marginTop: 2,
  },
  secondaryButton: {
    marginTop: 14,
    marginBottom: 8,
  },
});