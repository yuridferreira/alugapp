import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  Platform,
  Pressable,
} from 'react-native';
import {
  House,
  MapPin,
  Building2,
  Layers3,
  SquarePen,
  Trash2,
  FolderOpen,
} from 'lucide-react-native';
import db from '../db/db';
import PageContainer from '../components/PageContainer';
import SecondaryButton from '../components/SecondaryButton';
import { colors } from '../styles/commonStyles';

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

const normalizeText = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const PropertyInfoRow = ({ icon: Icon, iconColor, bgColor, label, value }) => (
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
    <Text style={styles.emptyTitle}>Nenhum imóvel cadastrado</Text>
    <Text style={styles.emptyText}>
      Quando novos imóveis forem adicionados, eles aparecerão aqui para edição e gerenciamento.
    </Text>
    <SecondaryButton title="Voltar para o Menu" onPress={onBack} style={styles.emptyButton} />
  </View>
);

const PropertyCard = memo(function PropertyCard({ item, onEdit, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTopAccent} />

      <View style={styles.cardHeader}>
        <View style={styles.cardIconBox}>
          <House size={20} color={COLORS.accent} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.cardEyebrow}>IMÓVEL #{item.id}</Text>
          <Text style={styles.cardTitle}>{item.tipo || 'Tipo não informado'}</Text>
        </View>

        <View style={styles.tag}>
          <Text style={styles.tagText}>Ativo</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <PropertyInfoRow
          icon={MapPin}
          iconColor={COLORS.accent}
          bgColor={COLORS.softBlue}
          label="Endereço"
          value={item.endereco}
        />

        <PropertyInfoRow
          icon={Building2}
          iconColor={COLORS.accentPurple}
          bgColor={COLORS.softPurple}
          label="Torre"
          value={item.torre}
        />

        <PropertyInfoRow
          icon={Layers3}
          iconColor={COLORS.accentYellow}
          bgColor={COLORS.softYellow}
          label="Andar"
          value={item.andar}
        />

        <PropertyInfoRow
          icon={House}
          iconColor={COLORS.accentGreen}
          bgColor={COLORS.softGreen}
          label="Completo"
          value={item.completo}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.actionRow}>
        <Pressable
          onPress={() => onEdit(item)}
          style={({ pressed }) => [
            styles.actionButton,
            styles.editButton,
            pressed && styles.pressed,
          ]}
        >
          <SquarePen size={16} color="#FFFFFF" />
          <Text style={styles.actionButtonTextWhite}>Editar</Text>
        </Pressable>

        <Pressable
          onPress={() => onDelete(item.id)}
          style={({ pressed }) => [
            styles.actionButton,
            styles.deleteButton,
            pressed && styles.pressed,
          ]}
        >
          <Trash2 size={16} color={COLORS.accentRed} />
          <Text style={styles.actionButtonTextDanger}>Excluir</Text>
        </Pressable>
      </View>
    </View>
  );
});

export default function ListaImoveisScreen({ navigation }) {
  const [imoveis, setImoveis] = useState([]);

  const carregarImoveis = useCallback(async () => {
    try {
      await db.init();
      const lista = await db.getTodosImoveis();

      const mapped = (lista || [])
        .map((i) => ({
          ...i,
          tipo: i.tipo || i.meta?.tipo || i.title,
          endereco: i.endereco || i.address || '',
        }))
        .sort((a, b) => {
          const tipoA = normalizeText(a.tipo);
          const tipoB = normalizeText(b.tipo);
          return tipoA.localeCompare(tipoB, 'pt-BR', {
            numeric: true,
            sensitivity: 'base',
          });
        });

      setImoveis(mapped);
    } catch (error) {
      console.error('Erro ao carregar imóveis:', error);
    }
  }, []);

  const excluirImovel = useCallback(async (id) => {
    const confirmar = async () => {
      try {
        await db.deleteImovel(id);
        setImoveis((prev) => prev.filter((i) => i.id !== id));
      } catch (error) {
        console.error('Erro ao excluir imóvel:', error);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Deseja excluir este imóvel?')) {
        await confirmar();
      }
      return;
    }

    Alert.alert('Confirmação', 'Deseja excluir este imóvel?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: confirmar },
    ]);
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregarImoveis);
    return unsubscribe;
  }, [navigation, carregarImoveis]);

  const renderItem = useCallback(
    ({ item }) => (
      <PropertyCard
        item={item}
        onEdit={(property) => navigation.navigate('CadastroImovel', { editar: property })}
        onDelete={excluirImovel}
      />
    ),
    [navigation, excluirImovel]
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <PageContainer>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSub}>Patrimônio</Text>
            <Text style={styles.headerTitle}>Lista de Imóveis</Text>
          </View>
          <View style={styles.headerIconBox}>
            <House size={22} color={COLORS.accent} />
          </View>
        </View>

        <View style={styles.banner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Gerencie seus imóveis com clareza</Text>
            <Text style={styles.bannerSub}>
              Visualize rapidamente endereço, torre, andar e acesse ações de edição ou exclusão.
            </Text>
          </View>
          <View style={styles.bannerDecor} />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Resumo</Text>
          <Text style={styles.summaryTitle}>{imoveis.length} imóveis cadastrados</Text>
          <Text style={styles.summaryText}>
            Acompanhe os imóveis registrados e mantenha os dados sempre organizados.
          </Text>
        </View>

        <FlatList
          data={imoveis}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListEmptyComponent={
            <EmptyState onBack={() => navigation.navigate('Home')} />
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />

        {imoveis.length > 0 && (
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
    left: 0,
    right: 0,
    top: 0,
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
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  tag: {
    backgroundColor: COLORS.softGreen,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  tagText: {
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

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  editButton: {
    backgroundColor: COLORS.accent,
  },
  deleteButton: {
    backgroundColor: COLORS.softRed,
    borderWidth: 1,
    borderColor: '#FFD7D7',
  },
  actionButtonTextWhite: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  actionButtonTextDanger: {
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