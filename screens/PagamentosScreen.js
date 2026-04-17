import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, Alert, FlatList, StyleSheet, Platform } from 'react-native';
import { CreditCard } from 'lucide-react-native';
import db from '../db/db';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import SecondaryButton from '../components/SecondaryButton';
import { commonStyles, colors } from '../styles/commonStyles';

export default function PagamentosScreen({ navigation }) {
  const [contratos, setContratos] = useState([]);
  const [statusPagamentos, setStatusPagamentos] = useState({});

  useEffect(() => {
    const carregarContratos = async () => {
      await db.init();
      const listaRaw = await db.getTodosContratos();
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
          status: c.status || 'pendente',
        };
        const tenant = base.inquilino ? (tenantsByCpf[String(base.inquilino)] || tenantsById[String(base.inquilino)] || null) : null;
        const property = base.imovel ? propertiesById[String(base.imovel)] || null : null;
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

  const salvarHistorico = async (contrato) => {
    try {
      await db.addHistory('contract', contrato.id, 'moved_to_history', contrato);
      return true;
    } catch (e) {
      console.warn('Erro ao salvar historico no DB:', e);
      return false;
    }
  };

  const showAlert = (title, message, buttons, options) => {
    if (Platform.OS === 'web') {
      if (!message) {
        window.alert(title);
        return;
      }
      window.alert(`${title}\n\n${message}`);
      return;
    }
    Alert.alert(title, message, buttons, options);
  };

  const atualizarStatus = async (id, novoStatus) => {
    try {
      const idx = contratos.findIndex(c => c.id === id);
      if (idx < 0) return;
      let contratoDb = null;
      try { contratoDb = await db.getContratoById(id); } catch (e) { contratoDb = null; }
      const contrato = { ...(contratoDb || contratos[idx]), status: novoStatus };

      if (novoStatus === 'finalizado') {
        const ok = await salvarHistorico(contratoDb || contrato);
        if (!ok) { showAlert('Erro', 'Não foi possível salvar o histórico. Tente novamente.'); return; }
        try {
          await db.deleteContrato(id);
          setContratos(prev => prev.filter(c => c.id !== id));
          setStatusPagamentos(prev => { const copy = { ...prev }; delete copy[id]; return copy; });
          showAlert('Sucesso', 'Contrato movido para o histórico.');
        } catch (e) {
          console.error('Erro ao deletar contrato após salvar histórico:', e);
          showAlert('Erro', 'Histórico salvo, mas não foi possível remover o contrato. Verifique os logs.');
        }
      } else {
        const current = contratoDb || contrato;
        const contratoParaSalvar = {
          id: current.id,
          inquilino: current.inquilino,
          imovel: current.imovel,
          valor: current.valor,
          dataInicio: current.dataInicio,
          dataTermino: current.dataTermino,
          status: novoStatus,
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
      showAlert('Erro ao atualizar status');
      console.error(err);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[commonStyles.card, styles.item]}>
      <Text style={styles.label}>Contrato #{item.id}</Text>
      <Text style={commonStyles.text}>Inquilino: {item.inquilino}</Text>
      <Text style={commonStyles.text}>Imóvel: {item.imovel}</Text>
      <Text style={commonStyles.text}>Valor: R$ {typeof item.valor === 'number' && !isNaN(item.valor) ? item.valor.toFixed(2) : 'Valor inválido'}</Text>
      <Text style={commonStyles.text}>Status: {statusPagamentos[item.id] || 'pendente'}</Text>
      <View style={styles.rowButtons}>
        <SecondaryButton title="PAGO" onPress={() => atualizarStatus(item.id, 'Pago')} style={[styles.smallButton, { backgroundColor: '#28a745' }]} textStyle={{ color: '#fff' }} />
        <SecondaryButton title="PENDENTE" onPress={() => atualizarStatus(item.id, 'Pendente')} style={[styles.smallButton, { backgroundColor: '#f1c40f' }]} textStyle={{ color: '#111' }} />
        <SecondaryButton title="ATRASADO" onPress={() => atualizarStatus(item.id, 'Atrasado')} style={[styles.smallButton, { backgroundColor: '#e74c3c' }]} textStyle={{ color: '#fff' }} />
        <SecondaryButton title="FINALIZAR" onPress={() => atualizarStatus(item.id, 'Finalizado')} style={[styles.smallButton, { backgroundColor: '#6c757d' }]} textStyle={{ color: '#fff' }} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <PageContainer>
        <PageHeader icon={CreditCard} title="Status de Pagamentos" />
        <FlatList
          data={contratos}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.empty}>Nenhum pagamento disponível.</Text>}
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
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rowButtons: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  smallButton: {
    flex: 1,
    minWidth: 120,
    marginBottom: 8,
  },
  listContainer: {
    paddingBottom: 20,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: commonStyles.textSecondary.color,
  },
  bottomButton: {
    marginTop: 18,
  },
});
