import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import db from '../db/db';

export default function HistoricoScreen() {
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    const carregarHistorico = async () => {
      try {
        await db.init();

        // 1) pegar histórico do DB (nativo: tabela history; web: keys history_*)
        let entries = [];
        try {
          const h = await db.getHistory();
          // db.getHistory retorna objetos com { id, entity, entity_id, action, date, data }
          entries = (h || []).map(row => {
            let parsed = {};
            try { parsed = typeof row.data === 'string' ? JSON.parse(row.data) : (row.data || {}); } catch (e) { parsed = {}; }
            return {
              id: row.id || `${row.entity}_${row.entity_id}_${row.date}`,
              inquilino: parsed.inquilino || parsed.tenantName || parsed.tenant || parsed.nome || parsed.name || parsed.inquilino || null,
              imovel: parsed.imovel || parsed.propertyAddress || parsed.property || parsed.endereco || parsed.address || null,
              valor: parsed.valor || parsed.rent_value || parsed.valor || parsed.amount || null,
              status: parsed.status || row.action || null,
              dataInicio: parsed.dataInicio || parsed.start_date || parsed.inicio || null,
              dataTermino: parsed.dataTermino || parsed.end_date || parsed.fim || null,
              rawDate: row.date || parsed.date || null,
              raw: parsed
            };
          });
        } catch (e) {
          // ignore DB read errors for now, we'll still try legacy
          console.warn('Erro ao ler histórico do DB:', e);
        }

        // 2) também carregar histórico legado (chave 'historico_alugueis') e mesclar para compatibilidade
        try {
          const dados = await AsyncStorage.getItem('historico_alugueis');
          const listaLegada = dados ? JSON.parse(dados) : [];
          const formatoLegado = (listaLegada || []).map(item => ({
            id: item.id || `legacy_${item.inquilino || ''}_${item.imovel || ''}_${item.dataTermino || item.dataInicio || ''}`,
            inquilino: item.inquilino,
            imovel: item.imovel,
            valor: item.valor,
            status: item.status,
            dataInicio: item.dataInicio || item.inicio || null,
            dataTermino: item.dataTermino || item.fim || null,
            rawDate: null,
            raw: item
          }));

          // merge sem duplicação (por id)
          const seen = new Set(entries.map(e => String(e.id)));
          for (const it of formatoLegado) {
            if (!seen.has(String(it.id))) {
              entries.push(it);
              seen.add(String(it.id));
            }
          }
        } catch (e) {
          console.warn('Erro ao ler histórico legado:', e);
        }

        // ordenar por data se disponível (desc), senão manter ordem
        entries.sort((a, b) => {
          const da = a.rawDate || a.raw?.date || '';
          const dbd = b.rawDate || b.raw?.date || '';
          return (dbd || '').localeCompare(da || '');
        });

        setHistorico(entries);
      } catch (err) {
        console.error('Erro ao carregar histórico:', err);
      }
    };
    carregarHistorico();
  }, []);

  // Formata data no formato DD/MM/YYYY
  const formatarData = (data) => {
    if (!data) return '';
    try {
      if (data.includes('-')) {
        const [ano, mes, dia] = data.split('-');
        return `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`;
      }
    } catch (e) { /* ignore */ }
    return data;
  };

  const renderItem = ({ item }) => {
    const dataInicioRaw = item.dataInicio || item.raw?.start_date || item.raw?.dataInicio;
    const dataTerminoRaw = item.dataTermino || item.raw?.end_date || item.raw?.dataTermino;

    return (
      <View style={styles.item}>
        <Text style={styles.label}>Contrato #{item.id}</Text>
        <Text>Inquilino: {item.inquilino || '—'}</Text>
        <Text>Imóvel: {item.imovel || '—'}</Text>
        <Text>Valor: R$ {item.valor ? Number(item.valor).toFixed(2) : '—'}</Text>
        <Text>Status: {item.status || '—'}</Text>
        <Text>Data de Início: {dataInicioRaw ? formatarData(String(dataInicioRaw)) : 'Não definida'}</Text>
        <Text>Data de Término: {dataTerminoRaw ? formatarData(String(dataTerminoRaw)) : 'Não definida'}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Aluguéis</Text>
      <FlatList
        data={historico}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, marginBottom: 20, textAlign: 'center' },
  item: { backgroundColor: '#f1f1f1', padding: 15, borderRadius: 8, marginBottom: 15 },
  label: { fontWeight: 'bold', marginBottom: 5 },
});
