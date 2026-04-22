const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// Função agendada para rodar diariamente às 9h
exports.checkPaymentDueDates = functions.pubsub
  .schedule('0 9 * * *') // Todos os dias às 9h
  .timeZone('America/Sao_Paulo') // Ajustar fuso horário
  .onRun(async (context) => {
    console.log('Iniciando verificação de vencimentos de pagamentos...');

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zerar horas para comparação

    try {
      // Buscar pagamentos pendentes
      const paymentsRef = db.collection('pagamentos');
      const snapshot = await paymentsRef.where('status', '==', 'pendente').get();

      if (snapshot.empty) {
        console.log('Nenhum pagamento pendente encontrado.');
        return null;
      }

      const promises = [];

      snapshot.forEach(doc => {
        const payment = { id: doc.id, ...doc.data() };
        promises.push(processPaymentNotifications(payment, today));
      });

      await Promise.all(promises);
      console.log('Verificação de vencimentos concluída.');
    } catch (error) {
      console.error('Erro ao verificar vencimentos:', error);
    }

    return null;
  });

async function processPaymentNotifications(payment, today) {
  const dueDate = new Date(payment.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const notificationTypes = {
    7: '7_days',
    3: '3_days',
    1: '1_day',
    0: 'due_date',
    '-1': 'overdue'
  };

  const type = notificationTypes[diffDays];

  if (!type) return; // Não é um dia relevante

  // Verificar se notificação já foi enviada
  const logRef = db.collection('paymentNotificationLogs');
  const existingLog = await logRef
    .where('paymentId', '==', payment.id)
    .where('type', '==', type)
    .limit(1)
    .get();

  if (!existingLog.empty) {
    console.log(`Notificação ${type} já enviada para pagamento ${payment.id}`);
    return;
  }

  // Enviar notificação
  await sendNotification(payment, type);

  // Registrar no log
  await logRef.add({
    paymentId: payment.id,
    type: type,
    sentAt: admin.firestore.FieldValue.serverTimestamp()
  });

  console.log(`Notificação ${type} enviada para pagamento ${payment.id}`);
}

async function sendNotification(payment, type) {
  // Buscar contrato para obter userId
  const contractRef = db.collection('contratos').doc(payment.contract_id);
  const contractSnap = await contractRef.get();
  if (!contractSnap.exists) return;

  const contract = contractSnap.data();
  const userId = contract.userId;
  if (!userId) return;

  // Buscar token do usuário
  const userRef = db.collection('usuarios').doc(userId);
  const userSnap = await userRef.get();
  if (!userSnap.exists) return;

  const user = userSnap.data();
  const token = user.expoPushToken;
  if (!token) return;

  const messages = {
    '7_days': `Lembrete: O aluguel vence em 7 dias (${payment.dueDate}).`,
    '3_days': `Lembrete: O aluguel vence em 3 dias (${payment.dueDate}).`,
    '1_day': `Lembrete: O aluguel vence amanhã (${payment.dueDate}).`,
    'due_date': `Atenção: O aluguel vence hoje (${payment.dueDate}).`,
    'overdue': `Atraso: O aluguel venceu em ${payment.dueDate} e ainda não foi pago.`
  };

  const message = messages[type];

  const payload = {
    token: token,
    notification: {
      title: 'Notificação de Aluguel',
      body: message
    },
    data: {
      paymentId: payment.id,
      type: type
    }
  };

  try {
    await admin.messaging().send(payload);
    console.log(`Notificação enviada para usuário ${userId}: ${message}`);
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
}