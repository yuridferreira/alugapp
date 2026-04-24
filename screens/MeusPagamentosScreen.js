import React, { useContext, useEffect, useState, useMemo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {
  CreditCard,
  CalendarDays,
  Home,
  Wallet,
  ShieldCheck,
  ReceiptText,
} from 'lucide-react-native';
import db from '../db/db';
import PageContainer from '../components/PageContainer';
import SecondaryButton from '../components/SecondaryButton';
import { AuthContext } from '../context/AuthContext';
import {
  formatCurrency,
  formatDate,
  getPaymentStatusLabel,
  getPaymentStatusTheme,
} from '../utils/contractPresentation';

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

export default function MeusPagamentosScreen({ navigation }) {
  const { user, role } = useContext(AuthContext);
  const [pagamentoAtual, setPagamentoAtual] = useState(null);
  const [imovel, setImovel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const statusTheme = useMemo(
    () => getPaymentStatusTheme(pagamentoAtual?.status),
    [pagamentoAtual?.status]
  );

  useEffect(() => {
    let unsubscribePagamentos = null;

    const carregarPagamento = async () => {
      try {
        await db.init();

        if (role !== 'usuario') {
          setError('Você não tem permissão para acessar esta página.');
          return;
        }

        const resumo = await db.getResumoContratoDoUsuario(user.uid);
        if (!resumo?.contrato) {
          setError('Você não possui contrato ativo.');
          return;
        }

        setImovel(resumo.imovel.endereco || 'Não informado');

        unsubscribePagamentos = db.subscribePagamentoAtualByContratoId(
          resumo.contrato.id,
          (pagamentoAtualDb) => {
            if (!pagamentoAtualDb && !resumo.pagamentoAtual) {
              setPagamentoAtual(null);
              setError('Nenhuma fatura encontrada para este contrato.');
              return;
            }

            const pagamentoBase = pagamentoAtualDb || resumo.pagamentoAtual;
            const vencimento = pagamentoBase.date || pagamentoBase.data || '';
            const valor = Number(
              pagamentoBase.amount || pagamentoBase.valor || resumo.contrato.valor || 0
            );
            const status = getPaymentStatusLabel(pagamentoBase.status, vencimento);

            setPagamentoAtual({
              valor,
              vencimento,
              status,
            });
            setError(null);
          }
        );
      } catch (err) {
        console.error('Erro ao carregar meus pagamentos:', err);
        setError('Erro ao carregar sua fatura.');
      } finally {
        setLoading(false);
      }
    };

    carregarPagamento();

    return () => {
      if (unsubscribePagamentos) unsubscribePagamentos();
    };
  }, [role, user]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <PageContainer>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerSub}>Área do inquilino</Text>
              <Text style={styles.headerTitle}>Meus Pagamentos</Text>
            </View>
            <View style={styles.headerIconBox}>
              <CreditCard size={22} color={COLORS.accent} />
            </View>
          </View>

          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
          </View>
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
            <Text style={styles.headerTitle}>Meus Pagamentos</Text>
          </View>
          <View style={styles.headerIconBox}>
            <CreditCard size={22} color={COLORS.accent} />
          </View>
        </View>

        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Acompanhe sua cobrança atual</Text>
            <Text style={styles.bannerSub}>
              Veja o imóvel vinculado, vencimento, status e valor atualizado da sua fatura.
            </Text>
          </View>
          <View style={styles.bannerDecor} />
        </View>

        <View style={styles.summaryCard}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <>
              <View style={styles.statusRow}>
                <View style={[styles.statusBadge, statusTheme.badgeStyle]}>
                  <Text style={[styles.statusText, statusTheme.textStyle]}>
                    {pagamentoAtual?.status}
                  </Text>
                </View>
              </View>

              <View style={styles.highlightCard}>
                <View style={styles.highlightIconBox}>
                  <Wallet size={18} color={COLORS.accent} />
                </View>
                <Text style={styles.highlightLabel}>Valor atual</Text>
                <Text style={styles.highlightValue}>
                  {formatCurrency(pagamentoAtual?.valor)}
                </Text>
              </View>

              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Detalhes do pagamento</Text>

                <InfoRow
                  icon={Home}
                  bgColor={COLORS.softBlue}
                  iconColor={COLORS.accent}
                  label="Imóvel"
                  value={imovel}
                />

                <InfoRow
                  icon={CalendarDays}
                  bgColor={COLORS.softYellow}
                  iconColor={COLORS.accentYellow}
                  label="Data do vencimento"
                  value={formatDate(pagamentoAtual?.vencimento)}
                />

                <InfoRow
                  icon={ReceiptText}
                  bgColor={COLORS.softPurple}
                  iconColor={COLORS.accentPurple}
                  label="Status da cobrança"
                  value={pagamentoAtual?.status}
                />
              </View>

              <View style={styles.noteBox}>
                <ShieldCheck size={16} color={COLORS.accent} />
                <Text style={styles.noteText}>
                  Os dados exibidos aqui correspondem à sua cobrança atual. Em caso de dúvida,
                  entre em contato com a administração.
                </Text>
              </View>
            </>
          )}
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
    marginBottom: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
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
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
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

  errorBox: {
    backgroundColor: COLORS.softRed,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD8D8',
  },
  errorText: {
    color: COLORS.accentRed,
    fontSize: 15,
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
    marginTop: 12,
    marginBottom: 8,
  },
});