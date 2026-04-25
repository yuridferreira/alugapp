import { collection, addDoc, doc, setDoc, getDoc, getDocs, query, where, onSnapshot } from 'firebase/firestore';
import { db as firestoreDb } from '../../../firebaseConfig.js';

const pagamentosCollection = collection(firestoreDb, 'pagamentos');

const normalizeId = (id) => {
  if (!id) return null;
  return String(id);
};

const padNumber = (value) => String(value).padStart(2, '0');

const parseIsoDate = (value) => {
  if (!value) return null;
  const normalized = String(value).trim();
  const [year, month, day] = normalized.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

const formatDateToIso = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
};

const addMonthsSafe = (date, monthsToAdd) => {
  const baseDate = new Date(date.getTime());
  const targetDay = baseDate.getDate();
  const result = new Date(baseDate.getFullYear(), baseDate.getMonth() + monthsToAdd, 1, 12, 0, 0, 0);
  const lastDayOfMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(targetDay, lastDayOfMonth));
  return result;
};

const parseDateWithFallback = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const asIso = parseIsoDate(value);
  if (asIso) return asIso;
  const nativeDate = new Date(value);
  return Number.isNaN(nativeDate.getTime()) ? null : nativeDate;
};

const normalizePaymentStatus = (status) => {
  const raw = String(status || '').trim().toLowerCase();
  if (raw === 'paid' || raw === 'pago') return 'pago';
  if (raw === 'overdue' || raw === 'atrasado' || raw === 'atrasada') return 'atrasado';
  if (raw === 'pending' || raw === 'pendente') return 'pendente';
  return raw || 'pendente';
};

const selectPagamentoAtual = (pagamentos = []) => {
  if (!Array.isArray(pagamentos) || pagamentos.length === 0) return null;

  const today = new Date();
  const todayAtNoon = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0, 0);

  const sorted = [...pagamentos]
    .map((pagamento) => {
      const dueDate = parseDateWithFallback(pagamento.date || pagamento.data);
      return {
        ...pagamento,
        normalizedStatus: normalizePaymentStatus(pagamento.status),
        dueDate,
      };
    })
    .filter((pagamento) => pagamento.dueDate)
    .sort((a, b) => a.dueDate - b.dueDate);

  if (!sorted.length) return null;

  const overduePayment = sorted.find((pagamento) => (
    pagamento.normalizedStatus !== 'pago' && pagamento.dueDate < todayAtNoon
  ));
  if (overduePayment) return overduePayment;

  const currentMonthPayment = sorted.find((pagamento) => (
    pagamento.dueDate.getMonth() === todayAtNoon.getMonth()
      && pagamento.dueDate.getFullYear() === todayAtNoon.getFullYear()
  ));
  if (currentMonthPayment) return currentMonthPayment;

  const upcomingPayment = sorted.find((pagamento) => pagamento.dueDate >= todayAtNoon);
  if (upcomingPayment) return upcomingPayment;

  return sorted[sorted.length - 1];
};

const buildPagamentosFromPeriodo = ({ valor, dataInicio, dataTermino, userId, contract_id }) => {
  const startDate = parseIsoDate(dataInicio);
  const endDate = parseIsoDate(dataTermino);

  if (!startDate || !endDate || endDate < startDate) {
    return [];
  }

  const amount = Number(valor || 0);
  const pagamentos = [];
  let currentDate = new Date(startDate.getTime());
  let monthIndex = 0;

  while (currentDate <= endDate) {
    pagamentos.push({
      contract_id,
      userId,
      amount,
      status: 'pendente',
      method: '',
      notes: `Parcela ${monthIndex + 1}`,
      date: formatDateToIso(currentDate)
    });

    monthIndex += 1;
    currentDate = addMonthsSafe(startDate, monthIndex);
  }

  return pagamentos;
};

export const pagamentoService = {
  async savePagamento(pagamento) {
    if (!pagamento) throw new Error('Pagamento inválido');
    let resolvedUserId = pagamento.userId;
    const resolvedContractId = pagamento.contract_id || pagamento.contractId || pagamento.contrato || null;

    if (!resolvedUserId && resolvedContractId) {
      const contrato = await this.getContratoById(resolvedContractId);
      resolvedUserId = contrato?.userId || null;
    }

    const payload = {
      contract_id: resolvedContractId,
      contractId: resolvedContractId,
      userId: resolvedUserId || null,
      amount: Number(pagamento.amount || pagamento.valor || 0),
      date: pagamento.date || pagamento.data || new Date().toISOString(),
      status: pagamento.status || 'pendente',
      method: pagamento.method || pagamento.metodo || '',
      notes: pagamento.notes || pagamento.nota || '',
      updatedAt: new Date().toISOString()
    };
    if (pagamento.id) {
      const id = normalizeId(pagamento.id);
      await setDoc(doc(pagamentosCollection, id), payload, { merge: true });
      return id;
    }
    const ref = await addDoc(pagamentosCollection, payload);
    return ref.id;
  },

  async getTodosPagamentos() {
    const snap = await getDocs(pagamentosCollection);
    const arr = [];
    snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
    return arr;
  },

  async getPagamentoById(id) {
    if (!id) return null;
    const docSnap = await getDoc(doc(pagamentosCollection, normalizeId(id)));
    if (!docSnap.exists()) return null;
    const p = { id: docSnap.id, ...docSnap.data() };
    return {
      id: p.id,
      contrato: p.contract_id || null,
      contract_id: p.contract_id || null,
      valor: Number(p.amount || p.valor || 0),
      data: p.date || null,
      metodo: p.method || p.notes || null,
      raw: p
    };
  },

  async getPagamentosByContratoId(contratoId) {
    if (!contratoId) return [];
    const q = query(pagamentosCollection, where('contract_id', '==', contratoId));
    const snap = await getDocs(q);
    const arr = [];
    snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
    return arr;
  },

  subscribePagamentosByContratoId(contratoId, callback) {
    if (!contratoId) return () => {};
    const q = query(pagamentosCollection, where('contract_id', '==', contratoId));
    return onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
      callback(arr);
    });
  },

  getPagamentoAtualFromList(pagamentos) {
    return selectPagamentoAtual(pagamentos);
  },

  async getPagamentoAtualByContratoId(contratoId) {
    const pagamentos = await this.getPagamentosByContratoId(contratoId);
    return selectPagamentoAtual(pagamentos);
  },

  subscribePagamentoAtualByContratoId(contratoId, callback) {
    return this.subscribePagamentosByContratoId(contratoId, (pagamentos) => {
      callback(selectPagamentoAtual(pagamentos));
    });
  },

  buildPagamentosFromPeriodo,
};