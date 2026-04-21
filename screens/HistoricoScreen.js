import React, { useContext, useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Archive } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import db from '../db/db';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import SecondaryButton from '../components/SecondaryButton';
import { commonStyles, colors } from '../styles/commonStyles';
import { AuthContext } from '../context/AuthContext';

export default function HistoricoScreen({ navigation }) {
  const { role } = useContext(AuthContext);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarHistorico = async () => {
      try {
        await db.init();
        let entries = [];
        try {
          const h = await db.getHistory();
          entries = (h || []).map(row => {
            const parsed = typeof row.data === 'string' ? JSON.parse(row.data) : (row.data || {});
            return {
              id: row.id || `${row.entity}_${row.entity_id}_${row.date}`,
              inquilino: parsed.inquilino || parsed.tenantName || parsed.tenant || parsed.nome || parsed.name || '—',
              imovel: parsed.imovel || parsed.propertyAddress || parsed.property || parsed.endereco || parsed.address || '—',
              valor: parsed.valor || parsed.rent_value || parsed.amount || '—',
              status: parsed.status || row.action || '—',
              dataInicio: parsed.dataInicio || parsed.start_date || parsed.inicio || '—',
              dataTermino: parsed.dataTermino || parsed.end_date || parsed.fim || '—',
              rawDate: row.date || parsed.date || '',
              raw: parsed,
            };
          });
        } catch (e) {
          console.warn('Erro ao ler histórico do DB:', e);
        }

        if (role === 'admin') {
          try {
            const dados = await AsyncStorage.getItem('historico_alugueis');
            const listaLegada = dados ? JSON.parse(dados) : [];
            const formatoLegado = (listaLegada || []).map(item => ({
              id: item.id || `legacy_${item.inquilino || ''}_${item.imovel || ''}_${item.dataTermino || item.dataInicio || ''}`,
              inquilino: item.inquilino || '—',
              imovel: item.imovel || '—',
              valor: item.valor || '—',
              status: item.status || '—',
              dataInicio: item.dataInicio || item.inicio || '—',
              dataTermino: item.dataTermino || item.fim || '—',
              rawDate: null,
              raw: item,
            }));
            const seen = new Set(entries.map(e => String(e.id)));
            for (const it of formatoLegado) {
              if (!seen.has(String(it.id))) {
                entries.push(it);
                seen.add(String(it.id));
              }
            }
          } catch (e) {
            console.warn('Erro ao ler histórico legado:', e);
          }
        }

        entries.sort((a, b) => (b.rawDate || '').localeCompare(a.rawDate || ''));
        setHistorico(entries);
        setError(null);
      } catch (err) {
        console.error('Erro ao carregar histórico:', err);
        setError('Erro ao carregar o histórico.');
      } finally {
        setLoading(false);
      }
    };
    carregarHistorico();
  }, [role]);

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.safeArea}>
        <PageContainer>
          <PageHeader icon={Archive} title="Histórico de Aluguéis" />
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        </PageContainer>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => (
    <View style={[commonStyles.card, styles.item]}>
      <Text style={styles.label}>Contrato #{item.id}</Text>
      <Text style={commonStyles.text}>Inquilino: {item.inquilino}</Text>
      <Text style={commonStyles.text}>Imóvel: {item.imovel}</Text>
      <Text style={commonStyles.text}>Valor: R$ {item.valor}</Text>
      <Text style={commonStyles.text}>Status: {item.status}</Text>
      <Text style={commonStyles.text}>Data de Início: {item.dataInicio}</Text>
      <Text style={commonStyles.text}>Data de Término: {item.dataTermino}</Text>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <PageContainer>
        <PageHeader icon={Archive} title="Histórico de Aluguéis" />
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
        <FlatList
          data={historico}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum histórico disponível.</Text>}
        />
        <SecondaryButton title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} style={styles.bottomButton} />
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
  item: {
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: colors.textSecondary,
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
    color: colors.danger || '#c0392b',
  },
  bottomButton: {
    marginTop: 18,
  },
});
