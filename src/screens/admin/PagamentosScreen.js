import React, { useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { CreditCard, CalendarDays, Home, User, BadgeCheck, Clock3, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import db from '../../services/localdb/db';
import PageContainer from '../../components/layout/PageContainer';
import ScreenHeader from '../../components/ui/ScreenHeader';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import { commonStyles, colors } from '../../styles/commonStyles';
import { AuthContext } from '../../context/AuthContext';

const COLORS = {
  primary: '#1A1A2E',
  accent: '#4F8EF7',
  accentGreen: '#22C55E',
  accentYellow: '#F59E0B',
  accentRed: '#EF4444',
  accentPurple: '#8B5CF6',
  card: '#FFFFFF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  bg: '#F5F7FF',
  softBlue: '#EAF1FF',
  softGreen: '#EAFBF1',
  softYellow: '#FFF7E6',
  softRed: '#FEECEC',
  border: '#E8EEFF',
};

const formatStatusLabel = (status) => {
  const raw = String(status || '').trim().toLowerCase();
  if (raw === 'pago' || raw === 'paid') return 'Pago';
  if (raw === 'atrasado' || raw === 'atrasada' || raw === 'overdue') return 'Atrasado';
  if (raw === 'pendente' || raw === 'pending') return 'Pendente';
  if (raw === 'finalizado') return 'Finalizado';
  return 'Pendente';
};

const normalizeStatus = (status) => {
  const raw = String(status || '').trim().toLowerCase();
  if (raw === 'pago' || raw === 'paid') return 'pago';
  if (raw === 'atrasado' || raw === 'atrasada' || raw === 'overdue') return 'atrasado';
  if (raw === 'pendente' || raw === 'pending') return 'pendente';
  if (raw === 'finalizado') return 'finalizado';
  return 'pendente';
};

const getStatusMeta = (status) => {
  const normalized = normalizeStatus(status);

  if (normalized === 'pago') {
    return {
      label: 'Pago',
      color: COLORS.accentGreen,
      bg: COLORS.softGreen,
      icon: BadgeCheck,
    };
  }

  if (normalized === 'atrasado') {
    return {
      label: 'Atrasado',
      color: COLORS.accentRed,
      bg: COLORS.softRed,
      icon: AlertTriangle,
    };
  }

  if (normalized === 'finalizado') {
    return {
      label: 'Finalizado',
      color: COLORS.textSecondary,
      bg: '#EEF2F7',
      icon: CheckCircle2,
    };
  }

  return {
    label: 'Pendente',
    color: COLORS.accentYellow,
    bg: COLORS.softYellow,
    icon: Clock3,
  };
};

const normalizeText = (text) => String(text || '').toLowerCase();

const StatusPill = ({ status }) => {
  const meta = getStatusMeta(status);
  const Icon = meta.icon;

  return (
    <View style={[styles.statusPill, { backgroundColor: meta.bg }]}>
      <Icon size={14} color={meta.color} />
      <Text style={[styles.statusPillText, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
};

const PaymentItem = memo(function PaymentItem({ item, onChangeStatus }) {
  const meta = getStatusMeta(item.status);
  const valor =
    typeof item.valor === 'number' && !Number.isNaN(item.valor)
      ? item.valor.toFixed(2)
      : 'Valor inválido';

  const endereco = [item.propertyAddress, item.propertyType].filter(Boolean).join(' • ');

  return (
    <View style={styles.card}>
      <View style={[styles.cardTopAccent, { backgroundColor: meta.color }]} />

      <View style={styles.cardHeader}>
        <View style={styles.cardIconBox}>
          <CreditCard size={20} color={COLORS.accent} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.cardEyebrow}>CONTRATO #{item.id}</Text>
          <Text style={styles.cardTitle}>{item.tenantName || item.inquilino || 'Inquilino não identificado'}</Text>
        </View>

        <StatusPill status={item.status} />
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <Home size={16} color={COLORS.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Imóvel</Text>
            <Text style={styles.infoValue}>{endereco || item.imovel || 'Não informado'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <User size={16} color={COLORS.accentPurple} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Valor do aluguel</Text>
            <Text style={styles.infoValue}>R$ {valor}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconBox}>
            <CalendarDays size={16} color={COLORS.accentYellow} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.infoLabel}>Status atual</Text>
            <Text style={styles.infoValue}>{formatStatusLabel(item.status)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.actionGrid}>
        <Pressable
          onPress={() => onChangeStatus(item.id, 'pago')}
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionPago,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.actionTextWhite}>PAGO</Text>
        </Pressable>

        <Pressable
          onPress={() => onChangeStatus(item.id, 'pendente')}
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionPendente,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.actionTextDark}>PENDENTE</Text>
        </Pressable>

        <Pressable
          onPress={() => onChangeStatus(item.id, 'atrasado')}
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionAtrasado,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.actionTextWhite}>ATRASADO</Text>
        </Pressable>

        <Pressable
          onPress={() => onChangeStatus(item.id, 'finalizado')}
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionFinalizar,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.actionTextWhite}>FINALIZAR</Text>
        </Pressable>
      </View>
    </View>
  );
});

export default function PagamentosScreen({ navigation }) {
  const { user, role } = useContext(AuthContext);
  const [contratos, setContratos] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const carregarContratos = useCallback(async () => {
    try {
      setLoading(true);
      await db.init();

      const listaRaw =
        role === 'admin'
          ? await db.getTodosContratos()
          : await db.getContratosByUserId(user.uid);

      const [allTenants, allProperties] = await Promise.all([
        db.getTodosInquilinos(),
        db.getTodosImoveis(),
      ]);

      const tenantsByCpf = {};
      const tenantsById = {};
      const propertiesById = {};

      (allTenants || []).forEach((t) => {
        if (t?.cpf) tenantsByCpf[String(t.cpf)] = t;
        if (t?.id) tenantsById[String(t.id)] = t;
      });

      (allProperties || []).forEach((p) => {
        if (p?.id) propertiesById[String(p.id)] = p;
      });

      const listaComStatus = await Promise.all(
        (listaRaw || []).map(async (c) => {
          const pagamentoAtual = await db.getPagamentoAtualByContratoId(c.id);
          const base = {
            id: c.id,
            inquilino: c.inquilino || c.tenant_id || null,
            imovel: c.imovel || c.property_id || null,
            valor: Number(c.valor || c.rent_value || 0),
            status: normalizeStatus(pagamentoAtual?.status || c.status),
          };

          const tenant = base.inquilino
            ? tenantsByCpf[String(base.inquilino)] || tenantsById[String(base.inquilino)] || null
            : null;

          const property = base.imovel ? propertiesById[String(base.imovel)] || null : null;

          return {
            ...base,
            tenantName: tenant?.nome || tenant?.name || null,
            propertyAddress: property?.endereco || property?.address || null,
            propertyType: property?.tipo || property?.type || null,
          };
        })
      );

      setContratos(listaComStatus);
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível carregar os pagamentos.');
    } finally {
      setLoading(false);
    }
  }, [role, user?.uid]);

  useEffect(() => {
    carregarContratos();
  }, [carregarContratos]);

  const salvarHistorico = useCallback(async (contrato) => {
    try {
      await db.addHistory('contract', contrato.id, 'moved_to_history', {
        ...contrato,
        userId: contrato.userId || null,
      });
      return true;
    } catch (e) {
      console.warn('Erro ao salvar historico no DB:', e);
      return false;
    }
  }, []);

  const atualizarStatus = useCallback(
    async (id, novoStatus) => {
      try {
        const idx = contratos.findIndex((c) => c.id === id);
        if (idx < 0) return;

        const contratoAtual = contratos[idx];
        const contratoBase = { ...contratoAtual, status: novoStatus };

        if (novoStatus === 'finalizado') {
          const ok = await salvarHistorico(contratoBase);
          if (!ok) {
            Alert.alert('Erro', 'Não foi possível salvar o histórico. Tente novamente.');
            return;
          }

          try {
            await db.deleteContrato(id);
            setContratos((prev) => prev.filter((c) => c.id !== id));
            Alert.alert('Sucesso', 'Contrato movido para o histórico.');
          } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Histórico salvo, mas não foi possível remover o contrato.');
          }
          return;
        }

        const pagamentoAtualizado = await db.atualizarStatusPagamentoAtual(id, novoStatus, {
          nota: 'Status atualizado pelo administrador.',
        });

        const statusNormalizado = normalizeStatus(
          pagamentoAtualizado?.raw?.status || pagamentoAtualizado?.status || novoStatus
        );

        setContratos((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: statusNormalizado } : c))
        );
      } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Não foi possível atualizar o status.');
      }
    },
    [contratos, salvarHistorico]
  );

  const statusOptions = useMemo(
    () => [
      { key: 'all', label: 'Todos' },
      { key: 'pago', label: 'Pago' },
      { key: 'pendente', label: 'Pendente' },
      { key: 'atrasado', label: 'Atrasado' },
      { key: 'finalizado', label: 'Finalizado' },
    ],
    []
  );

  const filteredContratos = useMemo(() => {
    const query = normalizeText(search);

    return contratos.filter((item) => {
      const matchesStatus =
        statusFilter === 'all' || normalizeStatus(item.status) === statusFilter;

      const haystack = [
        item.id,
        item.inquilino,
        item.tenantName,
        item.propertyAddress,
        item.propertyType,
        item.imovel,
      ]
        .map(normalizeText)
        .join(' ');

      const matchesSearch = !query || haystack.includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [contratos, search, statusFilter]);

  const renderItem = useCallback(
    ({ item }) => <PaymentItem item={item} onChangeStatus={atualizarStatus} />,
    [atualizarStatus]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageContainer>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Financeiro</Text>
            <Text style={styles.headerTitle}>Status de Pagamentos</Text>
          </View>
          <View style={styles.headerIconBox}>
            <CreditCard size={22} color={COLORS.accent} />
          </View>
        </View>

        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Controle os contratos com rapidez</Text>
            <Text style={styles.bannerSub}>
              Filtre, pesquise e atualize o status de cada pagamento em um só lugar.
            </Text>
          </View>
          <View style={styles.bannerDecor} />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Resumo</Text>
          <Text style={styles.summaryTitleSmall}>
            {filteredContratos.length} de {contratos.length} exibidos
          </Text>
          <Text style={styles.summaryText}>
            Use os filtros para localizar contratos por status ou pesquisar por inquilino, imóvel e número.
          </Text>
        </View>

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar inquilino, imóvel ou contrato"
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />

        <View style={styles.filterBar}>
          {statusOptions.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setStatusFilter(option.key)}
              style={({ pressed }) => [
                styles.filterButton,
                statusFilter === option.key && styles.filterButtonActive,
                pressed && styles.filterButtonPressed,
              ]}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  statusFilter === option.key && styles.filterButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <FlatList
          data={filteredContratos}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <Text style={styles.empty}>{loading ? 'Carregando pagamentos...' : 'Nenhum pagamento disponível.'}</Text>
          }
          showsVerticalScrollIndicator={false}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
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
    flexDirection: 'row',
    gap: 12,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bannerSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 19,
  },
  bannerDecor: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: COLORS.accent + '20',
    alignSelf: 'flex-start',
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  summaryTitleSmall: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
    color: COLORS.textPrimary,
  },
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterButtonPressed: {
    opacity: 0.85,
  },
  filterButtonText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  cardTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  cardIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEyebrow: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  cardBody: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIconBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#F3F7FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '600',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    minWidth: '48%',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPago: {
    backgroundColor: COLORS.accentGreen,
  },
  actionPendente: {
    backgroundColor: COLORS.accentYellow,
  },
  actionAtrasado: {
    backgroundColor: COLORS.accentRed,
  },
  actionFinalizar: {
    backgroundColor: COLORS.textSecondary,
  },
  actionTextWhite: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  actionTextDark: {
    color: COLORS.textPrimary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  empty: {
    textAlign: 'center',
    marginTop: 36,
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  bottomButton: {
    marginTop: 18,
    marginBottom: 8,
  },
});