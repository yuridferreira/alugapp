import React, { useEffect, useState, useContext, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { FileText, Home, UserRound, BadgeInfo, CalendarDays, Coins, ShieldCheck } from 'lucide-react-native';
import db from '../db/db';
import PageContainer from '../components/PageContainer';
import SecondaryButton from '../components/SecondaryButton';
import { AuthContext } from '../context/AuthContext';
import {
  formatCurrency,
  formatDate,
  getContractLifecycleLabel,
  getPaymentStatusLabel,
  getPaymentStatusTheme,
} from '../utils/contractPresentation';

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
  softYellow: '#FFF7E6',
  softPurple: '#F2ECFF',
  border: '#E8EEFF',
};

function InfoRow({ icon: Icon, bgColor, iconColor, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIconBox, { backgroundColor: bgColor }]}>
        <Icon size={16} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );
}

export default function MeuContratoScreen({ navigation }) {
  const { user, role } = useContext(AuthContext);
  const [contrato, setContrato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const paymentTheme = useMemo(
    () => getPaymentStatusTheme(contrato?.statusFinanceiro),
    [contrato?.statusFinanceiro]
  );

  useEffect(() => {
    const carregarContrato = async () => {
      try {
        await db.init();

        if (role !== 'usuario') {
          setError('Você não tem permissão para acessar esta página.');
          setLoading(false);
          return;
        }

        const resumo = await db.getResumoContratoDoUsuario(user.uid);
        if (!resumo?.contrato) {
          setError('Você não possui um contrato ativo.');
          setLoading(false);
          return;
        }

        const statusFinanceiro = getPaymentStatusLabel(
          resumo.pagamentoAtual?.status,
          resumo.pagamentoAtual?.data
        );

        setContrato({
          id: resumo.contrato.id,
          inquilino: resumo.inquilino.nome,
          inquilinoEmail: resumo.inquilino.email,
          inquilinoCpf: resumo.inquilino.cpf,
          imovel: resumo.imovel.endereco,
          imovelTipo: resumo.imovel.tipo,
          valor: resumo.contrato.valor,
          status: resumo.contrato.status || 'ativo',
          dataInicio: resumo.contrato.dataInicio || '—',
          dataTermino: resumo.contrato.dataTermino || '—',
          statusFinanceiro,
          vencimentoAtual: resumo.pagamentoAtual?.data || '',
        });
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar contrato:', err);
        setError('Erro ao carregar seu contrato. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    carregarContrato();
  }, [user, role]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PageContainer>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerSub}>Área do inquilino</Text>
              <Text style={styles.headerTitle}>Meu Contrato</Text>
            </View>
            <View style={styles.headerIconBox}>
              <FileText size={22} color={COLORS.accent} />
            </View>
          </View>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
        </PageContainer>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PageContainer>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerSub}>Área do inquilino</Text>
              <Text style={styles.headerTitle}>Meu Contrato</Text>
            </View>
            <View style={styles.headerIconBox}>
              <FileText size={22} color={COLORS.accent} />
            </View>
          </View>

          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageContainer scrollable>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Área do inquilino</Text>
            <Text style={styles.headerTitle}>Meu Contrato</Text>
          </View>
          <View style={styles.headerIconBox}>
            <FileText size={22} color={COLORS.accent} />
          </View>
        </View>

        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Seus dados contratuais em um só lugar</Text>
            <Text style={styles.bannerSub}>
              Acompanhe informações do contrato, imóvel alugado, valor e situação financeira atual.
            </Text>
          </View>
          <View style={styles.bannerDecor} />
        </View>

        {contrato && (
          <View style={styles.contractCard}>
            <View style={styles.statusRow}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>
                  Contrato: {getContractLifecycleLabel(contrato.status)}
                </Text>
              </View>
              <View style={[styles.paymentBadge, paymentTheme.badgeStyle]}>
                <Text style={[styles.paymentBadgeText, paymentTheme.textStyle]}>
                  Financeiro: {contrato.statusFinanceiro}
                </Text>
              </View>
            </View>

            <View style={styles.highlightCard}>
              <View style={styles.highlightIconBox}>
                <Coins size={18} color={COLORS.accent} />
              </View>
              <Text style={styles.highlightLabel}>Valor do aluguel</Text>
              <Text style={styles.highlightValue}>{formatCurrency(contrato.valor)}</Text>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Informações do contrato</Text>
              <InfoRow
                icon={BadgeInfo}
                bgColor={COLORS.softBlue}
                iconColor={COLORS.accent}
                label="ID do contrato"
                value={String(contrato.id)}
              />
              <InfoRow
                icon={CalendarDays}
                bgColor={COLORS.softPurple}
                iconColor={COLORS.accentPurple}
                label="Data de início"
                value={contrato.dataInicio}
              />
              <InfoRow
                icon={CalendarDays}
                bgColor={COLORS.softYellow}
                iconColor={COLORS.accentYellow}
                label="Data de término"
                value={contrato.dataTermino}
              />
              <InfoRow
                icon={CalendarDays}
                bgColor={COLORS.softGreen}
                iconColor={COLORS.accentGreen}
                label="Próximo vencimento"
                value={formatDate(contrato.vencimentoAtual)}
              />
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Imóvel alugado</Text>
              <InfoRow
                icon={Home}
                bgColor={COLORS.softBlue}
                iconColor={COLORS.accent}
                label="Endereço"
                value={contrato.imovel}
              />
              <InfoRow
                icon={BadgeInfo}
                bgColor={COLORS.softPurple}
                iconColor={COLORS.accentPurple}
                label="Tipo"
                value={contrato.imovelTipo}
              />
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Seus dados</Text>
              <InfoRow
                icon={UserRound}
                bgColor={COLORS.softGreen}
                iconColor={COLORS.accentGreen}
                label="Nome"
                value={contrato.inquilino}
              />
              <InfoRow
                icon={FileText}
                bgColor={COLORS.softBlue}
                iconColor={COLORS.accent}
                label="Email"
                value={contrato.inquilinoEmail}
              />
              <InfoRow
                icon={BadgeInfo}
                bgColor={COLORS.softPurple}
                iconColor={COLORS.accentPurple}
                label="CPF"
                value={contrato.inquilinoCpf}
              />
            </View>

            <View style={styles.noteBox}>
              <ShieldCheck size={16} color={COLORS.accent} />
              <Text style={styles.noteText}>
                Esta visualização é somente informativa. Para alterações contratuais, entre em contato com o administrador.
              </Text>
            </View>
          </View>
        )}

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
  contractCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  statusBadge: {
    backgroundColor: COLORS.softGreen,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  statusText: {
    color: COLORS.accentGreen,
    fontWeight: '800',
    fontSize: 13,
  },
  paymentBadge: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  paymentBadgeText: {
    fontWeight: '800',
    fontSize: 13,
  },
  highlightCard: {
    backgroundColor: COLORS.softBlue,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    marginBottom: 16,
  },
  highlightIconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  highlightLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.textSecondary,
    fontWeight: '800',
    marginBottom: 6,
  },
  highlightValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  infoIconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
    lineHeight: 20,
  },
  noteBox: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: COLORS.softYellow,
    borderRadius: 16,
    padding: 14,
    marginTop: 4,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: '#856404',
  },
  errorCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFD8D8',
    padding: 18,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 15,
    color: COLORS.accentRed,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  bottomButton: {
    marginTop: 16,
    marginBottom: 8,
  },
});