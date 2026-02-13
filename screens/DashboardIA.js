import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import db from '../db/db';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

export default function DashboardIA() {
  const [input, setInput] = useState('');
  const [resposta, setResposta] = useState('');
  const [contratos, setContratos] = useState([]);
  const [imoveis, setImoveis] = useState([]);
  const [inquilinos, setInquilinos] = useState([]);
  const [contratosPorMes, setContratosPorMes] = useState(null);
  const [receitaPorMes, setReceitaPorMes] = useState(null);
  const [imoveisMaisAlugados, setImoveisMaisAlugados] = useState(null);
  const [tiposImoveis, setTiposImoveis] = useState(null);
  const [statusPagamentos, setStatusPagamentos] = useState(null);
  const screenWidth = Dimensions.get('window').width - 40;


  const interpretarPergunta = (pergunta) => {
    const p = pergunta.toLowerCase();

    if (p.includes('contrato') && p.includes('quant')) {
      return `Você tem ${contratos.length} contratos cadastrados.`;
    }

    if ((p.includes('receita') || p.includes('valor total')) && contratos.length > 0) {
      const total = contratos.reduce((acc, c) => acc + parseFloat((c.valor || '0').replace(',', '.')), 0);
      return `A receita total prevista pelos contratos é R$ ${total.toFixed(2)}.`;
    }

    if (p.includes('inquilino') && p.includes('quant')) {
      return `Você tem ${inquilinos.length} inquilinos cadastrados.`;
    }

    if (p.includes('imóvel') && p.includes('quant')) {
      return `Você tem ${imoveis.length} imóveis cadastrados.`;
    }

    if (p.includes('tipo') && p.includes('imóvel')) {
      const tipos = imoveis.map(i => i.tipo || 'Indefinido');
      const contagem = tipos.reduce((acc, tipo) => {
        acc[tipo] = (acc[tipo] || 0) + 1;
        return acc;
      }, {});
      return 'Tipos de imóveis cadastrados: ' + Object.entries(contagem).map(([k, v]) => `${k} (${v})`).join(', ');
    }

    return 'Desculpe, não entendi sua pergunta. Tente perguntar sobre contratos, imóveis ou receita.';
  };

  useEffect(() => {
    const carregarDados = async () => {
      await db.init();
      const contratos = await db.getTodosContratos();
      const imoveis = await db.getTodosImoveis();
      const inquilinos = await db.getTodosInquilinos();
      setContratos(contratos);
      setImoveis(imoveis);
      setInquilinos(inquilinos);

      const mesMap = {};
      const receitaMap = {};
      const imovelMap = {};
      const tiposMap = {};
      const statusMap = { pago: 0, pendente: 0, atrasado: 0 };

      contratos.forEach(c => {
        // suportar formatos diferentes
        const inicio = c.dataInicio || c.start_date || c.inicio || '';
        const valorRaw = c.valor || c.rent_value || '0';
        let dia = '';
        let mes = '';
        let ano = '';
        if (inicio.includes('/')) {
          [dia, mes, ano] = inicio.split('/');
        } else if (inicio.includes('-')) {
          [ano, mes, dia] = inicio.split('-');
        }
        const mesKey = mes && ano ? `${mes}/${ano}` : 'N/A';
        mesMap[mesKey] = (mesMap[mesKey] || 0) + 1;

        const valor = parseFloat(String(valorRaw).toString().replace(',', '.')) || 0;
        receitaMap[mesKey] = (receitaMap[mesKey] || 0) + valor;

        const imovelId = c.imovel || c.property_id || c.imovel;
        imovelMap[imovelId] = (imovelMap[imovelId] || 0) + 1;
        statusMap[c.status || 'pendente'] += 1;
      });

      imoveis.forEach(i => {
        const tipo = i.tipo || 'Outro';
        tiposMap[tipo] = (tiposMap[tipo] || 0) + 1;
      });

      const ordenadoMeses = Object.keys(mesMap).sort((a, b) => {
        const [ma, aa] = a.split('/');
        const [mb, ab] = b.split('/');
        return new Date(`${aa}-${ma}-01`) - new Date(`${ab}-${mb}-01`);
      });

      setContratosPorMes({ labels: ordenadoMeses, datasets: [{ data: ordenadoMeses.map(m => mesMap[m]) }] });
      setReceitaPorMes({ labels: ordenadoMeses, datasets: [{ data: ordenadoMeses.map(m => receitaMap[m]) }] });
      setImoveisMaisAlugados({
        labels: Object.keys(imovelMap),
        datasets: [{ data: Object.values(imovelMap) }]
      });
      setTiposImoveis(Object.entries(tiposMap).map(([k, v], i) => ({
        name: k,
        population: v,
        color: chartColors[i % chartColors.length],
        legendFontColor: '#333',
        legendFontSize: 14
      })));
      setStatusPagamentos([{
        name: 'Pago', population: statusMap.pago, color: '#28a745', legendFontColor: '#333', legendFontSize: 14
      }, {
        name: 'Pendente', population: statusMap.pendente, color: '#ffc107', legendFontColor: '#333', legendFontSize: 14
      }, {
        name: 'Atrasado', population: statusMap.atrasado, color: '#dc3545', legendFontColor: '#333', legendFontSize: 14
      }]);
    };

    carregarDados();
  }, []);

  const handlePerguntar = () => {
    const respostaIA = interpretarPergunta(input);
    setResposta(respostaIA);
    setInput('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 Dashboard com IA</Text>

      {contratosPorMes && (
        <View style={styles.chartBox}>
          <Text style={styles.chartTitle}>Contratos por Mês</Text>
          <BarChart data={contratosPorMes} width={screenWidth} height={200} chartConfig={chartConfig} style={styles.chart} />
        </View>
      )}

      {receitaPorMes && (
        <View style={styles.chartBox}>
          <Text style={styles.chartTitle}>Receita por Mês</Text>
          <LineChart data={receitaPorMes} width={screenWidth} height={200} chartConfig={chartConfig} bezier style={styles.chart} />
        </View>
      )}

      {imoveisMaisAlugados && (
        <View style={styles.chartBox}>
          <Text style={styles.chartTitle}>Imóveis mais Alugados</Text>
          <BarChart data={imoveisMaisAlugados} width={screenWidth} height={200} chartConfig={chartConfig} style={styles.chart} />
        </View>
      )}

      {tiposImoveis && tiposImoveis.length > 0 && (
        <View style={styles.chartBox}>
          <Text style={styles.chartTitle}>Tipos de Imóveis</Text>
          <PieChart data={tiposImoveis} width={screenWidth} height={220} chartConfig={chartConfig} accessor="population" backgroundColor="transparent" paddingLeft="10" absolute />
        </View>
      )}

      {statusPagamentos && (
        <View style={styles.chartBox}>
          <Text style={styles.chartTitle}>Status dos Pagamentos</Text>
          <PieChart data={statusPagamentos} width={screenWidth} height={220} chartConfig={chartConfig} accessor="population" backgroundColor="transparent" paddingLeft="10" absolute />
        </View>
      )}

      <Text style={styles.title}>🤖 Assistente de IA (offline)</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite sua pergunta..."
        value={input}
        onChangeText={setInput}
      />
      <TouchableOpacity style={styles.button} onPress={handlePerguntar}>
        <Text style={styles.buttonText}>Perguntar</Text>
      </TouchableOpacity>

      {resposta !== '' && (
        <View style={styles.responseBox}>
          <Text style={styles.responseText}>{resposta}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const chartColors = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796'];

const chartConfig = {
  backgroundGradientFrom: '#ffffff',
  backgroundGradientTo: '#ffffff',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  chartBox: {
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500'
  },
  chart: {
    borderRadius: 8,
  },
  input: {
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  responseBox: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f1f1f1',
    borderRadius: 6,
    width: '100%',
  },
  responseText: {
    fontSize: 16,
  },
});
