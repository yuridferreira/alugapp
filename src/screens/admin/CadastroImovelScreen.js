import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  Platform,
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Building2, MapPin, Layers3, Home, Landmark } from 'lucide-react-native';
import db from '../../services/localdb/db';
import PageContainer from '../../components/layout/PageContainer';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import { showSuccess, showError, showLoading, hideToast } from '../../utils/toast';
import { theme } from '../../styles/theme';

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
      showLoading(editando ? 'Salvando alterações...' : 'Cadastrando imóvel...');
      await db.saveImovel(imovel);
      hideToast();
      showSuccess(
        editando ? 'Imóvel atualizado!' : 'Imóvel cadastrado com sucesso!'
      );
      navigation.navigate('ListaImoveis');
    } catch (error) {
      console.error('Erro ao salvar imóvel:', error);
      hideToast();
      showError('Erro', 'Não foi possível salvar o imóvel.');
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
              <Building2 size={22} color={theme.colors.accent} />
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
                iconColor={theme.colors.accent}
                bgColor={theme.colors.softBlue}
                label="Endereço"
                placeholder="Digite o endereço"
                value={endereco}
                onChangeText={setEndereco}
              />

              <Field
                icon={Layers3}
                iconColor={theme.colors.accentYellow}
                bgColor={theme.colors.softYellow}
                label="Andar"
                placeholder="Digite o andar"
                value={andar}
                onChangeText={setAndar}
              />

              <Field
                icon={Home}
                iconColor={theme.colors.accentPurple}
                bgColor={theme.colors.softPurple}
                label="Número do Apto"
                placeholder="Digite o número do apartamento"
                value={tipo}
                onChangeText={setTipo}
              />

              <Field
                icon={Landmark}
                iconColor={theme.colors.accentGreen}
                bgColor={theme.colors.softGreen}
                label="Complemento"
                placeholder="Digite o complemento"
                value={completo}
                onChangeText={setCompleto}
              />

              <Field
                icon={Building2}
                iconColor={theme.colors.accent}
                bgColor={theme.colors.softBlue}
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
    backgroundColor: theme.colors.bg,
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
    color: theme.colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: theme.colors.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },

  banner: {
    backgroundColor: theme.colors.primary,
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
    backgroundColor: theme.colors.accent + '20',
    right: -24,
    top: -20,
  },

  formCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  formTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  formSub: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textSecondary,
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
    color: theme.colors.textPrimary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    color: theme.colors.textPrimary,
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