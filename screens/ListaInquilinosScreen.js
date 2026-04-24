import React, { useEffect, useState, useCallback, memo } from 'react';
import { SafeAreaView, View, Text, FlatList, StyleSheet } from 'react-native';
import { Users, UserRound, BadgeInfo, Phone, Mail, FolderOpen } from 'lucide-react-native';
import db from '../db/db';
import PageContainer from '../components/PageContainer';
import SecondaryButton from '../components/SecondaryButton';

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

const TenantInfoRow = ({ icon: Icon, iconColor, bgColor, label, value }) => (
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
    <Text style={styles.emptyTitle}>Nenhum inquilino cadastrado</Text>
    <Text style={styles.emptyText}>
      Quando novos inquilinos forem registrados, eles aparecerão aqui com seus dados principais.
    </Text>
    <SecondaryButton title="Voltar para o Menu" onPress={onBack} style={styles.emptyButton} />
  </View>
);

const TenantCard = memo(function TenantCard({ item }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopAccent} />

      <View style={styles.cardHeader}>
        <View style={styles.cardIconBox}>
          <UserRound size={20} color={COLORS.accent} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.cardEyebrow}>INQUILINO</Text>
          <Text style={styles.cardTitle}>{item.nome || 'Nome não informado'}</Text>
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>Ativo</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <TenantInfoRow
          icon={BadgeInfo}
          iconColor={COLORS.accentPurple}
          bgColor={COLORS.softPurple}
          label="CPF"
          value={item.cpf}
        />

        <TenantInfoRow
          icon={Phone}
          iconColor={COLORS.accentGreen}
          bgColor={COLORS.softGreen}
          label="Telefone"
          value={item.telefone}
        />

        <TenantInfoRow
          icon={Mail}
          iconColor={COLORS.accent}
          bgColor={COLORS.softBlue}
          label="Email"
          value={item.email}
        />
      </View>
    </View>
  );
});

export default function ListaInquilinosScreen({ navigation }) {
  const [inquilinos, setInquilinos] = useState([]);

  useEffect(() => {
    const carregarInquilinos = async () => {
      try {
        await db.init();
        const lista = await db.getTodosInquilinos();

        const mapped = (lista || []).map((i, index) => ({
          id: i.id || index,
          nome: i.nome || i.name || '',
          cpf: i.cpf || String(i.id || ''),
          telefone: i.telefone || i.phone || '',
          email: i.email || '',
        }));

        setInquilinos(mapped);
      } catch (error) {
        console.error('Erro ao carregar inquilinos:', error);
      }
    };

    carregarInquilinos();
  }, []);

  const renderItem = useCallback(({ item }) => <TenantCard item={item} />, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageContainer>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Cadastros</Text>
            <Text style={styles.headerTitle}>Lista de Inquilinos</Text>
          </View>
          <View style={styles.headerIconBox}>
            <Users size={22} color={COLORS.accent} />
          </View>
        </View>

        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Acompanhe os inquilinos com clareza</Text>
            <Text style={styles.bannerSub}>
              Consulte rapidamente nome, CPF, telefone e email dos inquilinos cadastrados.
            </Text>
          </View>
          <View style={styles.bannerDecor} />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Resumo</Text>
          <Text style={styles.summaryTitle}>{inquilinos.length} inquilinos cadastrados</Text>
          <Text style={styles.summaryText}>
            Esta lista reúne os principais dados de contato e identificação dos locatários.
          </Text>
        </View>

        <FlatList
          data={inquilinos}
          keyExtractor={(item, index) => item.cpf || String(item.id || index)}
          renderItem={renderItem}
          ListEmptyComponent={<EmptyState onBack={() => navigation.navigate('Home')} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        {inquilinos.length > 0 && (
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
    backgroundColor: COLORS.softGreen,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statusBadgeText: {
    color: COLORS.accentGreen,
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