const { expect } = require('chai');
const admin = require('firebase-admin');
const sinon = require('sinon');
const { checkPaymentDueDates } = require('../index');

// Configurar Firebase para testes
const testApp = admin.initializeApp({
  projectId: 'test-project'
}, 'test-app');

const db = testApp.firestore();

describe('Sistema de Notificações de Vencimento', () => {
  let sandbox;

  before(async () => {
    sandbox = sinon.createSandbox();

    // Limpar dados de teste anteriores
    await cleanupTestData();
  });

  after(async () => {
    await cleanupTestData();
    sandbox.restore();
    await testApp.delete();
  });

  beforeEach(async () => {
    // Limpar dados entre testes
    await cleanupTestData();
  });

  async function cleanupTestData() {
    const collections = ['usuarios', 'contratos', 'pagamentos', 'paymentNotificationLogs'];

    for (const collection of collections) {
      const snapshot = await db.collection(collection).get();
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }

  async function createTestData() {
    // Criar usuário
    await db.collection('usuarios').doc('test-user').set({
      email: 'test@example.com',
      role: 'usuario',
      expoPushToken: 'test-token'
    });

    // Criar contrato
    await db.collection('contratos').doc('test-contract').set({
      userId: 'test-user',
      status: 'ativo'
    });

    // Criar pagamentos de teste
    const today = new Date();
    const payments = [
      {
        contract_id: 'test-contract',
        dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pendente'
      },
      {
        contract_id: 'test-contract',
        dueDate: today.toISOString().split('T')[0],
        status: 'pendente'
      },
      {
        contract_id: 'test-contract',
        dueDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pendente'
      }
    ];

    for (const payment of payments) {
      await db.collection('pagamentos').add(payment);
    }
  }

  it('deve enviar notificações para pagamentos próximos do vencimento', async () => {
    await createTestData();

    // Mock da função de envio de notificação
    let notificationsSent = [];
    sandbox.stub(admin, 'messaging').returns({
      send: async (payload) => {
        notificationsSent.push(payload);
        return { messageId: 'test-message-id' };
      }
    });

    // Executar função
    await checkPaymentDueDates();

    // Verificar se notificações foram "enviadas"
    expect(notificationsSent.length).to.be.greaterThan(0);

    // Verificar logs criados
    const logs = await db.collection('paymentNotificationLogs').get();
    expect(logs.size).to.equal(notificationsSent.length);
  });

  it('não deve enviar notificações duplicadas', async () => {
    await createTestData();

    let notificationsSent = [];
    sandbox.stub(admin, 'messaging').returns({
      send: async (payload) => {
        notificationsSent.push(payload);
        return { messageId: 'test-message-id' };
      }
    });

    // Executar função duas vezes
    await checkPaymentDueDates();
    await checkPaymentDueDates();

    // Verificar que não houve duplicatas
    const logs = await db.collection('paymentNotificationLogs').get();
    const types = logs.docs.map(doc => doc.data().type);
    const uniqueTypes = [...new Set(types)];

    expect(types.length).to.equal(uniqueTypes.length);
  });

  it('não deve enviar notificações para pagamentos pagos', async () => {
    // Criar pagamento pago
    await db.collection('pagamentos').add({
      contract_id: 'test-contract',
      dueDate: new Date().toISOString().split('T')[0],
      status: 'pago'
    });

    let notificationsSent = [];
    sandbox.stub(admin, 'messaging').returns({
      send: async (payload) => {
        notificationsSent.push(payload);
        return { messageId: 'test-message-id' };
      }
    });

    await checkPaymentDueDates();

    // Não deve ter enviado notificações
    expect(notificationsSent.length).to.equal(0);
  });

  it('deve calcular corretamente as diferenças de dias', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Testar diferentes cenários
    const testCases = [
      { dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), expectedType: '7_days' },
      { dueDate: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), expectedType: '3_days' },
      { dueDate: today, expectedType: 'due_date' },
      { dueDate: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000), expectedType: 'overdue' }
    ];

    for (const testCase of testCases) {
      await db.collection('pagamentos').add({
        contract_id: 'test-contract',
        dueDate: testCase.dueDate.toISOString().split('T')[0],
        status: 'pendente'
      });
    }

    let notificationsSent = [];
    sandbox.stub(admin, 'messaging').returns({
      send: async (payload) => {
        notificationsSent.push(payload);
        return { messageId: 'test-message-id' };
      }
    });

    await checkPaymentDueDates();

    // Verificar tipos de notificação enviados
    const logs = await db.collection('paymentNotificationLogs').get();
    const typesSent = logs.docs.map(doc => doc.data().type);

    expect(typesSent).to.include('7_days');
    expect(typesSent).to.include('3_days');
    expect(typesSent).to.include('due_date');
    expect(typesSent).to.include('overdue');
  });
});