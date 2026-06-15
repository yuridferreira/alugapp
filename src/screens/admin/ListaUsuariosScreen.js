import React, { useEffect, useState, useCallback, memo } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Mail, ShieldCheck, FolderOpen, UserRound } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PageContainer from '../../components/layout/PageContainer';
import SecondaryButton from '../../components/buttons/SecondaryButton';
import { theme } from '../../styles/theme';

const UserInfoRow = ({ icon: Icon, iconColor, bgColor, label, value }) => (
  <View style={styles.infoRow}>
    <View style={[styles.infoIconBox, { backgroundColor: bgColor }]}>
      <Icon size={16} color={iconColor} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const EmptyState = ({ onBack }) => (
  <View style={styles.emptyCard}>
    <View style={styles.emptyIconBox}>
      <FolderOpen size={28} color={theme.colors.accent} />
    </View>
    <Text style={styles.emptyTitle}>Nenhum usuário cadastrado</Text>
    <Text style={styles.emptyText}>
      Quando novos usuários forem registrados, eles aparecerão aqui para consulta administrativa.
    </Text>
    <SecondaryButton title="Voltar para o Menu" onPress={onBack} style={styles.emptyButton} />
  </View>
);

const UserCard = memo(function UserCard({ item }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopAccent} />

      <View style={styles.cardHeader}>
        <View style={styles.cardIconBox}>
          <UserRound size={20} color={theme.colors.accent} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.cardEyebrow}>USUÁRIO</Text>
          <Text style={styles.cardTitle}>{item.email}</Text>
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>Ativo</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <UserInfoRow
          icon={Mail}
          iconColor={theme.colors.accent}
          bgColor={theme.colors.softBlue}
          label="Email"
          value={item.email}
        />

        <UserInfoRow
          icon={ShieldCheck}
          iconColor={theme.colors.accentGreen}
          bgColor={theme.colors.softGreen}
          label="Senha"
          value="••••••••"
        />
      </View>
    </View>
  );
});

export default function ListaUsuariosScreen({ navigation }) {
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    const carregarUsuarios = async () => {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const usuarioKeys = keys.filter((k) => k.startsWith('usuario_'));
        const entries = await AsyncStorage.multiGet(usuarioKeys);
        const lista = entries
          .map(([_, value]) => JSON.parse(value))
          .filter(Boolean);

        setUsuarios(lista);
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }
    };

    carregarUsuarios();
  }, []);

  const renderItem = useCallback(({ item }) => <UserCard item={item} />, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageContainer>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Administração</Text>
            <Text style={styles.headerTitle}>Lista de Usuários</Text>
          </View>
          <View style={styles.headerIconBox}>
            <Users size={22} color={theme.colors.accent} />
          </View>
        </View>

        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Gerencie usuários com clareza</Text>
            <Text style={styles.bannerSub}>
              Visualize rapidamente os usuários cadastrados no aplicativo em uma interface organizada.
            </Text>
          </View>
          <View style={styles.bannerDecor} />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Resumo</Text>
          <Text style={styles.summaryTitle}>{usuarios.length} usuários cadastrados</Text>
          <Text style={styles.summaryText}>
            Esta área reúne os acessos cadastrados para acompanhamento administrativo.
          </Text>
        </View>

        <FlatList
          data={usuarios}
          keyExtractor={(item, index) => item.email || String(index)}
          renderItem={renderItem}
          ListEmptyComponent={<EmptyState onBack={() => navigation.navigate('Home')} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        {usuarios.length > 0 && (
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

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  headerSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: theme.colors.accent + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },

  banner: {
    backgroundColor: theme.colors.primary,
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
    backgroundColor: theme.colors.accent + '20',
    right: -24,
    top: -20,
  },

  summaryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
    lineHeight: 19,
    color: theme.colors.textSecondary,
  },

  listContainer: {
    paddingBottom: 20,
    flexGrow: 1,
  },

  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    backgroundColor: theme.colors.accent,
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
    backgroundColor: theme.colors.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardEyebrow: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },

  statusBadge: {
    backgroundColor: theme.colors.softGreen,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statusBadgeText: {
    color: theme.colors.accentGreen,
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
    color: theme.colors.textSecondary,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '600',
    lineHeight: 20,
  },

  emptyCard: {
    backgroundColor: theme.colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginTop: 8,
  },
  emptyIconBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: theme.colors.softBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
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