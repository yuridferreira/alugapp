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
import { auth } from '../../../firebaseConfig.js';
import { AuthContext } from '../../context/AuthContext';
import PageContainer from '../../components/layout/PageContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import HeroBanner from '../../components/ui/HeroBanner';
import SummaryCard from '../../components/ui/SummaryCard';
import ActionCard from '../../components/ui/ActionCard';
import StatusBadge from '../../components/ui/StatusBadge';
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
import { theme } from '../../styles/theme';

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

  const adminActions = useMemo(
    () => [
      { name: 'CadastroInquilino', label: 'Inquilino', icon: UserPlus, iconColor: theme.colors.accent, bgColor: theme.colors.softBlue },
      { name: 'ListaInquilinos', label: 'Inquilinos', icon: Users, iconColor: theme.colors.accentPurple, bgColor: theme.colors.softPurple },
      { name: 'CadastroUsuario', label: 'Novo Usuário', icon: CircleUser, iconColor: theme.colors.accentGreen, bgColor: theme.colors.softGreen },
      { name: 'ListaUsuarios', label: 'Usuários', icon: ListChecks, iconColor: theme.colors.accentYellow, bgColor: theme.colors.softYellow },
      { name: 'Contrato', label: 'Novo Contrato', icon: FileText, iconColor: theme.colors.accent, bgColor: theme.colors.softBlue },
      { name: 'ListaContratos', label: 'Contratos', icon: ListChecks, iconColor: theme.colors.accentPurple, bgColor: theme.colors.softPurple },
      { name: 'CadastroImovel', label: 'Imóvel', icon: HousePlus, iconColor: theme.colors.accentGreen, bgColor: theme.colors.softGreen },
      { name: 'ListaImoveis', label: 'Imóveis', icon: House, iconColor: theme.colors.accentYellow, bgColor: theme.colors.softYellow },
      { name: 'Pagamentos', label: 'Pagamentos', icon: CreditCard, iconColor: theme.colors.accentPurple, bgColor: theme.colors.softPurple },
      { name: 'Historico', label: 'Histórico', icon: Clock3, iconColor: theme.colors.accent, bgColor: theme.colors.softBlue },
      { name: 'DashboardIA', label: 'IA', icon: Cpu, iconColor: theme.colors.accentGreen, bgColor: theme.colors.softGreen },
      { name: 'Configuracoes', label: 'Configurações', icon: Settings2, iconColor: theme.colors.accentYellow, bgColor: theme.colors.softYellow },
      { name: 'Ajuda', label: 'Ajuda', icon: CircleQuestionMark, iconColor: theme.colors.accentPurple, bgColor: theme.colors.softPurple },
    ],
    []
  );

  const tenantActions = useMemo(
    () => [
      { name: 'MeuContrato', label: 'Meu Contrato', icon: FileText, iconColor: theme.colors.accent, bgColor: theme.colors.softBlue },
      { name: 'MeusPagamentos', label: 'Meus Pagamentos', icon: CreditCard, iconColor: theme.colors.accentYellow, bgColor: theme.colors.softYellow },
      { name: 'Historico', label: 'Histórico', icon: Clock3, iconColor: theme.colors.accentPurple, bgColor: theme.colors.softPurple },
      { name: 'Configuracoes', label: 'Configurações', icon: Settings2, iconColor: theme.colors.accentGreen, bgColor: theme.colors.softGreen },
      { name: 'Ajuda', label: 'Ajuda', icon: CircleQuestionMark, iconColor: theme.colors.accent, bgColor: theme.colors.softBlue },
    ],
    []
  );

  const actions = role === 'admin' ? adminActions : tenantActions;

  const groupedRows = useMemo(() => {
    const rows = [];
    for (let i = 0; i < actions.length; i += numColumns) {
      rows.push(actions.slice(i, i + numColumns));
    }
    return rows;
  }, [actions, numColumns]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageContainer scrollable>
        <ScreenHeader
          subtitle="Painel inicial"
          title="Menu Principal"
          icon={LayoutGrid}
        />

        <HeroBanner
          title={
            role === 'admin'
              ? 'Gerencie tudo em um só lugar'
              : 'Acompanhe suas informações rapidamente'
          }
          subtitle={
            role === 'admin'
              ? 'Acesse cadastros, contratos, imóveis, pagamentos e inteligência do sistema com poucos toques.'
              : 'Consulte contrato, pagamentos, histórico e configurações em uma interface mais clara e organizada.'
          }
        />

        <SummaryCard
          icon={ShieldCheck}
          iconColor={theme.colors.accent}
          bgColor={theme.colors.softBlue}
          label="Sessão ativa"
          title={user?.email || 'Usuário'}
          subtitle={`Você possui acesso a ${actions.length} seções no momento. Use os atalhos abaixo para navegar rapidamente.`}
        >
          <View style={styles.roleBadgeContainer}>
            <StatusBadge status={role === 'admin' ? 'Administrador' : 'Usuário'} />
          </View>
        </SummaryCard>

        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Sparkles size={16} color={theme.colors.accentPurple} />
            <Text style={styles.sectionTitle}>Acessos rápidos</Text>
          </View>
          <Text style={styles.sectionSubtitle}>{actions.length} opções</Text>
        </View>

        <View style={styles.gridWrapper}>
          {groupedRows.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((item) => (
                <ActionCard
                  key={item.name}
                  icon={item.icon}
                  iconColor={item.iconColor}
                  bgColor={item.bgColor}
                  title={item.label}
                  subtitle="Abrir seção"
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
            <LogOut size={18} color={theme.colors.accentRed} />
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
    backgroundColor: theme.colors.bg,
  },

  roleBadgeContainer: {
    marginTop: theme.spacing.md,
    alignSelf: 'flex-start',
  },

  sectionHeader: {
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.semibold,
  },

  gridWrapper: {
    marginBottom: theme.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },

  logoutButton: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#FFD8D8',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  logoutIconBox: {
    width: 34,
    height: 34,
    borderRadius: theme.spacing.sm,
    backgroundColor: theme.colors.softRed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: theme.colors.accentRed,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.extrabold,
  },

  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
});