import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';
import { ChartBar, Activity, TrendingUp, Home, Users, FileText, Send } from 'lucide-react-native';
import db from '../db/db';
import PageContainer from '../components/PageContainer';
import SecondaryButton from '../components/SecondaryButton';
import { commonStyles } from '../styles/commonStyles';

const COLORS = {
  primary: '#1A1A2E',
  accent: '#4F8EF7',
  accentGreen: '#22C55E',
  accentYellow: '#F59E0B',
  accentRed: '#EF4444',
  card: '#FFFFFF',
  cardBorder: '#F0F4FF',
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  bg: '#F5F7FF',
};

const chartConfig = {
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(79, 142, 247, ${opacity})`,
  labelColor: () => '#6B7280',
  propsForBackgroundLines: { stroke: '#F0F4FF', strokeWidth: 1 },
  propsForLabels: { fontSize: 10 },
};

const pieChartConfig = {
  ...chartConfig,
  color: (opacity = 1) => `rgba(79, 142, 247, ${opacity})`,
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconBox, { backgroundColor: color + '18' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
}

function ChartCard({ title, children }) {
  return (
    <View style={styles.chartCard}>
      <View style={styles.chartCardHeader}>
        <View style={styles.chartCardDot} />
        <Text style={styles.chartCardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function DashboardIA({ navigation }) {
  const [input, setInput] = useState('');
  const [resposta, setResposta] = useState('');
  const [contratos, setContratos] = useState([]);
  const [imoveis, setImoveis] = useState([]);
  const [inquilinos, setInquilinos] = useState([]);
  const [contratosPorMes, setContratosPorMes] = useState(null);
  const [receitaPorMes, setReceitaPorMes] = useState(null);
  const [statusPagamentos, setStatusPagamentos] = useState(null);
  const [totalReceita, setTotalReceita] = useState(0);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    const carregarDados = async () => {
      await db.init();
      const contratosData = await db.getTodosContratos();
      const imoveisData = await db.getTodosImoveis();
      const inquilinosData = await db.getTodosInquilinos();
      setContratos(contratosData);
      setImoveis(imoveisData);
      setInquilinos(inquilinosData);

      const mesMap = {};
      const receitaMap = {};
      const statusMap = { pago: 0, pendente: 0, atrasado: 0 };
      let receita = 0;

      contratosData.forEach(c => {
        const inicio = c.dataInicio || c.start_date || c.inicio || '';
        const valorRaw = c.valor || c.rent_value || '0';
        let mes = '', ano = '';
        if (inicio.includes('/')) { [, mes, ano] = inicio.split('/'); }
        else if (inicio.includes('-')) { [ano, mes] = inicio.split('-'); }
        const mesKey = mes && ano ? `${mes}/${ano}` : 'N/A';
        mesMap[mesKey] = (mesMap[mesKey] || 0) + 1;
        const valor = parseFloat(String(valorRaw).replace(',', '.')) || 0;
        receitaMap[mesKey] = (receitaMap[mesKey] || 0) + valor;
        receita += valor;
        statusMap[c.status || 'pendente'] += 1;
      });

      setTotalReceita(receita);

      const ordenadoMeses = Object.keys(mesMap).sort((a, b) => {
        const [ma, aa] = a.split('/');
        const [mb, ab] = b.split('/');
        return new Date(`${aa}-${ma}-01`) - new Date(`${ab}-${mb}-01`);
      });

      setContratosPorMes({ labels: ordenadoMeses, datasets: [{ data: ordenadoMeses.map(m => mesMap[m]) }] });
      setReceitaPorMes({ labels: ordenadoMeses, datasets: [{ data: ordenadoMeses.map(m => receitaMap[m]) }] });
      setStatusPagamentos([
        { name: 'Pago', population: statusMap.pago, color: COLORS.accentGreen, legendFontColor: COLORS.textSecondary, legendFontSize: 13 },
        { name: 'Pendente', population: statusMap.pendente, color: COLORS.accentYellow, legendFontColor: COLORS.textSecondary, legendFontSize: 13 },
        { name: 'Atrasado', population: statusMap.atrasado, color: COLORS.accentRed, legendFontColor: COLORS.textSecondary, legendFontSize: 13 },
      ]);
    };
    carregarDados();
  }, []);

  const interpretarPergunta = (pergunta) => {
    const p = pergunta.toLowerCase();
    if (p.includes('contrato') && p.includes('quant')) return `Você tem ${contratos.length} contratos cadastrados.`;
    if (p.includes('receita') || p.includes('valor total')) {
      return `A receita total prevista é R$ ${totalReceita.toFixed(2)}.`;
    }
    if (p.includes('inquilino') && p.includes('quant')) return `Você tem ${inquilinos.length} inquilinos cadastrados.`;
    if (p.includes('imóvel') && p.includes('quant')) return `Você tem ${imoveis.length} imóveis cadastrados.`;
    if (p.includes('tipo') && p.includes('imóvel')) {
      const tipos = imoveis.map(i => i.tipo || 'Indefinido');
      const contagem = tipos.reduce((acc, tipo) => ({ ...acc, [tipo]: (acc[tipo] || 0) + 1 }), {});
      return 'Tipos: ' + Object.entries(contagem).map(([k, v]) => `${k} (${v})`).join(', ');
    }
    return 'Não entendi. Tente perguntar sobre contratos, imóveis, inquilinos ou receita.';
  };

  const handlePerguntar = () => {
    if (!input.trim()) return;
    setResposta(interpretarPergunta(input));
    setInput('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <PageContainer scrollable>
          <View onLayout={(e) => setChartWidth(e.nativeEvent.layout.width - 32)}>


          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerSub}>Visão Geral</Text>
              <Text style={styles.headerTitle}>Dashboard</Text>
            </View>
            <View style={styles.headerIconBox}>
              <ChartBar size={22} color={COLORS.accent} />
            </View>
          </View>

          {/* Stat Cards */}
          <View style={styles.statsRow}>
            <StatCard icon={FileText} label="Contratos" value={contratos.length} color={COLORS.accent} />
            <StatCard icon={Home} label="Imóveis" value={imoveis.length} color="#8B5CF6" />
          </View>
          <View style={styles.statsRow}>
            <StatCard icon={Users} label="Inquilinos" value={inquilinos.length} color="#F59E0B" />
            <StatCard icon={TrendingUp} label="Receita" value={`R$${(totalReceita / 1000).toFixed(1)}k`} color={COLORS.accentGreen} />
          </View>

          {/* Gráficos */}
          {contratosPorMes && (
            <ChartCard title="Contratos por Mês">
              <BarChart
                data={contratosPorMes}
                width={chartWidth}
                height={180}
                chartConfig={chartConfig}
                style={styles.chart}
                showValuesOnTopOfBars
                withInnerLines={false}
              />
            </ChartCard>
          )}

          {receitaPorMes && (
            <ChartCard title="Receita por Mês (R$)">
              <LineChart
                data={receitaPorMes}
                width={chartWidth}
                height={180}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`,
                  fillShadowGradient: '#22C55E',
                  fillShadowGradientOpacity: 0.15,
                }}
                bezier
                style={styles.chart}
                withInnerLines={false}
                withDots={true}
              />
            </ChartCard>
          )}

          {statusPagamentos && (
            <ChartCard title="Status dos Pagamentos">
              <PieChart
                data={statusPagamentos}
                width={chartWidth}
                height={200}
                chartConfig={pieChartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="16"
                absolute
              />
              <View style={styles.legendRow}>
                {statusPagamentos.map(item => (
                  <View key={item.name} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: item.color }]} />
                    <Text style={styles.legendText}>{item.name}: {item.population}</Text>
                  </View>
                ))}
              </View>
            </ChartCard>
          )}
            </View> 

          {/* Assistente IA */}
          <View style={styles.iaCard}>
            <View style={styles.iaHeader}>
              <View style={styles.iaIconBox}>
                <Activity size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.iaTitle}>Assistente IA</Text>
                <Text style={styles.iaSub}>Faça perguntas sobre seus dados</Text>
              </View>
            </View>

            <View style={styles.iaInputRow}>
              <TextInput
                style={styles.iaInput}
                placeholder="Ex: Quantos contratos tenho?"
                placeholderTextColor={COLORS.textSecondary}
                value={input}
                onChangeText={setInput}
                onSubmitEditing={handlePerguntar}
                returnKeyType="send"
              />
              <TouchableOpacity style={styles.iaSendBtn} onPress={handlePerguntar}>
                <Send size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {resposta !== '' && (
              <View style={styles.iaResponse}>
                <View style={styles.iaResponseDot} />
                <Text style={styles.iaResponseText}>{resposta}</Text>
              </View>
            )}
        </View>

          <SecondaryButton
            title="Voltar para o Menu"
            onPress={() => navigation.navigate('Home')}
            style={styles.bottomButton}
          />

        </PageContainer>
      </KeyboardAvoidingView>
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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginTop: 1,
  },
  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  chartCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  chartCardDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  chartCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  chart: {
    borderRadius: 12,
    alignSelf: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  iaCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    marginTop: 4,
  },
  iaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iaIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iaTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  iaSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 1,
  },
  iaInputRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  iaInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
  },
  iaSendBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iaResponse: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  iaResponseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accentGreen,
    marginTop: 4,
  },
  iaResponseText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  bottomButton: {
    marginTop: 8,
    marginBottom: 8,
  },
});