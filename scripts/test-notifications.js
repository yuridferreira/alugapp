const admin = require('firebase-admin');

// Para usar em produção, baixe a service account key do Firebase Console
// e coloque em firebase-service-account.json na raiz do projeto
let serviceAccount;
try {
  serviceAccount = require('../firebase-service-account.json');
} catch (error) {
  console.log('⚠️  Arquivo firebase-service-account.json não encontrado.');
  console.log('Para usar este script em produção:');
  console.log('1. Vá para Firebase Console > Project Settings > Service Accounts');
  console.log('2. Gere uma nova chave privada');
  console.log('3. Salve como firebase-service-account.json na raiz do projeto');
  console.log('4. Execute: node scripts/test-notifications.js setup');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = admin.firestore();

async function createTestData() {
  console.log('🧪 Criando dados de teste...');

  try {
    // Marcar dados como teste para facilitar limpeza
    const testFlag = { __test__: true };

    // Criar usuário de teste
    const userRef = db.collection('usuarios').doc('test-user-id');
    await userRef.set({
      ...testFlag,
      email: 'teste@exemplo.com',
      role: 'usuario',
      nome: 'Usuário de Teste',
      expoPushToken: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' // Token fictício para teste
    });
    console.log('✅ Usuário de teste criado');

    // Criar contrato de teste
    const contractRef = db.collection('contratos').doc('test-contract-id');
    await contractRef.set({
      ...testFlag,
      userId: 'test-user-id',
      valor: 1500,
      status: 'ativo',
      dataInicio: '2024-01-01',
      dataTermino: '2024-12-31',
      inquilino: 'test-tenant-id',
      imovel: 'test-property-id'
    });
    console.log('✅ Contrato de teste criado');

    // Criar pagamentos de teste com diferentes datas
    const today = new Date();
    const payments = [
      {
        ...testFlag,
        contract_id: 'test-contract-id',
        dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias
        status: 'pendente',
        amount: 1500,
        description: 'Aluguel - 7 dias para vencer'
      },
      {
        ...testFlag,
        contract_id: 'test-contract-id',
        dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dias
        status: 'pendente',
        amount: 1500,
        description: 'Aluguel - 3 dias para vencer'
      },
      {
        ...testFlag,
        contract_id: 'test-contract-id',
        dueDate: today.toISOString().split('T')[0], // Hoje
        status: 'pendente',
        amount: 1500,
        description: 'Aluguel - vence hoje'
      },
      {
        ...testFlag,
        contract_id: 'test-contract-id',
        dueDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Ontem (atrasado)
        status: 'pendente',
        amount: 1500,
        description: 'Aluguel - atrasado'
      },
      {
        ...testFlag,
        contract_id: 'test-contract-id',
        dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mesmo vencimento, mas pago
        status: 'pago',
        amount: 1500,
        description: 'Aluguel - já pago (não deve notificar)'
      }
    ];

    for (let i = 0; i < payments.length; i++) {
      const paymentRef = await db.collection('pagamentos').add(payments[i]);
      console.log(`✅ Pagamento de teste ${i + 1} criado: ${paymentRef.id}`);
    }

    console.log('🎉 Dados de teste criados com sucesso!');
    console.log('💡 Execute: node scripts/test-notifications.js run');

  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error);
  }
}

async function runNotificationCheck() {
  console.log('🚀 Executando verificação de notificações...');

  try {
    // Importar a função diretamente
    const { checkPaymentDueDates } = require('../functions/index');

    await checkPaymentDueDates();
    console.log('✅ Verificação concluída!');

    // Verificar logs criados
    await checkLogs();

  } catch (error) {
    console.error('❌ Erro na verificação:', error);
  }
}

async function checkLogs() {
  console.log('📋 Verificando logs de notificações...');

  try {
    const logsSnapshot = await db.collection('paymentNotificationLogs').get();

    if (logsSnapshot.empty) {
      console.log('📭 Nenhum log encontrado');
      return;
    }

    console.log(`📊 Total de logs: ${logsSnapshot.size}`);

    logsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`📝 Log ${doc.id}:`, {
        paymentId: data.paymentId,
        type: data.type,
        sentAt: data.sentAt?.toDate().toLocaleString('pt-BR')
      });
    });

  } catch (error) {
    console.error('❌ Erro ao verificar logs:', error);
  }
}

async function cleanup() {
  console.log('🧹 Limpando dados de teste...');

  try {
    const collections = ['usuarios', 'contratos', 'pagamentos', 'paymentNotificationLogs'];
    let totalDeleted = 0;

    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).where('__test__', '==', true).get();

      if (!snapshot.empty) {
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
          totalDeleted++;
        });
        await batch.commit();
        console.log(`✅ Removidos ${snapshot.size} documentos de ${collectionName}`);
      }
    }

    console.log(`🎉 Limpeza concluída! Total removido: ${totalDeleted} documentos`);

  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
  }
}

async function testEmulator() {
  console.log('🧪 Testando conexão com emulador...');

  try {
    // Tentar conectar ao emulador
    const testDoc = await db.collection('test').doc('connection').get();

    if (testDoc.exists) {
      console.log('✅ Conectado ao emulador Firestore');
    } else {
      console.log('✅ Firestore acessível (produção ou emulador)');
    }

    // Testar functions (se estiver rodando)
    console.log('💡 Para testar functions localmente:');
    console.log('   firebase emulators:start --only functions');
    console.log('   curl http://localhost:5001/YOUR_PROJECT_ID/us-central1/checkPaymentDueDates');

  } catch (error) {
    console.error('❌ Erro de conexão:', error);
  }
}

// Executar testes
async function main() {
  const command = process.argv[2];

  console.log('🔧 Script de Teste - Notificações de Vencimento');
  console.log('==============================================\n');

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
    case 'emulator':
      await testEmulator();
      break;
    case 'full-test':
      console.log('🧪 Executando teste completo...');
      await createTestData();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar
      await runNotificationCheck();
      await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar
      await checkLogs();
      break;
    default:
      console.log('📖 Comandos disponíveis:');
      console.log('  setup     - Criar dados de teste');
      console.log('  run       - Executar verificação de notificações');
      console.log('  logs      - Verificar logs criados');
      console.log('  cleanup   - Limpar dados de teste');
      console.log('  emulator  - Testar conexão com emulador');
      console.log('  full-test - Executar teste completo (setup + run + logs)');
      console.log('\n📋 Exemplo de uso:');
      console.log('  node scripts/test-notifications.js setup');
      console.log('  node scripts/test-notifications.js run');
      console.log('  node scripts/test-notifications.js logs');
  }
}

main().catch(console.error);