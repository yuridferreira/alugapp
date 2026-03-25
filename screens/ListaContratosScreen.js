import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, Platform, SafeAreaView } from 'react-native';
import db from '../db/db';

export default function ListaContratosScreen({ navigation }) {
  const [contratos, setContratos] = useState([]);

  const carregarContratos = async () => {
    try {
      await db.init();
      const listaRaw = await db.getTodosContratos();

      // load tenants and properties once and build lookup maps (cache per screen)
      const [allTenants, allProperties] = await Promise.all([db.getTodosInquilinos(), db.getTodosImoveis()]);
      const tenantsByCpf = {};
      const tenantsById = {};
      (allTenants || []).forEach(t => { tenantsByCpf[String(t.cpf)] = t; if (t.id) tenantsById[String(t.id)] = t; });
      const propertiesById = {};
      (allProperties || []).forEach(p => { if (p.id) propertiesById[String(p.id)] = p; });

      const lista = listaRaw.map(item => ({
        id: item.id || item.id,
        inquilino: item.inquilino || item.tenant_id || item.tenant || item.inquilino,
        imovel: item.imovel || item.property_id || item.imovel,
        dataInicio: item.dataInicio || item.start_date || item.dataInicio,
        dataTermino: item.dataTermino || item.end_date || item.dataTermino,
        valor: item.valor || item.rent_value || item.valor,
        status: item.status || 'ativo'
      }));

      const enriched = lista.map(it => {
        let tenant = null;
        if (it.inquilino) {
          tenant = tenantsByCpf[String(it.inquilino)] || tenantsById[String(it.inquilino)] || null;
        }
        const property = it.imovel ? propertiesById[String(it.imovel)] : null;
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
    // fetch canonical contract to show more context in confirmation
    let contrato = null;
    try {
      contrato = await db.getContratoById(id);
    } catch (e) {
      console.warn('Erro ao buscar contrato para exclusão:', e);
      contrato = null;
    }

    const confirmMessage = contrato ? `Deseja excluir o contrato #${id}\nInquilino: ${contrato.inquilino || contrato.tenantName || '—'}\nImóvel: ${contrato.imovel || contrato.propertyAddress || '—'}` : 'Deseja excluir este contrato?';

    const execute = async () => {
      try {
        await db.deleteContrato(id);
        setContratos(prev => prev.filter(c => c.id !== id));
        console.log(`Contrato ${id} excluído com sucesso.`);
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

  // Função para formatar a data para o formato DD/MM/YYYY
  const formatarData = (data) => {
    if (!data) return 'Não definida';
    const [ano, mes, dia] = data.split('-');
    return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.titulo}>Contrato {item.id}</Text>
      <Text style={styles.text}>Inquilino: {item.tenantName || item.tenantCpf}</Text>
      <Text style={styles.text}>Imóvel: {item.propertyAddress}</Text>
      <Text style={styles.text}>Período: {formatarData(item.dataInicio)} a {formatarData(item.dataTermino)}</Text>
      <Text style={styles.text}>Valor: R$ {item.valor}</Text>
      <View style={styles.botoes}>
        <Button title="Excluir" color="#d9534f" onPress={() => excluirContrato(item.id)} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>📝 Lista de Contratos</Text>
        <FlatList
          data={contratos}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.vazio}>Nenhum contrato cadastrado.</Text>}
          contentContainerStyle={styles.listContainer}
        />
        <View style={styles.fixedBottom}>
          <Button title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  item: {
    backgroundColor: '#f1f1f1', padding: 15,
    borderRadius: 8, marginBottom: 10
  },
  titulo: {
    fontSize: 18, fontWeight: 'bold'
  },
  text: {
    flexWrap: 'wrap',
    numberOfLines: 2,
    ellipsizeMode: 'tail'
  },
  botoes: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  vazio: {
    textAlign: 'center', marginTop: 40, fontSize: 16, color: '#999'
  },
  listContainer: { paddingBottom: 80 },
  fixedBottom: { position: 'absolute', bottom: 16, left: 16, right: 16 },
});