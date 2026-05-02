import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, Switch, Alert, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updatePassword } from 'firebase/auth';
import { Bell, Shield, Palette, Languages, UserRoundCog, ChevronRight, ArrowLeft } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import PageContainer from '../../components/layout/PageContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import { commonStyles, colors } from '../../styles/commonStyles';
import { loadAppSettings, saveAppSetting } from '../../utils/appSettings';

const SECTION_META = {
  notifications: {
    title: 'Notificações',
    description: 'Controle os lembretes de vencimento e avisos de pagamento.',
    icon: Bell,
    eyebrow: 'Lembretes',
  },
  account: {
    title: 'Conta',
    description: 'Gerencie a segurança e o acesso da sua conta.',
    icon: UserRoundCog,
    eyebrow: 'Acesso',
  },
  appearance: {
    title: 'Aparência',
    description: 'Ajuste recursos visuais e acessibilidade.',
    icon: Palette,
    eyebrow: 'Visual',
  },
  language: {
    title: 'Idioma',
    description: 'Escolha o idioma e o formato regional exibido.',
    icon: Languages,
    eyebrow: 'Região',
  },
  privacy: {
    title: 'Dados e Privacidade',
    description: 'Defina como seus dados são utilizados e mantidos.',
    icon: Shield,
    eyebrow: 'Privacidade',
  },
};

export default function ConfiguracaoDetalheScreen({ navigation, route }) {
  const { user } = useContext(AuthContext);
  const sectionKey = route?.params?.section;
  const section = SECTION_META[sectionKey] || SECTION_META.notifications;
  const SectionIcon = section.icon;

  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    darkMode: false,
    language: 'pt',
    highContrast: false,
    analyticsEnabled: true,
    currency: 'BRL',
  });

  const refreshSettings = useCallback(async () => {
    const loaded = await loadAppSettings();
    setSettings(loaded);
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const updateSetting = async (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    await saveAppSetting(key, value);
  };

  const handleChangePassword = () => {
    Alert.prompt('Alterar Senha', 'Digite a nova senha:', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'OK',
        onPress: async (newPassword) => {
          if (newPassword && user) {
            try {
              await updatePassword(user, newPassword);
              Alert.alert('Sucesso', 'Senha alterada com sucesso!');
            } catch (error) {
              Alert.alert('Erro', `Falha ao alterar senha: ${error.message}`);
            }
          }
        },
      },
    ]);
  };

  const handleBackup = () => {
    Alert.alert('Backup', 'Funcionalidade de backup em desenvolvimento.');
  };

  const handleRestore = () => {
    Alert.alert('Restauração', 'Funcionalidade de restauração em desenvolvimento.');
  };

  const handleClearCache = () => {
    Alert.alert('Limpar Cache', 'Isso removerá dados temporários. Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'OK',
        onPress: async () => {
          try {
            await AsyncStorage.clear();
            Alert.alert('Sucesso', 'Cache limpo!');
            refreshSettings();
          } catch (error) {
            Alert.alert('Erro', 'Falha ao limpar cache.');
          }
        },
      },
    ]);
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://seusite.com/politica-privacidade');
  };

  const renderSwitchRow = ({ label, description, value, onValueChange, isLast }) => (
    <View style={[styles.row, !isLast && styles.rowDivider]}>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description ? <Text style={styles.rowDescription}>{description}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#d1d5db', true: '#bfe8e5' }}
        thumbColor={value ? '#14b8a6' : '#f8fafc'}
      />
    </View>
  );

  const renderActionRow = ({ label, description, onPress, isLast }) => (
    <TouchableOpacity onPress={onPress} style={[styles.row, !isLast && styles.rowDivider]} activeOpacity={0.8}>
      <View style={styles.rowContent}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description ? <Text style={styles.rowDescription}>{description}</Text> : null}
      </View>
      <ChevronRight size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  const renderPickerRow = ({ label, description, selectedValue, onValueChange, items, isLast }) => (
    <View style={[styles.rowBlock, !isLast && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      {description ? <Text style={styles.rowDescription}>{description}</Text> : null}
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={selectedValue} onValueChange={onValueChange} style={styles.picker}>
          {items.map((item) => (
            <Picker.Item key={item.value} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
    </View>
  );

  const sectionContent = useMemo(() => {
    switch (sectionKey) {
      case 'account':
        return (
          <>
            {renderActionRow({
              label: 'Alterar senha',
              description: 'Defina uma nova senha para manter sua conta protegida.',
              onPress: handleChangePassword,
              isLast: true,
            })}
          </>
        );
      case 'appearance':
        return (
          <>
            {renderSwitchRow({
              label: 'Modo escuro',
              description: 'Preparar a interface para um tema mais escuro.',
              value: settings.darkMode,
              onValueChange: (value) => updateSetting('darkMode', value),
            })}
            {renderSwitchRow({
              label: 'Alto contraste',
              description: 'Aumentar a legibilidade com mais contraste visual.',
              value: settings.highContrast,
              onValueChange: (value) => updateSetting('highContrast', value),
              isLast: true,
            })}
          </>
        );
      case 'language':
        return (
          <>
            {renderPickerRow({
              label: 'Idioma do aplicativo',
              description: 'Escolha o idioma principal da interface.',
              selectedValue: settings.language,
              onValueChange: (value) => updateSetting('language', value),
              items: [
                { label: 'Português', value: 'pt' },
                { label: 'Inglês', value: 'en' },
              ],
            })}
            {renderPickerRow({
              label: 'Moeda padrão',
              description: 'Formato usado para valores exibidos no sistema.',
              selectedValue: settings.currency,
              onValueChange: (value) => updateSetting('currency', value),
              items: [
                { label: 'BRL (Real)', value: 'BRL' },
                { label: 'USD (Dólar)', value: 'USD' },
              ],
              isLast: true,
            })}
          </>
        );
      case 'privacy':
        return (
          <>
            {renderSwitchRow({
              label: 'Compartilhar dados para analytics',
              description: 'Ajuda a melhorar o app com dados de uso anônimos.',
              value: settings.analyticsEnabled,
              onValueChange: (value) => updateSetting('analyticsEnabled', value),
            })}
            {renderActionRow({
              label: 'Backup de dados',
              description: 'Exportar dados salvos para recuperação futura.',
              onPress: handleBackup,
            })}
            {renderActionRow({
              label: 'Restauração de dados',
              description: 'Recuperar um backup já salvo anteriormente.',
              onPress: handleRestore,
            })}
            {renderActionRow({
              label: 'Limpar cache',
              description: 'Remover dados temporários para liberar espaço.',
              onPress: handleClearCache,
            })}
            {renderActionRow({
              label: 'Política de privacidade',
              description: 'Visualizar como tratamos suas informações.',
              onPress: handlePrivacyPolicy,
              isLast: true,
            })}
          </>
        );
      case 'notifications':
      default:
        return (
          <>
            {renderSwitchRow({
              label: 'Lembretes de pagamento',
              description: 'Receba avisos antecipados sobre vencimentos de aluguel.',
              value: settings.notificationsEnabled,
              onValueChange: (value) => updateSetting('notificationsEnabled', value),
              isLast: true,
            })}
          </>
        );
    }
  }, [sectionKey, settings]);

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <PageContainer scrollable contentContainerStyle={styles.contentContainer}>
        <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <ArrowLeft size={18} color={colors.textSecondary} />
          <Text style={styles.backLinkText}>Voltar para configurações</Text>
        </TouchableOpacity>

        <ScreenHeader icon={SectionIcon} title={section.title} subtitle={section.description} />

        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>{section.eyebrow}</Text>
          <Text style={styles.heroTitle}>{section.title}</Text>
          <Text style={styles.heroDescription}>{section.description}</Text>
        </View>

        <View style={commonStyles.card}>
          <View style={styles.sectionBody}>{sectionContent}</View>
        </View>
      </PageContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 32,
  },
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  backLinkText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  heroCard: {
    width: '100%',
    backgroundColor: '#eaf3ff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#cfe1fb',
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.primary,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  sectionBody: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fbfdff',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  rowBlock: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  rowDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
  pickerWrapper: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
  },
});
