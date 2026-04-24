import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Alert,
  Platform,
  StyleSheet,
  Pressable,
} from 'react-native';
import {
  FileText,
  CalendarDays,
  House,
  User,
  BadgeDollarSign,
  Trash2,
  FolderOpen,
  BadgeCheck,
} from 'lucide-react-native';
import db from '../db/db';
import PageContainer from '../components/PageContainer';
import SecondaryButton from '../components/SecondaryButton';

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
  softPurple: '#F2ECFF',
  softRed: '#FEECEC',
  border: '#E8EEFF',
};

const ContractInfoRow = ({ icon: Icon, iconColor, bgColor, label, value }) => (
  <View style={styles.infoRow}>
    <View style={[styles.infoIconBox, { backgroundColor: bgColor }]}>
      <Icon size={16} color={iconColor} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || 'Não informado'}</Text>
    </View>
  </View>
);

const EmptyState = ({ onBack }) => (
  <View style={styles.emptyCard}>
    <View style={styles.emptyIconBox}>
      <FolderOpen size={28} color={COLORS.accent} />
    </View>
    <Text style={styles.emptyTitle}>Nenhum contrato cadastrado</Text>
    <Text style={styles.emptyText}>
      Quando novos contratos forem criados, eles aparecerão aqui com detalhes de inquilino, imóvel e período.
    </Text>
    <SecondaryButton title="Voltar para o Menu" onPress={onBack} style={styles.emptyButton} />
  </View>
);

const StatusBadge = ({ status }) => {
  const label = String(status || 'Ativo');
  return (
    <View style={styles.statusBadge}>
      <BadgeCheck size={14} color={COLORS.accentGreen} />
      <Text style={styles.statusBadgeText}>{label}</Text>
    </View>
  );
};

const ContractCard = memo(function ContractCard({ item, onDelete, formatarData }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopAccent} />

      <View style={styles.cardHeader}>
        <View style={styles.cardIconBox}>
          <FileText size={20} color={COLORS.accent} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.cardEyebrow}>CONTRATO #{item.id}</Text>
          <Text style={styles.cardTitle}>{item.tenantName || item.tenantCpf}</Text>
        </View>

        <StatusBadge status={item.status || 'Ativo'} />
      </View>

      <View style={styles.cardBody}>
        <ContractInfoRow
          icon={House}
          iconColor={COLORS.accent}
          bgColor={COLORS.softBlue}
          label="Imóvel"
          value={item.propertyAddress}
        />

        <ContractInfoRow
          icon={CalendarDays}
          iconColor={COLORS.accentPurple}
          bgColor={COLORS.softPurple}
          label="Período"
          value={`${formatarData(item.dataInicio)} a ${formatarData(item.dataTermino)}`}
        />

        <ContractInfoRow
          icon={BadgeDollarSign}
          iconColor={COLORS.accentYellow}
          bgColor={COLORS.softYellow}
          label="Valor"
          value={`R$ ${item.valor}`}
        />

        <ContractInfoRow
          icon={User}
          iconColor={COLORS.accentGreen}
          bgColor={COLORS.softGreen}
          label="CPF / Referência"
          value={item.tenantCpf}
        />
      </View>

      <View style={styles.divider} />

      <Pressable
        onPress={() => onDelete(item.id)}
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && styles.pressed,
        ]}
      >
        <Trash2 size={16} color={COLORS.accentRed} />
        <Text style={styles.deleteButtonText}>Excluir contrato</Text>
      </Pressable>
    </View>
  );
});

export default function ListaContratosScreen({ navigation }) {
  const [contratos, setContratos] = useState([]);

  const carregarContratos = useCallback(async () => {
    try {
      await db.init();
      const listaRaw = await db.getTodosContratos();

      const [allTenants, allProperties] = await Promise.all([
        db.getTodosInquilinos(),
        db.getTodosImoveis(),
      ]);

      const tenantsByCpf = {};
      const tenantsById = {};
      const propertiesById = {};

      (allTenants || []).forEach((t) => {
        tenantsByCpf[String(t.cpf)] = t;
        if (t.id) tenantsById[String(t.id)] = t;
      });

      (allProperties || []).forEach((p) => {
        if (p.id) propertiesById[String(p.id)] = p;
      });

      const lista = (listaRaw || []).map((item) => ({
        id: item.id,
        inquilino: item.inquilino || item.tenant_id || item.tenant || item.inquilino,
        imovel: item.imovel || item.property_id || item.imovel,
        dataInicio: item.dataInicio || item.start_date || item.dataInicio,
        dataTermino: item.dataTermino || item.end_date || item.dataTermino,
        valor: item.valor || item.rent_value || item.valor,
        status: item.status || 'Ativo',
      }));

      const enriched = lista.map((it) => {
        const tenant =
          tenantsByCpf[String(it.inquilino)] ||
          tenantsById[String(it.inquilino)] ||
          null;

        const property = propertiesById[String(it.imovel)] || null;

        return {
          ...it,
          tenantName: tenant?.nome || tenant?.name || it.inquilino,
          tenantCpf: tenant?.cpf || it.inquilino,
          propertyAddress: property?.endereco || property?.address || String(it.imovel),
        };
      });

      setContratos(enriched);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
    }
  }, []);

  const excluirContrato = useCallback(async (id) => {
    const confirmMessage = `Deseja excluir o contrato #${id}?`;

    const execute = async () => {
      try {
        await db.deleteContrato(id);
        setContratos((prev) => prev.filter((c) => c.id !== id));
      } catch (error) {
        console.error('Erro ao excluir contrato:', error);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMessage)) {
        await execute();
      }
    } else {
      Alert.alert('Confirmação', confirmMessage, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: execute },
      ]);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregarContratos);
    return unsubscribe;
  }, [navigation, carregarContratos]);

  const formatarData = (data) => {
    if (!data) return 'Não definida';

    const [ano, mes, dia] = String(data).split('-');
    if (!ano || !mes || !dia) return String(data);

    return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
  };

  const renderItem = useCallback(
    ({ item }) => (
      <ContractCard
        item={item}
        onDelete={excluirContrato}
        formatarData={formatarData}
      />
    ),
    [excluirContrato]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageContainer>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Documentos</Text>
            <Text style={styles.headerTitle}>Lista de Contratos</Text>
          </View>
          <View style={styles.headerIconBox}>
            <FileText size={22} color={COLORS.accent} />
          </View>
        </View>

        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Acompanhe seus contratos com clareza</Text>
            <Text style={styles.bannerSub}>
              Consulte rapidamente informações de inquilino, imóvel, período e valor do aluguel.
            </Text>
          </View>
          <View style={styles.bannerDecor} />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Resumo</Text>
          <Text style={styles.summaryTitle}>{contratos.length} contratos cadastrados</Text>
          <Text style={styles.summaryText}>
            Visualize os registros ativos e gerencie exclusões com segurança.
          </Text>
        </View>

        <FlatList
          data={contratos}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState onBack={() => navigation.navigate('Home')} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        {contratos.length > 0 && (
          <SecondaryButton
            title="Voltar para o Menu"
            onPress={() => navigation.navigate('Home')}
            style={styles.bottomButton}
          />
        )}
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
  summaryTitle: {
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

  listContainer: {
    paddingBottom: 20,
    flexGrow: 1,
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
    elevation: 3,
    overflow: 'hidden',
  },
  cardTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: COLORS.accent,
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

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.softGreen,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statusBadgeText: {
    color: COLORS.accentGreen,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'capitalize',
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

  deleteButton: {
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: COLORS.softRed,
    borderWidth: 1,
    borderColor: '#FFD7D7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: COLORS.accentRed,
    fontSize: 13,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.88,
  },

  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 8,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: COLORS.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyButton: {
    minWidth: 180,
  },

  bottomButton: {
    marginTop: 8,
    marginBottom: 8,
  },
});