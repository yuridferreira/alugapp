import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Archive, Calendar, Home, User, TrendingUp, Clock } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import db from '../../services/localdb/db';
import PageContainer from '../../components/layout/PageContainer';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import { commonStyles } from '../../styles/commonStyles';
import { AuthContext } from '../../context/AuthContext';

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

const STATUS_COLORS = {
  ativo: COLORS.accentGreen,
  pago: COLORS.accentGreen,
  pendente: COLORS.accentYellow,
  atrasado: COLORS.accentRed,
  encerrado: COLORS.textSecondary,
};

function formatCurrency(valor) {
  const num = parseFloat(String(valor).replace(',', '.'));
  if (isNaN(num)) return String(valor);
  return `R$ ${num.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

function formatDate(data) {
  if (!data || data === '—') return '—';
  if (data.includes('-')) {
    const [ano, mes, dia] = data.split('-');
    return `${dia?.padStart(2, '0')}/${mes?.padStart(2, '0')}/${ano}`;
  }
  return data;
}

function getStatusColor(status) {
  const s = (status || '').toLowerCase();
  return STATUS_COLORS[s] || COLORS.textSecondary;
}

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
      <SafeAreaView style={styles.safeArea}>
        <PageContainer>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerSub}>Registros</Text>
              <Text style={styles.headerTitle}>Histórico</Text>
            </View>
            <View style={styles.headerIconBox}>
              <Archive size={22} color={COLORS.accent} />
            </View>
          </View>
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.loadingText}>Carregando registros...</Text>
          </View>
        </PageContainer>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item, index }) => {
    const statusColor = getStatusColor(item.status);
    return (
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardTop}>
          <View style={styles.cardIdBox}>
            <Text style={styles.cardIdText}>#{String(item.id).slice(0, 6)}</Text>
          </View>
          <View style={[styles.statusPill, { backgroundColor: statusColor + '18' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>{item.status}</Text>
          </View>
        </View>

        {/* Infos */}
        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <User size={14} color={COLORS.accent} />
          </View>
          <Text style={styles.infoLabel}>Inquilino</Text>
          <Text style={styles.infoValue} numberOfLines={1}>{item.inquilino}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <Home size={14} color={COLORS.accentPurple} />
          </View>
          <Text style={styles.infoLabel}>Imóvel</Text>
          <Text style={styles.infoValue} numberOfLines={1}>{item.imovel}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <TrendingUp size={14} color={COLORS.accentGreen} />
          </View>
          <Text style={styles.infoLabel}>Valor</Text>
          <Text style={[styles.infoValue, { color: COLORS.accentGreen, fontWeight: '700' }]}>{formatCurrency(item.valor)}</Text>
        </View>

        {/* Datas */}
        <View style={styles.datesRow}>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Início</Text>
            <Text style={styles.dateValue}>{formatDate(item.dataInicio)}</Text>
          </View>
          <View style={styles.dateSep} />
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>Término</Text>
            <Text style={styles.dateValue}>{formatDate(item.dataTermino)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageContainer>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Registros</Text>
            <Text style={styles.headerTitle}>Histórico</Text>
          </View>
          <View style={styles.headerIconBox}>
            <Archive size={22} color={COLORS.accent} />
          </View>
        </View>

        {/* Banner de resumo */}
        <View style={styles.banner}>
          <View style={styles.bannerLeft}>
            <Text style={styles.bannerCount}>{historico.length}</Text>
            <Text style={styles.bannerLabel}>registros encontrados</Text>
            {historico.length > 0 && (
              <View style={styles.bannerDateRow}>
                <Clock size={12} color="rgba(255,255,255,0.5)" />
                <Text style={styles.bannerDate}>
                  Último em {formatDate(historico[0].rawDate)}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.bannerDecor} />
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <FlatList
          data={historico}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Archive size={40} color={COLORS.border} />
              <Text style={styles.emptyText}>Nenhum histórico disponível.</Text>
            </View>
          }
          scrollEnabled={false}
        />

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
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerLeft: {
    flex: 1,
    zIndex: 1,
  },
  bannerCount: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -1,
    lineHeight: 46,
  },
  bannerLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
    marginBottom: 8,
  },
  bannerDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  bannerDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
  },
  bannerDecor: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: COLORS.accent + '20',
    right: -30,
    top: -30,
  },

  // Loading
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginTop: 60,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },

  // Error
  errorCard: {
    backgroundColor: COLORS.accentRed + '12',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.accentRed,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.accentRed,
    fontWeight: '600',
  },

  // Cards
  listContainer: {
    paddingBottom: 8,
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  cardIdBox: {
    backgroundColor: COLORS.border,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoIconBox: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    width: 64,
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
  },

  // Datas
  datesRow: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dateBox: {
    flex: 1,
    alignItems: 'center',
  },
  dateSep: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 12,
  },
  dateLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // Empty
  emptyBox: {
    alignItems: 'center',
    marginTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },

  bottomButton: {
    marginTop: 16,
    marginBottom: 8,
  },
});