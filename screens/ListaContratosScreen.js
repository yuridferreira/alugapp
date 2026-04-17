import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, Alert, Platform, StyleSheet } from 'react-native';
import { FileText } from 'lucide-react-native';
import db from '../db/db';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import { commonStyles, colors } from '../styles/commonStyles';

export default function ListaContratosScreen({ navigation }) {
  const [contratos, setContratos] = useState([]);

  const carregarContratos = async () => {
    try {
      await db.init();
      const listaRaw = await db.getTodosContratos();
      const [allTenants, allProperties] = await Promise.all([db.getTodosInquilinos(), db.getTodosImoveis()]);
      const tenantsByCpf = {};
      const tenantsById = {};
      (allTenants || []).forEach(t => { tenantsByCpf[String(t.cpf)] = t; if (t.id) tenantsById[String(t.id)] = t; });
      const propertiesById = {};
      (allProperties || []).forEach(p => { if (p.id) propertiesById[String(p.id)] = p; });

      const lista = listaRaw.map(item => ({
        id: item.id,
        inquilino: item.inquilino || item.tenant_id || item.tenant || item.inquilino,
        imovel: item.imovel || item.property_id || item.imovel,
        dataInicio: item.dataInicio || item.start_date || item.dataInicio,
        dataTermino: item.dataTermino || item.end_date || item.dataTermino,
        valor: item.valor || item.rent_value || item.valor,
        status: item.status || 'ativo',
      }));

      const enriched = lista.map(it => {
        const tenant = tenantsByCpf[String(it.inquilino)] || tenantsById[String(it.inquilino)] || null;
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
  };

  const excluirContrato = async (id) => {
    const confirmMessage = `Deseja excluir o contrato #${id}?`;
    const execute = async () => {
      try {
        await db.deleteContrato(id);
        setContratos(prev => prev.filter(c => c.id !== id));
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
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', carregarContratos);
    return unsubscribe;
  }, [navigation]);

  const formatarData = (data) => {
    if (!data) return 'Não definida';
    const [ano, mes, dia] = data.split('-');
    return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
  };

  const renderItem = ({ item }) => (
    <View style={[commonStyles.card, styles.item]}>
      <Text style={styles.title}>Contrato {item.id}</Text>
      <Text style={commonStyles.text}>Inquilino: {item.tenantName || item.tenantCpf}</Text>
      <Text style={commonStyles.text}>Imóvel: {item.propertyAddress}</Text>
      <Text style={commonStyles.text}>Período: {formatarData(item.dataInicio)} a {formatarData(item.dataTermino)}</Text>
      <Text style={commonStyles.text}>Valor: R$ {item.valor}</Text>
      <SecondaryButton title="Excluir" onPress={() => excluirContrato(item.id)} style={styles.deleteButton} textStyle={styles.deleteText} />
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <PageContainer>
        <PageHeader icon={FileText} title="Lista de Contratos" />
        <FlatList
          data={contratos}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum contrato cadastrado.</Text>}
          contentContainerStyle={styles.listContainer}
        />
        <SecondaryButton title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} style={styles.bottomButton} />
      </PageContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  item: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.text,
  },
  deleteButton: {
    marginTop: 14,
    backgroundColor: colors.danger,
  },
  deleteText: {
    color: '#fff',
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContainer: {
    paddingBottom: 20,
  },
  bottomButton: {
    marginTop: 18,
  },
});
