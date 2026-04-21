import React, { useEffect, useState, useContext } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { FileText } from 'lucide-react-native';
import db from '../db/db';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import SecondaryButton from '../components/SecondaryButton';
import { commonStyles, colors } from '../styles/commonStyles';
import { AuthContext } from '../context/AuthContext';
import {
  formatCurrency,
  formatDate,
  getContractLifecycleLabel,
  getPaymentStatusLabel,
  getPaymentStatusTheme,
} from '../utils/contractPresentation';

export default function MeuContratoScreen({ navigation }) {
  const { user, role } = useContext(AuthContext);
  const [contrato, setContrato] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const paymentTheme = getPaymentStatusTheme(contrato?.statusFinanceiro);

  useEffect(() => {
    const carregarContrato = async () => {
      try {
        await db.init();

        // Validar que o usuário tem role 'usuario'
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

        const contratoFormatado = {
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
        };

        setContrato(contratoFormatado);
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
      <SafeAreaView style={commonStyles.safeArea}>
        <PageContainer>
          <PageHeader icon={FileText} title="Meu Contrato" />
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </PageContainer>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={commonStyles.safeArea}>
        <PageContainer>
          <PageHeader icon={FileText} title="Meu Contrato" />
          <View style={styles.errorContainer}>
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
    <SafeAreaView style={commonStyles.safeArea}>
      <PageContainer scrollable>
        <PageHeader icon={FileText} title="Meu Contrato" />

        {contrato && (
          <View style={[commonStyles.card, styles.contratoContainer]}>
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

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Informações do Contrato</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>ID do Contrato:</Text>
                <Text style={styles.value}>{contrato.id}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Data de Início:</Text>
                <Text style={styles.value}>{contrato.dataInicio}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Data de Término:</Text>
                <Text style={styles.value}>{contrato.dataTermino}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Próximo Vencimento:</Text>
                <Text style={styles.value}>{formatDate(contrato.vencimentoAtual)}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Imóvel Alugado</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Endereço:</Text>
                <Text style={styles.value}>{contrato.imovel}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Tipo:</Text>
                <Text style={styles.value}>{contrato.imovelTipo}</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Seus Dados</Text>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Nome:</Text>
                <Text style={styles.value}>{contrato.inquilino}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>Email:</Text>
                <Text style={styles.value}>{contrato.inquilinoEmail}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.label}>CPF:</Text>
                <Text style={styles.value}>{contrato.inquilinoCpf}</Text>
              </View>
            </View>

            <View style={[styles.section, styles.valorSection]}>
              <Text style={styles.label}>Valor do Aluguel:</Text>
              <Text style={styles.valorText}>{formatCurrency(contrato.valor)}</Text>
            </View>

            <View style={styles.avisoContainer}>
              <Text style={styles.avisoText}>
                ℹ️ Esta é uma visualização de seus dados de contrato. Para alterações, entre em contato com o administrador.
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.danger || '#e74c3c',
    textAlign: 'center',
    marginBottom: 20,
  },
  contratoContainer: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statusBadge: {
    backgroundColor: '#d4edda',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  statusText: {
    color: '#155724',
    fontWeight: 'bold',
    fontSize: 14,
  },
  paymentBadge: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  paymentBadgeText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary || '#333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontWeight: '600',
    color: '#555',
    flex: 1,
  },
  value: {
    color: '#333',
    flex: 1,
    textAlign: 'right',
    fontFamily: Platform.OS === 'web' ? 'monospace' : undefined,
  },
  valorSection: {
    backgroundColor: '#f9f9f9',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 16,
  },
  valorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary || '#007AFF',
    marginTop: 8,
    textAlign: 'center',
  },
  avisoContainer: {
    backgroundColor: '#fff3cd',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  avisoText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 18,
  },
  bottomButton: {
    marginTop: 16,
  },
});
