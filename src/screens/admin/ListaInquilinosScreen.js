import React, { useEffect, useState, useCallback, memo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, UserRound, BadgeInfo, Phone, Mail } from 'lucide-react-native';
import { db } from '../../services/localdb/db';
import PageContainer from '../../components/layout/PageContainer';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import ScreenHeader from '../../components/ui/ScreenHeader';
import HeroBanner from '../../components/ui/HeroBanner';
import SummaryCard from '../../components/ui/SummaryCard';
import InfoRow from '../../components/ui/InfoRow';
import StatusBadge from '../../components/ui/StatusBadge';
import EmptyState from '../../components/ui/EmptyState';
import { theme } from '../../styles/theme';

const TenantCard = memo(function TenantCard({ item }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopAccent} />

      <View style={styles.cardHeader}>
        <View style={styles.cardIconBox}>
          <UserRound size={20} color={theme.colors.accent} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.cardEyebrow}>INQUILINO</Text>
          <Text style={styles.cardTitle}>{item.nome || 'Nome não informado'}</Text>
        </View>

        <StatusBadge status="Ativo" />
      </View>

      <View style={styles.cardBody}>
        <InfoRow
          icon={BadgeInfo}
          iconColor={theme.colors.accentPurple}
          bgColor={theme.colors.softPurple}
          label="CPF"
          value={item.cpf}
        />

        <InfoRow
          icon={Phone}
          iconColor={theme.colors.accentGreen}
          bgColor={theme.colors.softGreen}
          label="Telefone"
          value={item.telefone}
        />

        <InfoRow
          icon={Mail}
          iconColor={theme.colors.accent}
          bgColor={theme.colors.softBlue}
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
        <ScreenHeader
          subtitle="Cadastros"
          title="Lista de Inquilinos"
          icon={Users}
        />

        <HeroBanner
          title="Acompanhe os inquilinos com clareza"
          subtitle="Consulte rapidamente nome, CPF, telefone e email dos inquilinos cadastrados."
        />

        <SummaryCard
          label="Resumo"
          title={`${inquilinos.length} inquilinos cadastrados`}
          subtitle="Esta lista reúne os principais dados de contato e identificação dos locatários."
        />

        <FlatList
          data={inquilinos}
          keyExtractor={(item, index) => item.cpf || String(item.id || index)}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState
              icon={Mail}
              title="Nenhum inquilino cadastrado"
              subtitle="Quando novos inquilinos forem registrados, eles aparecerão aqui com seus dados principais."
              actionButton={
                <SecondaryButton
                  title="Voltar para o Menu"
                  onPress={() => navigation.navigate('Home')}
                />
              }
            />
          }
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
    backgroundColor: theme.colors.bg,
  },

  listContainer: {
    paddingBottom: theme.spacing.xl,
    flexGrow: 1,
  },

  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.spacing.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.medium,
    overflow: 'hidden',
  },
  cardTopAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: theme.colors.accent,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  cardIconBox: {
    width: 38,
    height: 38,
    borderRadius: theme.spacing.md,
    backgroundColor: theme.colors.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEyebrow: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: theme.typography.letterSpacing.wide,
    textTransform: 'uppercase',
    marginBottom: theme.spacing.xs,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.textPrimary,
  },

  cardBody: {
    gap: theme.spacing.md,
  },

  bottomButton: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
});