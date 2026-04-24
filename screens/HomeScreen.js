import React, { useContext, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { AuthContext } from '../context/AuthContext';
import PageContainer from '../components/PageContainer';
import {
  UserPlus,
  Users,
  CircleUser,
  ListChecks,
  FileText,
  House,
  HousePlus,
  CreditCard,
  Clock3,
  Cpu,
  Settings2,
  CircleQuestionMark,
  LogOut,
  ShieldCheck,
  Sparkles,
  LayoutGrid,
} from 'lucide-react-native';

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
  softBlue: '#EAF1FF',
  softGreen: '#EAFBF1',
  softYellow: '#FFF7E6',
  softPurple: '#F2ECFF',
  softRed: '#FEECEC',
  border: '#E8EEFF',
};

const iconColorMap = {
  UserPlus: { color: COLORS.accent, bg: COLORS.softBlue },
  Users: { color: COLORS.accentPurple, bg: COLORS.softPurple },
  CircleUser: { color: COLORS.accentGreen, bg: COLORS.softGreen },
  ListChecks: { color: COLORS.accentYellow, bg: COLORS.softYellow },
  FileText: { color: COLORS.accent, bg: COLORS.softBlue },
  House: { color: COLORS.accentPurple, bg: COLORS.softPurple },
  HousePlus: { color: COLORS.accentGreen, bg: COLORS.softGreen },
  CreditCard: { color: COLORS.accentYellow, bg: COLORS.softYellow },
  Clock3: { color: COLORS.accentPurple, bg: COLORS.softPurple },
  Cpu: { color: COLORS.accent, bg: COLORS.softBlue },
  Settings2: { color: COLORS.accentGreen, bg: COLORS.softGreen },
  CircleQuestionMark: { color: COLORS.accentYellow, bg: COLORS.softYellow },
};

function QuickAccessCard({ item, onPress, compact }) {
  const Icon = item.icon;
  const palette = iconColorMap[Icon.displayName || Icon.name] || {
    color: COLORS.accent,
    bg: COLORS.softBlue,
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickCard,
        compact && styles.quickCardCompact,
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.quickCardIconBox, { backgroundColor: palette.bg }]}>
        <Icon size={20} color={palette.color} />
      </View>
      <Text style={styles.quickCardTitle}>{item.label}</Text>
      <Text style={styles.quickCardSub}>Abrir seção</Text>
    </Pressable>
  );
}

export default function HomeScreen({ navigation }) {
  const { user, role } = useContext(AuthContext);
  const screenWidth = Dimensions.get('window').width;
  const compact = screenWidth < 400;
  const numColumns = compact ? 2 : 3;

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

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      showAlert('Erro', 'Não foi possível sair da conta.');
    }
  }, [navigation]);

  const screensAdmin = useMemo(
    () => [
      { name: 'CadastroInquilino', label: 'Inquilino', icon: UserPlus },
      { name: 'ListaInquilinos', label: 'Inquilinos', icon: Users },
      { name: 'CadastroUsuario', label: 'Novo Usuário', icon: CircleUser },
      { name: 'ListaUsuarios', label: 'Usuários', icon: ListChecks },
      { name: 'Contrato', label: 'Novo Contrato', icon: FileText },
      { name: 'ListaContratos', label: 'Contratos', icon: ListChecks },
      { name: 'CadastroImovel', label: 'Imóvel', icon: HousePlus },
      { name: 'ListaImoveis', label: 'Imóveis', icon: House },
      { name: 'Pagamentos', label: 'Pagamentos', icon: CreditCard },
      { name: 'Historico', label: 'Histórico', icon: Clock3 },
      { name: 'DashboardIA', label: 'IA', icon: Cpu },
      { name: 'Configuracoes', label: 'Configurações', icon: Settings2 },
      { name: 'Ajuda', label: 'Ajuda', icon: CircleQuestionMark },
    ],
    []
  );

  const screensUsuario = useMemo(
    () => [
      { name: 'MeuContrato', label: 'Meu Contrato', icon: FileText },
      { name: 'MeusPagamentos', label: 'Meus Pagamentos', icon: CreditCard },
      { name: 'Historico', label: 'Histórico', icon: Clock3 },
      { name: 'Configuracoes', label: 'Configurações', icon: Settings2 },
      { name: 'Ajuda', label: 'Ajuda', icon: CircleQuestionMark },
    ],
    []
  );

  const screens = role === 'admin' ? screensAdmin : screensUsuario;

  const groupedRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < screens.length; i += numColumns) {
      rows.push(screens.slice(i, i + numColumns));
    }
    return rows;
  }, [screens, numColumns]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageContainer scrollable>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Painel inicial</Text>
            <Text style={styles.headerTitle}>Menu Principal</Text>
          </View>
          <View style={styles.headerIconBox}>
            <LayoutGrid size={22} color={COLORS.accent} />
          </View>
        </View>

        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>
              {role === 'admin' ? 'Gerencie tudo em um só lugar' : 'Acompanhe suas informações rapidamente'}
            </Text>
            <Text style={styles.bannerSub}>
              {role === 'admin'
                ? 'Acesse cadastros, contratos, imóveis, pagamentos e inteligência do sistema com poucos toques.'
                : 'Consulte contrato, pagamentos, histórico e configurações em uma interface mais clara e organizada.'}
            </Text>
          </View>
          <View style={styles.bannerDecor} />
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View style={styles.summaryIconBox}>
              <ShieldCheck size={18} color={COLORS.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryLabel}>Sessão ativa</Text>
              <Text style={styles.summaryTitle}>{user?.email || 'Usuário'}</Text>
            </View>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>
                {role === 'admin' ? 'Administrador' : 'Usuário'}
              </Text>
            </View>
          </View>

          <Text style={styles.summaryText}>
            Você possui acesso a {screens.length} seções no momento. Use os atalhos abaixo para navegar rapidamente.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Sparkles size={16} color={COLORS.accentPurple} />
            <Text style={styles.sectionTitle}>Acessos rápidos</Text>
          </View>
          <Text style={styles.sectionSubtitle}>{screens.length} opções</Text>
        </View>

        <View style={styles.gridWrapper}>
          {groupedRows.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((item) => (
                <QuickAccessCard
                  key={item.name}
                  item={item}
                  compact={compact}
                  onPress={() => navigation.navigate(item.name)}
                />
              ))}
            </View>
          ))}
        </View>

        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.logoutIconBox}>
            <LogOut size={18} color={COLORS.accentRed} />
          </View>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
      </PageContainer>
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

  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },
  roleBadge: {
    backgroundColor: COLORS.softGreen,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.accentGreen,
  },

  sectionHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },

  gridWrapper: {
    marginBottom: 18,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  quickCard: {
    flex: 1,
    minHeight: 126,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'space-between',
  },
  quickCardCompact: {
    minHeight: 118,
    padding: 14,
  },
  quickCardIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  quickCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  quickCardSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
  },

  logoutButton: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFD8D8',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
  logoutIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.softRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: COLORS.accentRed,
    fontSize: 14,
    fontWeight: '800',
  },

  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});