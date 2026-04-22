import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell, Shield, Palette, Languages, UserRoundCog, ChevronRight, Settings2 } from 'lucide-react-native';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import SecondaryButton from '../components/SecondaryButton';
import { commonStyles, colors } from '../styles/commonStyles';
import { loadAppSettings } from '../utils/appSettings';

const SECTION_ITEMS = [
  {
    key: 'notifications',
    title: 'Notificações',
    description: 'Alertas gerais e comunicados do aplicativo.',
    icon: Bell,
  },
  {
    key: 'account',
    title: 'Conta',
    description: 'Senha e opções ligadas ao acesso da conta.',
    icon: UserRoundCog,
  },
  {
    key: 'appearance',
    title: 'Aparência',
    description: 'Modo escuro e recursos de acessibilidade.',
    icon: Palette,
  },
  {
    key: 'language',
    title: 'Idioma',
    description: 'Idioma do app e formato regional exibido.',
    icon: Languages,
  },
  {
    key: 'privacy',
    title: 'Dados e Privacidade',
    description: 'Analytics, backup, cache e política de privacidade.',
    icon: Shield,
  },
];

export default function ConfiguracoesScreen({ navigation }) {
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

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', refreshSettings);
    return unsubscribe;
  }, [navigation, refreshSettings]);

  const summaries = {
    notifications: settings.notificationsEnabled ? 'Ativadas' : 'Desativadas',
    account: 'Segurança da conta',
    appearance: [settings.darkMode ? 'Modo escuro' : 'Modo claro', settings.highContrast ? 'alto contraste ligado' : 'alto contraste desligado'].join(' • '),
    language: `${settings.language === 'pt' ? 'Português' : 'Inglês'} • ${settings.currency}`,
    privacy: settings.analyticsEnabled ? 'Analytics ativo' : 'Analytics desativado',
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <PageContainer scrollable contentContainerStyle={styles.contentContainer}>
        <PageHeader
          icon={Settings2}
          title="Configurações"
          subtitle="Escolha uma categoria para ajustar suas preferências sem deixar a tela carregada."
        />

        <View style={styles.heroCard}>
          <Text style={styles.heroEyebrow}>Organização melhor</Text>
          <Text style={styles.heroTitle}>Tudo dividido por categoria</Text>
          <Text style={styles.heroDescription}>
            Toque em uma seção para abrir apenas o que faz sentido naquele contexto e navegar com mais leveza.
          </Text>
        </View>

        <View style={commonStyles.card}>
          <Text style={styles.listTitle}>Seções</Text>
          <Text style={styles.listDescription}>As preferências foram separadas para reduzir ruído e facilitar a navegação.</Text>

          <View style={styles.listCard}>
            {SECTION_ITEMS.map((item, index) => {
              const Icon = item.icon;
              const isLast = index === SECTION_ITEMS.length - 1;

              return (
                <TouchableOpacity
                  key={item.key}
                  style={[styles.sectionRow, !isLast && styles.sectionDivider]}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('ConfiguracaoDetalhe', { section: item.key })}
                >
                  <View style={styles.sectionRowLeft}>
                    <View style={styles.iconBadge}>
                      <Icon size={20} color={colors.primary} />
                    </View>
                    <View style={styles.sectionRowText}>
                      <Text style={styles.sectionTitle}>{item.title}</Text>
                      <Text style={styles.sectionDescription}>{item.description}</Text>
                      <Text style={styles.sectionSummary}>{summaries[item.key]}</Text>
                    </View>
                  </View>
                  <ChevronRight size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <SecondaryButton title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} style={styles.bottomButton} />
      </PageContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 32,
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
  listTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  listDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  listCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    backgroundColor: '#fbfdff',
    overflow: 'hidden',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 16,
  },
  sectionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  sectionRowLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#eef5ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionRowText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  sectionSummary: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  bottomButton: {
    marginTop: 8,
  },
});
