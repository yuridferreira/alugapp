import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { CreditCard } from 'lucide-react-native';
import db from '../db/db';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import SecondaryButton from '../components/SecondaryButton';
import { commonStyles, colors } from '../styles/commonStyles';
import { AuthContext } from '../context/AuthContext';
import { formatCurrency, formatDate, getPaymentStatusLabel, getPaymentStatusTheme } from '../utils/contractPresentation';

export default function MeusPagamentosScreen({ navigation }) {
  const { user, role } = useContext(AuthContext);
  const [pagamentoAtual, setPagamentoAtual] = useState(null);
  const [imovel, setImovel] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const statusTheme = getPaymentStatusTheme(pagamentoAtual?.status);

  useEffect(() => {
    let unsubscribePagamentos = null;

    const carregarPagamento = async () => {
      try {
        await db.init();

        if (role !== 'usuario') {
          setError('Voce nao tem permissao para acessar esta pagina.');
          return;
        }

        const resumo = await db.getResumoContratoDoUsuario(user.uid);
        if (!resumo?.contrato) {
          setError('Você não possui contrato ativo.');
          return;
        }

        setImovel(resumo.imovel.endereco || 'Não informado');
        unsubscribePagamentos = db.subscribePagamentoAtualByContratoId(resumo.contrato.id, (pagamentoAtualDb) => {
          if (!pagamentoAtualDb && !resumo.pagamentoAtual) {
            setPagamentoAtual(null);
            setError('Nenhuma fatura encontrada para este contrato.');
            return;
          }

          const pagamentoBase = pagamentoAtualDb || resumo.pagamentoAtual;
          const vencimento = pagamentoBase.date || pagamentoBase.data || '';
          const valor = Number(pagamentoBase.amount || pagamentoBase.valor || resumo.contrato.valor || 0);
          const status = getPaymentStatusLabel(pagamentoBase.status, vencimento);

          setPagamentoAtual({
            valor,
            vencimento,
            status,
          });
          setError(null);
        });
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
      <SafeAreaView style={commonStyles.safeArea}>
        <PageContainer>
          <PageHeader icon={CreditCard} title="Meus Pagamentos" />
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </PageContainer>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <PageContainer>
        <PageHeader icon={CreditCard} title="Meus Pagamentos" />

        <View style={[commonStyles.card, styles.card]}>
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              <Text style={styles.sectionLabel}>Imovel</Text>
              <Text style={styles.sectionValue}>{imovel}</Text>

              <Text style={styles.sectionLabel}>Data do vencimento</Text>
              <Text style={styles.sectionValue}>{formatDate(pagamentoAtual?.vencimento)}</Text>

              <Text style={styles.sectionLabel}>Status</Text>
              <View style={[styles.statusBadge, statusTheme.badgeStyle]}>
                <Text style={[styles.statusText, statusTheme.textStyle]}>
                  {pagamentoAtual?.status}
                </Text>
              </View>

              <Text style={styles.sectionLabel}>Valor do aluguel</Text>
              <Text style={styles.highlightValue}>{formatCurrency(pagamentoAtual?.valor)}</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    gap: 10,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sectionValue: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 6,
  },
  highlightValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
  },
  errorText: {
    color: colors.danger || '#c0392b',
    fontSize: 16,
    textAlign: 'center',
  },
  bottomButton: {
    marginTop: 12,
  },
});
