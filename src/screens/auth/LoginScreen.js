import React, { useState, useContext } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ShieldCheck, Mail, Lock, LogIn } from 'lucide-react-native';
import { auth } from '../../../firebaseConfig.js';
import { AuthContext } from '../../context/AuthContext';
import PageContainer from '../../components/layout/PageContainer';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';

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

export default function LoginScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleLogin = async () => {
    if (!email || !senha) {
      showAlert('Erro', 'Preencha o email e a senha.');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), senha);
    } catch (error) {
      showAlert('Erro no login', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToCadastro = () => {
    if (user) {
      showAlert('Aviso', 'Você já está autenticado.');
      return;
    }

    navigation.navigate('CadastroUsuario');
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
              <Text style={styles.headerSub}>Acesso</Text>
              <Text style={styles.headerTitle}>Login</Text>
            </View>
            <View style={styles.headerIconBox}>
              <ShieldCheck size={22} color={COLORS.accent} />
            </View>
          </View>

          <View style={styles.banner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Entre na sua conta</Text>
              <Text style={styles.bannerSub}>
                Faça login para acessar contratos, imóveis, pagamentos e demais funcionalidades do app.
              </Text>
            </View>
            <View style={styles.bannerDecor} />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Autenticação</Text>
            <Text style={styles.formTitle}>Informe seus dados de acesso</Text>
            <Text style={styles.formSub}>
              Use o email cadastrado e sua senha para entrar com segurança no sistema.
            </Text>

            <View style={styles.fieldsGroup}>
              <Field
                icon={Mail}
                iconColor={COLORS.accent}
                bgColor={COLORS.softBlue}
                label="Email"
              >
                <TextInput
                  style={styles.input}
                  placeholder="Digite seu email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </Field>

              <Field
                icon={Lock}
                iconColor={COLORS.accentPurple}
                bgColor={COLORS.softPurple}
                label="Senha"
              >
                <TextInput
                  style={styles.input}
                  placeholder="Digite sua senha"
                  placeholderTextColor="#9CA3AF"
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry
                />
              </Field>
            </View>
          </View>

          <PrimaryButton
            title={loading ? 'Entrando...' : 'Entrar'}
            onPress={handleLogin}
            disabled={loading}
            style={styles.primaryButton}
          />

          {!user && (
            <SecondaryButton
              title="Criar conta"
              onPress={handleGoToCadastro}
              style={styles.secondaryButton}
            />
          )}

          <View style={styles.footerNote}>
            <LogIn size={14} color={COLORS.textSecondary} />
            <Text style={styles.footerNoteText}>
              Acesse sua conta para continuar no aplicativo.
            </Text>
          </View>
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
  },

  footerNote: {
    marginTop: 18,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  footerNoteText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});