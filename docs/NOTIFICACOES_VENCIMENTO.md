# Funcionalidade de Notificações de Vencimento de Aluguel

## Visão Geral

Esta funcionalidade implementa um sistema automático de notificações para alertar usuários sobre vencimentos de aluguel próximos e atrasos em pagamentos.

## Regras de Negócio

- **Notificações são enviadas apenas para pagamentos com status "pendente"**
- **Se o pagamento for marcado como "pago", nenhuma notificação é enviada**
- **Evita duplicatas**: Cada tipo de notificação é enviado apenas uma vez por pagamento
- **Datas são tratadas corretamente** considerando fuso horário (America/Sao_Paulo)

### Momentos de Notificação

1. **7 dias antes do vencimento**
2. **3 dias antes do vencimento**
3. **1 dia antes do vencimento**
4. **No dia do vencimento**
5. **Após o vencimento** (1 dia depois, indicando atraso)

## Arquitetura

### Backend (Firebase Functions)

- **Arquivo**: `functions/index.js`
- **Função**: `checkPaymentDueDates`
- **Agendamento**: Diariamente às 9h (America/Sao_Paulo)
- **Tecnologia**: Firebase Cloud Functions com Pub/Sub Scheduler

### Banco de Dados

#### Coleção: `paymentNotificationLogs`

```javascript
{
  id: string,           // ID automático do Firestore
  paymentId: string,    // ID do pagamento relacionado
  type: string,         // Tipo: '7_days', '3_days', '1_day', 'due_date', 'overdue'
  sentAt: timestamp     // Data/hora do envio
}
```

#### Coleção: `usuarios` (atualizada)

Adicionado campo:
```javascript
{
  expoPushToken: string  // Token para notificações push
}
```

### Frontend (React Native)

- **Arquivo**: `context/AuthContext.js`
- **Funcionalidade**: Registro automático do token de notificação push no login

## Fluxo de Funcionamento

1. **Agendamento Diário**: A função `checkPaymentDueDates` é executada todos os dias às 9h
2. **Busca de Pagamentos**: Busca todos os pagamentos com status "pendente"
3. **Cálculo de Datas**: Para cada pagamento, calcula a diferença em dias até o vencimento
4. **Verificação de Duplicatas**: Consulta `paymentNotificationLogs` para verificar se a notificação já foi enviada
5. **Envio de Notificação**: Se não foi enviada, envia push notification via FCM
6. **Registro do Log**: Salva o envio no `paymentNotificationLogs`

## Instalação e Configuração

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login no Firebase
```bash
firebase login
```

### 3. Inicializar/Conectar ao Projeto
```bash
firebase use --add
# Selecione seu projeto Firebase
```

### 4. Implantar Functions
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### 5. Atualizar Firestore Rules
```bash
firebase deploy --only firestore:rules
```

## Testes

### Teste Manual
Para testar a função localmente:

```bash
cd functions
npm run serve
```

### Verificação de Logs
```bash
firebase functions:log
```

## Canais de Notificação

Atualmente implementado:
- **Push Notifications** via Firebase Cloud Messaging (FCM) usando Expo tokens

Possíveis expansões futuras:
- Email
- SMS
- Notificações in-app

## Considerações Técnicas

- **Idempotência**: Garantida pela verificação de logs existentes
- **Performance**: Busca otimizada com índices no Firestore
- **Fuso Horário**: Configurado para America/Sao_Paulo
- **Tratamento de Erros**: Logs detalhados para debugging
- **Escalabilidade**: Função serverless escala automaticamente

## Próximos Passos

1. **Testar em produção**
2. **Adicionar mais canais de notificação** (email, SMS)
3. **Implementar notificações para inquilinos** (além de proprietários)
4. **Dashboard de notificações enviadas**
5. **Configurações personalizáveis** por usuário

---

## Testes e Validação

### 1. Teste Local com Firebase Emulator

#### Configuração do Emulator
```bash
# Instalar Firebase CLI (se não tiver)
npm install -g firebase-tools

# Login no Firebase
firebase login

# Conectar ao projeto
firebase use --add
# Selecione seu projeto Firebase

# Iniciar emuladores
firebase emulators:start --only functions,firestore
```

#### Teste da Função
```bash
# No terminal, executar a função manualmente
curl -X POST http://localhost:5001/YOUR_PROJECT_ID/us-central1/checkPaymentDueDates
```

### 2. Script de Teste Automático

Criei um script para facilitar os testes:

**Arquivo**: `scripts/test-notifications.js`

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json'); // Baixe do Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'YOUR_PROJECT_ID'
});

const db = admin.firestore();

async function createTestData() {
  console.log('Criando dados de teste...');

  // Criar usuário de teste
  const userRef = db.collection('usuarios').doc('test-user-id');
  await userRef.set({
    email: 'teste@exemplo.com',
    role: 'usuario',
    expoPushToken: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' // Token de teste
  });

  // Criar contrato de teste
  const contractRef = db.collection('contratos').doc('test-contract-id');
  await contractRef.set({
    userId: 'test-user-id',
    valor: 1500,
    status: 'ativo',
    dataInicio: '2024-01-01',
    dataTermino: '2024-12-31'
  });

  // Criar pagamentos de teste com diferentes datas
  const today = new Date();
  const payments = [
    {
      contract_id: 'test-contract-id',
      dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias
      status: 'pendente',
      amount: 1500
    },
    {
      contract_id: 'test-contract-id',
      dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dias
      status: 'pendente',
      amount: 1500
    },
    {
      contract_id: 'test-contract-id',
      dueDate: today.toISOString().split('T')[0], // Hoje
      status: 'pendente',
      amount: 1500
    },
    {
      contract_id: 'test-contract-id',
      dueDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Ontem (atrasado)
      status: 'pendente',
      amount: 1500
    }
  ];

  for (const payment of payments) {
    await db.collection('pagamentos').add(payment);
  }

  console.log('Dados de teste criados!');
}

async function runNotificationCheck() {
  console.log('Executando verificação de notificações...');

  const { checkPaymentDueDates } = require('../functions/index');

  try {
    await checkPaymentDueDates();
    console.log('Verificação concluída!');
  } catch (error) {
    console.error('Erro na verificação:', error);
  }
}

async function checkLogs() {
  console.log('Verificando logs de notificações...');

  const logs = await db.collection('paymentNotificationLogs').get();
  logs.forEach(doc => {
    console.log('Log:', doc.id, doc.data());
  });
}

async function cleanup() {
  console.log('Limpando dados de teste...');

  // Limpar dados de teste
  const collections = ['usuarios', 'contratos', 'pagamentos', 'paymentNotificationLogs'];

  for (const collection of collections) {
    const snapshot = await db.collection(collection).where('__test__', '==', true).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }

  console.log('Limpeza concluída!');
}

// Executar testes
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'setup':
      await createTestData();
      break;
    case 'run':
      await runNotificationCheck();
      break;
    case 'logs':
      await checkLogs();
      break;
    case 'cleanup':
      await cleanup();
      break;
    default:
      console.log('Comandos disponíveis: setup, run, logs, cleanup');
  }
}

main().catch(console.error);
```

#### Como usar o script:
```bash
# 1. Baixar service account key do Firebase Console
# 2. Renomear para firebase-service-account.json na raiz do projeto
# 3. Criar dados de teste
node scripts/test-notifications.js setup

# 4. Executar verificação
node scripts/test-notifications.js run

# 5. Verificar logs
node scripts/test-notifications.js logs

# 6. Limpar dados de teste
node scripts/test-notifications.js cleanup
```

### 3. Teste Manual no App

#### Preparar Dados de Teste
1. **Criar usuário de teste** no Firebase Auth
2. **Fazer login** no app para registrar o token FCM
3. **Criar contrato** via interface admin
4. **Criar pagamentos** com datas específicas:
   - Um vencendo em 7 dias
   - Um vencendo em 3 dias
   - Um vencendo hoje
   - Um vencendo ontem (atrasado)

#### Executar Teste
```bash
# No emulador ou produção
firebase functions:shell
> checkPaymentDueDates()
```

#### Verificar Resultados
1. **Logs do Firebase Functions**:
   ```bash
   firebase functions:log --only checkPaymentDueDates
   ```

2. **Coleção `paymentNotificationLogs`** no Firestore:
   - Deve conter entradas para cada notificação enviada
   - Campos: `paymentId`, `type`, `sentAt`

3. **Notificações no dispositivo**:
   - Verificar se recebeu push notifications
   - No Expo Go: notificações aparecem automaticamente

### 4. Testes Automatizados

#### Teste Unitário
**Arquivo**: `functions/test/index.test.js`

```javascript
const { expect } = require('chai');
const admin = require('firebase-admin');
const { checkPaymentDueDates } = require('../index');

describe('Notification System', () => {
  before(async () => {
    // Configurar Firestore de teste
    const testDb = admin.firestore();
    // ... setup test data
  });

  it('should send notifications for due payments', async () => {
    await checkPaymentDueDates();
    
    // Verificar se notificações foram enviadas
    const logs = await admin.firestore()
      .collection('paymentNotificationLogs')
      .get();
    
    expect(logs.size).to.be.greaterThan(0);
  });

  it('should not send duplicate notifications', async () => {
    // Executar duas vezes
    await checkPaymentDueDates();
    await checkPaymentDueDates();
    
    // Verificar contagem de logs
    const logs = await admin.firestore()
      .collection('paymentNotificationLogs')
      .get();
    
    // Deve ter apenas uma entrada por tipo de notificação
    const types = logs.docs.map(doc => doc.data().type);
    const uniqueTypes = [...new Set(types)];
    expect(types.length).to.equal(uniqueTypes.length);
  });
});
```

#### Executar Testes
```bash
cd functions
npm test
```

### 5. Validação em Produção

#### Monitoramento
```bash
# Ver logs em tempo real
firebase functions:log --only checkPaymentDueDates --open

# Verificar métricas
firebase functions:list
```

#### Dashboard de Notificações
Para visualizar notificações enviadas, criei uma tela simples:

**Arquivo**: `screens/NotificacoesLogScreen.js`

```javascript
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { db } from '../db/db';

export default function NotificacoesLogScreen() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const unsubscribe = db.collection('paymentNotificationLogs')
      .orderBy('sentAt', 'desc')
      .onSnapshot(snapshot => {
        const logsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLogs(logsData);
      });

    return unsubscribe;
  }, []);

  const renderLog = ({ item }) => (
    <View style={{ padding: 10, borderBottomWidth: 1 }}>
      <Text>Tipo: {item.type}</Text>
      <Text>Pagamento: {item.paymentId}</Text>
      <Text>Enviado: {item.sentAt?.toDate().toLocaleString()}</Text>
    </View>
  );

  return (
    <View>
      <Text>Log de Notificações</Text>
      <FlatList
        data={logs}
        renderItem={renderLog}
        keyExtractor={item => item.id}
      />
    </View>
  );
}
```

### 6. Cenários de Teste

| Cenário | Dados de Teste | Resultado Esperado |
|---------|---------------|-------------------|
| **7 dias antes** | `dueDate = hoje + 7 dias` | Notificação "7_days" enviada |
| **3 dias antes** | `dueDate = hoje + 3 dias` | Notificação "3_days" enviada |
| **1 dia antes** | `dueDate = hoje + 1 dia` | Notificação "1_day" enviada |
| **Dia do vencimento** | `dueDate = hoje` | Notificação "due_date" enviada |
| **Atrasado** | `dueDate = ontem` | Notificação "overdue" enviada |
| **Pago** | `status = "pago"` | Nenhuma notificação |
| **Duplicata** | Executar função 2x | Apenas 1 log por tipo |

### 7. Troubleshooting

#### Problemas Comuns

**1. Notificações não chegam**
```bash
# Verificar token FCM
firebase firestore:query "collection('usuarios').where('expoPushToken', '!=', null)"

# Verificar logs de erro
firebase functions:log --filter="ERROR"
```

**2. Função não executa**
```bash
# Verificar status da função
firebase functions:list

# Verificar agendamento
firebase functions:config:get
```

**3. Dados incorretos**
```bash
# Verificar estrutura dos dados
firebase firestore:query "collection('pagamentos').limit(5)"

# Verificar contratos
firebase firestore:query "collection('contratos').limit(5)"
```

#### Debug Mode
Adicione logs temporários na função:
```javascript
console.log('Debug - Pagamentos encontrados:', payments.length);
console.log('Debug - Hoje:', today.toISOString());
console.log('Debug - Diferença de dias:', diffDays);
```

### 8. Checklist de Validação

- [ ] Firebase Functions implantadas
- [ ] Emuladores funcionando
- [ ] Dados de teste criados
- [ ] Função executa sem erros
- [ ] Logs criados corretamente
- [ ] Notificações push recebidas
- [ ] Sem duplicatas
- [ ] Fuso horário correto
- [ ] Apenas pagamentos pendentes notificam