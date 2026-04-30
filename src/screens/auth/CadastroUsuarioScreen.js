import React, { useState } from 'react';
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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { UserRound, Mail, Lock, ShieldPlus } from 'lucide-react-native';
import { auth, db } from '../../../firebaseConfig.js';
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

export default function CadastroUsuarioScreen({ navigation }) {
  const [name, setName] = useState('');
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

  const handleCadastro = async () => {
    if (!email || !senha || !name) {
      showAlert('Erro', 'Preencha todos os campos!');
      return;
    }

    try {
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.toLowerCase(),
        senha
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'usuarios', uid), {
        nome: name,
        email: email.toLowerCase(),
        role: 'usuario',
        criadoEm: new Date(),
      });

      showAlert('Sucesso', 'Usuário cadastrado com sucesso');
      setName('');
      setEmail('');
      setSenha('');
      navigation.goBack();
    } catch (error) {
      showAlert('Erro', error.message);
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
              <Text style={styles.headerSub}>Administração</Text>
              <Text style={styles.headerTitle}>Cadastro de Usuário</Text>
            </View>
            <View style={styles.headerIconBox}>
              <ShieldPlus size={22} color={COLORS.accent} />
            </View>
          </View>

          <View style={styles.banner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Crie novos acessos com segurança</Text>
              <Text style={styles.bannerSub}>
                Cadastre usuários para acesso ao aplicativo com nome, email e senha protegida.
              </Text>
            </View>
            <View style={styles.bannerDecor} />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Dados de acesso</Text>
            <Text style={styles.formTitle}>Preencha as informações do usuário</Text>
            <Text style={styles.formSub}>
              O cadastro cria a conta de autenticação e registra o perfil na coleção de usuários.
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
                  value={name}
                  onChangeText={setName}
                />
              </Field>

              <Field
                icon={Mail}
                iconColor={COLORS.accentPurple}
                bgColor={COLORS.softPurple}
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

              <Field
                icon={Lock}
                iconColor={COLORS.accentGreen}
                bgColor={COLORS.softGreen}
                label="Senha"
              >
                <TextInput
                  style={styles.input}
                  placeholder="Digite a senha"
                  placeholderTextColor="#9CA3AF"
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry
                />
              </Field>
            </View>
          </View>

          <PrimaryButton
            title={loading ? 'Cadastrando...' : 'Cadastrar'}
            onPress={handleCadastro}
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