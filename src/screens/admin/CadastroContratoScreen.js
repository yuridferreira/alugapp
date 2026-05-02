import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  TextInput,
  Text,
  Alert,
  Platform,
  View,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  FileText,
  User,
  House,
  CalendarDays,
  BadgeDollarSign,
  Mail,
  Building2,
} from 'lucide-react-native';
import db from '../../services/localdb/db';
import PageContainer from '../../components/layout/PageContainer';
import PrimaryButton from '../../components/buttons/PrimaryButton';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import * as Notifications from 'expo-notifications';
import { loadAppSettings } from '../../utils/appSettings';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
    }),
  });
}

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

export default function CadastroContratoScreen({ navigation }) {
  const [inquilinos, setInquilinos] = useState([]);
  const [imoveis, setImoveis] = useState([]);
  const [selectedInquilino, setSelectedInquilino] = useState('');
  const [selectedImovel, setSelectedImovel] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [valor, setValor] = useState('');
  const [emailInquilino, setEmailInquilino] = useState('');
  const [settings, setSettings] = useState({ notificationsEnabled: true });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function carregarDados() {
      await db.init();
      const inquilinosRaw = await db.getTodosInquilinos();
      const imoveisRaw = await db.getTodosImoveis();
      const loadedSettings = await loadAppSettings();

      setInquilinos(
        (inquilinosRaw || []).map((i) => ({
          id: i.id || '',
          nome: i.nome || i.name || '',
          cpf: i.cpf || String(i.id || ''),
          email: (i.email || '').toLowerCase(),
        }))
      );

      setImoveis(
        (imoveisRaw || []).map((i) => ({
          id: i.id,
          endereco: i.endereco || i.address || '',
          tipo: i.tipo || '',
        }))
      );

      setSettings({
        notificationsEnabled: loadedSettings.notificationsEnabled,
      });
    }

    carregarDados();
  }, []);

  useEffect(() => {
    if (!selectedInquilino) return;

    const inquilinoSelecionado = inquilinos.find(
      (i) =>
        String(i.cpf) === String(selectedInquilino) ||
        String(i.id) === String(selectedInquilino)
    );

    if (inquilinoSelecionado?.email) {
      setEmailInquilino(inquilinoSelecionado.email);
    }
  }, [selectedInquilino, inquilinos]);

  const tipos = useMemo(
    () => [...new Set(imoveis.map((i) => i.tipo).filter(Boolean))],
    [imoveis]
  );

  const imoveisFiltrados = useMemo(
    () => (selectedTipo ? imoveis.filter((i) => i.tipo === selectedTipo) : []),
    [imoveis, selectedTipo]
  );

  const formatarData = (value) => {
    const numeros = value.replace(/\D/g, '').slice(0, 8);
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 4) return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
    return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
  };

  const converterDataParaBanco = (data) => {
    const [dia, mes, ano] = data.split('/');
    return `${ano}-${mes}-${dia}`;
  };

  const agendarNotificacao = async (contrato) => {
    if (!settings.notificationsEnabled) return;
    if (Platform.OS === 'web') return;
    if (!contrato.fim) return;

    const [dia, mes, ano] = contrato.fim.split('/');
    const vencimento = new Date(`${ano}-${mes}-${dia}`);
    const notificationDate = new Date(vencimento);
    notificationDate.setDate(notificationDate.getDate() - 3);

    if (notificationDate <= new Date()) {
      return;
    }

    let imovel = null;
    try {
      imovel = await db.getImovelById(contrato.imovel);
    } catch (e) {
      console.warn('Erro ao buscar imóvel para notificação:', e);
      imovel = imoveis.find((i) => String(i.id) === String(contrato.imovel));
    }

    const endereco = imovel?.endereco || contrato.imovel;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📅 Aluguel próximo do vencimento!',
        body: `O aluguel do imóvel em ${endereco} vence em breve.`,
        sound: true,
      },
      trigger: notificationDate,
    });
  };

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
    if (
      !selectedInquilino ||
      !selectedImovel ||
      !inicio ||
      !fim ||
      !valor ||
      !emailInquilino.trim()
    ) {
      showAlert('Preencha todos os campos, incluindo o email do inquilino.');
      return;
    }

    const inquilinoSelecionado = inquilinos.find(
      (inquilino) =>
        String(inquilino.cpf) === String(selectedInquilino) ||
        String(inquilino.id) === String(selectedInquilino)
    );

    const normalizedEmail = emailInquilino.trim().toLowerCase();

    if (inquilinoSelecionado?.email && inquilinoSelecionado.email !== normalizedEmail) {
      showAlert('O email informado deve ser o mesmo email cadastrado para o inquilino selecionado.');
      return;
    }

    const valorNumerico = Number(String(valor).replace(',', '.'));
    if (Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      showAlert('Informe um valor de aluguel válido.');
      return;
    }

    const dataInicioFormatada = converterDataParaBanco(inicio);
    const dataFimFormatada = converterDataParaBanco(fim);

    const contrato = {
      inquilino: selectedInquilino,
      imovel: selectedImovel,
      valor: valorNumerico,
      dataInicio: dataInicioFormatada,
      dataTermino: dataFimFormatada,
      status: 'ativo',
      property_id: selectedImovel,
      tenant_id: selectedInquilino,
      tenantEmail: normalizedEmail,
      start_date: dataInicioFormatada,
      end_date: dataFimFormatada,
      rent_value: valorNumerico,
    };

    try {
      setLoading(true);

      const resultado = await db.criarContratoComPagamentosAutomaticos(
        contrato,
        normalizedEmail
      );

      let saved = null;
      try {
        saved = await db.getContratoById(resultado.contrato.id);
      } catch (e) {
        saved = { ...contrato, id: resultado.contrato.id };
      }

      try {
        await agendarNotificacao({ ...saved, fim });
      } catch (notificationError) {
        console.warn(
          'Contrato salvo, mas não foi possível agendar a notificação:',
          notificationError
        );
      }

      showAlert(
        'Contrato cadastrado com sucesso!',
        `Contrato vinculado ao usuário ${resultado.contrato.email} e ${resultado.pagamentos.length} pagamento(s) foram gerados automaticamente.`
      );

      navigation.navigate('ListaContratos');
    } catch (err) {
      showAlert('Erro ao salvar contrato.', err.message);
      console.error(err);
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
              <Text style={styles.headerSub}>Documentos</Text>
              <Text style={styles.headerTitle}>Cadastro de Contrato</Text>
            </View>
            <View style={styles.headerIconBox}>
              <FileText size={22} color={COLORS.accent} />
            </View>
          </View>

          <View style={styles.banner}>
            <View style={{ flex: 1 }}>
              <Text style={styles.bannerTitle}>Crie contratos com tudo vinculado</Text>
              <Text style={styles.bannerSub}>
                Selecione o inquilino, escolha o imóvel, defina período e valor para gerar pagamentos automaticamente.
              </Text>
            </View>
            <View style={styles.bannerDecor} />
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formLabel}>Dados do contrato</Text>
            <Text style={styles.formTitle}>Preencha as informações principais</Text>
            <Text style={styles.formSub}>
              Este cadastro também vincula o contrato ao usuário e prepara os pagamentos do período.
            </Text>

            <View style={styles.fieldsGroup}>
              <Field
                icon={User}
                iconColor={COLORS.accent}
                bgColor={COLORS.softBlue}
                label="Inquilino"
              >
                <Picker
                  selectedValue={selectedInquilino}
                  onValueChange={setSelectedInquilino}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione..." value="" />
                  {inquilinos.map((i) => (
                    <Picker.Item key={i.cpf} label={i.nome} value={i.cpf} />
                  ))}
                </Picker>
              </Field>

              <Field
                icon={Building2}
                iconColor={COLORS.accentPurple}
                bgColor={COLORS.softPurple}
                label="Número do Apto"
              >
                <Picker
                  selectedValue={selectedTipo}
                  onValueChange={(value) => {
                    setSelectedTipo(value);
                    setSelectedImovel('');
                  }}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione o número do Apto" value="" />
                  {tipos.map((tipo) => (
                    <Picker.Item key={tipo} label={tipo} value={tipo} />
                  ))}
                </Picker>
              </Field>

              {selectedTipo ? (
                <Field
                  icon={House}
                  iconColor={COLORS.accentGreen}
                  bgColor={COLORS.softGreen}
                  label="Imóvel"
                >
                  <Picker
                    selectedValue={selectedImovel}
                    onValueChange={setSelectedImovel}
                    style={styles.picker}
                  >
                    <Picker.Item label="Selecione..." value="" />
                    {imoveisFiltrados.map((i) => (
                      <Picker.Item
                        key={String(i.id)}
                        label={i.endereco}
                        value={i.id}
                      />
                    ))}
                  </Picker>
                </Field>
              ) : null}

              <Field
                icon={CalendarDays}
                iconColor={COLORS.accentYellow}
                bgColor={COLORS.softYellow}
                label="Data de início"
              >
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#9CA3AF"
                  value={inicio}
                  onChangeText={(t) => setInicio(formatarData(t))}
                  keyboardType="numeric"
                />
              </Field>

              <Field
                icon={CalendarDays}
                iconColor={COLORS.accentPurple}
                bgColor={COLORS.softPurple}
                label="Data de fim"
              >
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor="#9CA3AF"
                  value={fim}
                  onChangeText={(t) => setFim(formatarData(t))}
                  keyboardType="numeric"
                />
              </Field>

              <Field
                icon={BadgeDollarSign}
                iconColor={COLORS.accentGreen}
                bgColor={COLORS.softGreen}
                label="Valor do aluguel"
              >
                <TextInput
                  style={styles.input}
                  placeholder="Digite o valor em R$"
                  placeholderTextColor="#9CA3AF"
                  value={valor}
                  onChangeText={setValor}
                  keyboardType="numeric"
                />
              </Field>

              <Field
                icon={Mail}
                iconColor={COLORS.accent}
                bgColor={COLORS.softBlue}
                label="Email do inquilino"
              >
                <TextInput
                  style={styles.input}
                  placeholder="Digite o email"
                  placeholderTextColor="#9CA3AF"
                  value={emailInquilino}
                  onChangeText={setEmailInquilino}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Field>
            </View>
          </View>

          <PrimaryButton
            title={loading ? 'Salvando...' : 'Salvar Contrato'}
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
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: 12,
  },
  picker: {
    color: COLORS.textPrimary,
    width: '100%',
  },

  primaryButton: {
    marginTop: 2,
  },
  secondaryButton: {
    marginTop: 14,
    marginBottom: 8,
  },
});