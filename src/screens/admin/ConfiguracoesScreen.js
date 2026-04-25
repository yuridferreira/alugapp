import React, { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Bell, Shield, Palette, Languages, UserRoundCog, ChevronRight, Settings2 } from 'lucide-react-native';
import PageContainer from '../../components/layout/PageContainer';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import { commonStyles } from '../../styles/commonStyles';
import { loadAppSettings } from '../../utils/appSettings';

const COLORS = {
  primary: '#1A1A2E',
  accent: '#4F8EF7',
  accentGreen: '#22C55E',
  accentYellow: '#F59E0B',
  accentPurple: '#8B5CF6',
  accentRed: '#EF4444',
  card: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  bg: '#F5F7FF',
  border: '#F0F4FF',
};

const SECTION_ITEMS = [
  {
    key: 'notifications',
    title: 'Notificações',
    description: 'Alertas gerais e comunicados do aplicativo.',
    icon: Bell,
    color: COLORS.accentYellow,
  },
  {
    key: 'account',
    title: 'Conta',
    description: 'Senha e opções ligadas ao acesso da conta.',
    icon: UserRoundCog,
    color: COLORS.accent,
  },
  {
    key: 'appearance',
    title: 'Aparência',
    description: 'Modo escuro e recursos de acessibilidade.',
    icon: Palette,
    color: COLORS.accentPurple,
  },
  {
    key: 'language',
    title: 'Idioma',
    description: 'Idioma do app e formato regional exibido.',
    icon: Languages,
    color: COLORS.accentGreen,
  },
  {
    key: 'privacy',
    title: 'Dados e Privacidade',
    description: 'Analytics, backup, cache e política de privacidade.',
    icon: Shield,
    color: COLORS.accentRed,
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

  useEffect(() => { refreshSettings(); }, [refreshSettings]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', refreshSettings);
    return unsubscribe;
  }, [navigation, refreshSettings]);

  const summaries = {
    notifications: settings.notificationsEnabled ? 'Ativadas' : 'Desativadas',
    account: 'Segurança da conta',
    appearance: [settings.darkMode ? 'Modo escuro' : 'Modo claro', settings.highContrast ? 'Alto contraste' : ''].filter(Boolean).join(' • '),
    language: `${settings.language === 'pt' ? 'Português' : 'Inglês'} • ${settings.currency}`,
    privacy: settings.analyticsEnabled ? 'Analytics ativo' : 'Analytics desativado',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageContainer scrollable>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Preferências</Text>
            <Text style={styles.headerTitle}>Configurações</Text>
          </View>
          <View style={styles.headerIconBox}>
            <Settings2 size={22} color={COLORS.accent} />
          </View>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerContent}>
            <Text style={styles.bannerEyebrow}>Organização melhor</Text>
            <Text style={styles.bannerTitle}>Tudo dividido por categoria</Text>
            <Text style={styles.bannerSub}>
              Toque em uma seção para ajustar suas preferências de forma rápida e objetiva.
            </Text>
          </View>
          <View style={styles.bannerDecor1} />
          <View style={styles.bannerDecor2} />
        </View>

        {/* Lista de seções */}
        <View style={styles.sectionListCard}>
          {SECTION_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isLast = index === SECTION_ITEMS.length - 1;
            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.sectionRow, !isLast && styles.sectionDivider]}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('ConfiguracaoDetalhe', { section: item.key })}
              >
                <View style={[styles.iconBadge, { backgroundColor: item.color + '18' }]}>
                  <Icon size={20} color={item.color} />
                </View>

                <View style={styles.sectionRowText}>
                  <Text style={styles.sectionTitle}>{item.title}</Text>
                  <Text style={styles.sectionDescription}>{item.description}</Text>
                  <View style={styles.summaryPill}>
                    <Text style={[styles.summaryText, { color: item.color }]}>{summaries[item.key]}</Text>
                  </View>
                </View>

                <ChevronRight size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>

        <SecondaryButton
          title="Voltar para o Menu"
          onPress={() => navigation.navigate('Home')}
          style={styles.bottomButton}
        />

      </PageContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  // Header
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

  // Banner
  banner: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    overflow: 'hidden',
  },
  bannerContent: {
    zIndex: 1,
  },
  bannerEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COLORS.accent,
    marginBottom: 6,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  bannerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    lineHeight: 19,
  },
  bannerDecor1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accent + '20',
    right: -16,
    top: -16,
  },
  bannerDecor2: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.accentPurple + '25',
    right: 50,
    bottom: -20,
  },

  // Lista
  sectionListCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 16,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  sectionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionRowText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  sectionDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 17,
    marginBottom: 6,
  },
  summaryPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: COLORS.border,
  },
  summaryText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  bottomButton: {
    marginTop: 4,
    marginBottom: 8,
  },
});