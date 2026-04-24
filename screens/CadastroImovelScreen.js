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
import { Building2, MapPin, Layers3, Home, Landmark } from 'lucide-react-native';
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
  softPurple: '#F2ECFF',
  softYellow: '#FFF7E6',
  softGreen: '#EAFBF1',
  border: '#E8EEFF',
};

function Field({ icon: Icon, iconColor, bgColor, label, placeholder, value, onChangeText }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <View style={[styles.inputIconBox, { backgroundColor: bgColor }]}>
          <Icon size={16} color={iconColor} />
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
        />
      </View>
    </View>
  );
}

export default function CadastroImovelScreen({ route, navigation }) {
  const [id, setId] = useState('');
  const [endereco, setEndereco] = useState('');
  const [tipo, setTipo] = useState('');
  const [andar, setAndar] = useState('');
  const [completo, setCompleto] = useState('');
  const [torre, setTorre] = useState('');
  const [editando, setEditando] = useState(false);

  useEffect(() => {
    if (route.params?.editar) {
      const imovel = route.params.editar;
      setId(imovel.id);
      setEndereco(imovel.endereco || '');
      setTipo(imovel.tipo || '');
      setAndar(imovel.andar || '');
      setCompleto(imovel.completo || '');
      setTorre(imovel.torre || '');
      setEditando(true);
    }
  }, [route.params]);

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
    const imovel = {
      ...(editando ? { id } : {}),
      endereco,
      tipo,
      andar,
      completo,
      torre,
    };

    try {
      await db.saveImovel(imovel);
      showAlert(
        editando ? 'Imóvel atualizado!' : 'Imóvel cadastrado com sucesso!'
      );
      navigation.navigate('ListaImoveis');
    } catch (error) {
      console.error('Erro ao salvar imóvel:', error);
      showAlert('Erro', 'Não foi possível salvar o imóvel.');
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
              <Text style={styles.headerSub}>Patrimônio</Text>
              <Text style={styles.headerTitle}>
                {editando ? 'Editar Imóvel' : 'Cadastro de Imóvel'}
              </Text>
            </View>
            <View style={styles.headerIconBox}>
              <Building2 size={22} color={COLORS.accent} />
            </View>
          </View>

          <View style={styles.banner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>
                {editando ? 'Atualize os dados do imóvel' : 'Cadastre um novo imóvel'}
              </Text>
              <Text style={styles.bannerSub}>
                Preencha as informações principais para manter sua base de imóveis sempre organizada.
              </Text>
            </View>
            <View style={styles.bannerDecor} />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Dados do imóvel</Text>
            <Text style={styles.formTitle}>
              {editando ? 'Revise e altere os campos necessários' : 'Informe os dados para cadastro'}
            </Text>
            <Text style={styles.formSub}>
              Os campos abaixo ajudam a identificar corretamente unidade, localização e detalhes complementares.
            </Text>

            <View style={styles.fieldsGroup}>
              <Field
                icon={MapPin}
                iconColor={COLORS.accent}
                bgColor={COLORS.softBlue}
                label="Endereço"
                placeholder="Digite o endereço"
                value={endereco}
                onChangeText={setEndereco}
              />

              <Field
                icon={Layers3}
                iconColor={COLORS.accentYellow}
                bgColor={COLORS.softYellow}
                label="Andar"
                placeholder="Digite o andar"
                value={andar}
                onChangeText={setAndar}
              />

              <Field
                icon={Home}
                iconColor={COLORS.accentPurple}
                bgColor={COLORS.softPurple}
                label="Número do Apto"
                placeholder="Digite o número do apartamento"
                value={tipo}
                onChangeText={setTipo}
              />

              <Field
                icon={Landmark}
                iconColor={COLORS.accentGreen}
                bgColor={COLORS.softGreen}
                label="Complemento"
                placeholder="Digite o complemento"
                value={completo}
                onChangeText={setCompleto}
              />

              <Field
                icon={Building2}
                iconColor={COLORS.accent}
                bgColor={COLORS.softBlue}
                label="Torre"
                placeholder="Digite a torre"
                value={torre}
                onChangeText={setTorre}
              />
            </View>
          </View>

          <PrimaryButton
            title={editando ? 'Salvar Alterações' : 'Cadastrar'}
            onPress={handleSalvar}
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    minHeight: 54,
  },
  inputIconBox: {
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