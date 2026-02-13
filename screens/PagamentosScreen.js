import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert, FlatList } from 'react-native';
import db from '../db/db';

export default function PagamentosScreen({ navigation }) {
  const [contratos, setContratos] = useState([]);
  const [statusPagamentos, setStatusPagamentos] = useState({});

  // 1) Carrega contratos ativos
  useEffect(() => {
    const carregarContratos = async () => {
      await db.init();
      const listaRaw = await db.getTodosContratos();

      // build per-screen cache of tenants and properties
      const [allTenants, allProperties] = await Promise.all([db.getTodosInquilinos(), db.getTodosImoveis()]);
      const tenantsByCpf = {};
      const tenantsById = {};
      (allTenants || []).forEach(t => { tenantsByCpf[String(t.cpf)] = t; if (t.id) tenantsById[String(t.id)] = t; });
      const propertiesById = {};
      (allProperties || []).forEach(p => { if (p.id) propertiesById[String(p.id)] = p; });

      const lista = listaRaw.map(c => {
        const base = {
          id: c.id,
          inquilino: c.inquilino || c.tenant_id || null,
          imovel: c.imovel || c.property_id || null,
          valor: Number(c.valor || c.rent_value || 0),
          status: c.status || 'pendente'
        };
        let tenant = null;
        if (base.inquilino) {
          tenant = tenantsByCpf[String(base.inquilino)] || tenantsById[String(base.inquilino)] || null;
        }
        let property = null;
        if (base.imovel) property = propertiesById[String(base.imovel)] || null;
        return {
          ...base,
          tenantName: tenant?.nome || tenant?.name || null,
          tenantCpf: tenant?.cpf || null,
          propertyAddress: property?.endereco || property?.address || null,
        };
      });
      setContratos(lista);
      const estados = {};
      lista.forEach(c => { estados[c.id] = c.status || 'pendente'; });
      setStatusPagamentos(estados);
    };

    carregarContratos();
  }, []);

  // 2) Salva no histórico
  const salvarHistorico = async (contrato) => {
    try {
      await db.addHistory('contract', contrato.id, 'moved_to_history', contrato);
      return true;
    } catch (e) {
      console.warn('Erro ao salvar historico no DB:', e);
      return false;
    }
  };

  // 3) Atualiza status; se for "finalizado", move para o histórico
  const atualizarStatus = async (id, novoStatus) => {
    try {
      const idx = contratos.findIndex(c => c.id === id);
      if (idx < 0) return;

      // fetch the canonical contract from DB (normalized) to avoid stale/local-only fields
      let contratoDb = null;
      try {
        contratoDb = await db.getContratoById(id);
      } catch (e) {
        console.warn('Erro ao buscar contrato por id, usando local:', e);
        contratoDb = null;
      }

      const contrato = { ...(contratoDb || contratos[idx]), status: novoStatus };

      if (novoStatus === 'finalizado') {
        // ensure we save the canonical DB contract state into history
        const toSaveHistory = contratoDb || contrato;
        const ok = await salvarHistorico(toSaveHistory);
        if (!ok) {
          Alert.alert('Erro', 'Não foi possível salvar o histórico. Tente novamente.');
          return;
        }

        try {
          await db.deleteContrato(id);
          setContratos(prev => prev.filter(c => c.id !== id));
          setStatusPagamentos(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
          Alert.alert('Sucesso', 'Contrato movido para o histórico.');
        } catch (e) {
          console.error('Erro ao deletar contrato após salvar histórico:', e);
          Alert.alert('Erro', 'Histórico salvo, mas não foi possível remover o contrato. Verifique os logs.');
        }
      } else {
        // atualizar contrato no DB
        const current = contratoDb || contrato;
        const contratoParaSalvar = {
          id: current.id,
          // legacy fields for web storage
          inquilino: current.inquilino,
          imovel: current.imovel,
          valor: current.valor,
          dataInicio: current.dataInicio,
          dataTermino: current.dataTermino,
          status: novoStatus,
          // sqlite fields
          property_id: current.imovel,
          tenant_id: current.inquilino,
          rent_value: Number(current.valor) || 0,
          start_date: current.dataInicio,
          end_date: current.dataTermino,
        };

        await db.saveContrato(contratoParaSalvar);
        setContratos(prev => prev.map(c => c.id === id ? { ...c, status: novoStatus } : c));
        setStatusPagamentos(prev => ({ ...prev, [id]: novoStatus }));
      }
    } catch (err) {
      Alert.alert('Erro ao atualizar status');
      console.error(err);
    }
  };

  // 4) Renderiza cada item
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.label}>Contrato #{item.id}</Text>
      <Text>Inquilino: {item.inquilino}</Text>
      <Text>Imóvel: {item.imovel}</Text>
      <Text>
        Valor: R$ {typeof item.valor === 'number' && !isNaN(item.valor) ? item.valor.toFixed(2) : 'Valor inválido'}
      </Text>
      <Text>Status: {statusPagamentos[item.id] || 'pendente'}</Text>

      <View style={styles.botoes}>
        <Button title="PAGO"      color="#28a745" onPress={() => atualizarStatus(item.id, 'pago')} />
        <Button title="PENDENTE"  color="#ffc107" onPress={() => atualizarStatus(item.id, 'pendente')} />
        <Button title="ATRASADO"  color="#dc3545" onPress={() => atualizarStatus(item.id, 'atrasado')} />
        <Button title="FINALIZAR" color="#6c757d" onPress={() => atualizarStatus(item.id, 'finalizado')} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Status de Pagamentos</Text>
      <FlatList
        data={contratos}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title:     { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  item:      { backgroundColor: '#f1f1f1', padding: 15, borderRadius: 8, marginBottom: 15 },
  label:     { fontWeight: 'bold', marginBottom: 5 },
  botoes:    { flexDirection: 'row', justifyContent: 'space-around', marginTop: 10 },
});