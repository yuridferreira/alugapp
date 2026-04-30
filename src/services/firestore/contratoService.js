import { collection, addDoc, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db as firestoreDb } from '../../../firebaseConfig.js';

const contratosCollection = collection(firestoreDb, 'contratos');

const normalizeId = (id) => {
  if (!id) return null;
  return String(id);
};

const normalizeEmail = (email) => {
  if (!email) return '';
  return String(email).trim().toLowerCase();
};

export const contratoService = {
  async saveContrato(contrato) {
    if (!contrato) throw new Error('Contrato inválido');
    let resolvedUserId = contrato.userId;
    if (contrato.id && typeof resolvedUserId === 'undefined') {
      const existing = await this.getContratoById(contrato.id);
      resolvedUserId = existing?.userId || null;
    }
    const payload = {
      inquilino: contrato.inquilino || contrato.tenant_id || contrato.tenant || '',
      imovel: contrato.imovel || contrato.property_id || contrato.property || '',
      valor: Number(contrato.valor || contrato.rent_value || contrato.amount || 0),
      status: contrato.status || 'ativo',
      dataInicio: contrato.dataInicio || contrato.start_date || contrato.inicio || '',
      dataTermino: contrato.dataTermino || contrato.end_date || contrato.fim || '',
      tenant_id: contrato.tenant_id || contrato.inquilino || null,
      property_id: contrato.property_id || contrato.imovel || null,
      userId: resolvedUserId || null,
      tenantEmail: normalizeEmail(contrato.tenantEmail || contrato.emailInquilino || contrato.email || ''),
      updatedAt: new Date().toISOString(),
      meta: contrato.meta || {}
    };
    if (contrato.id) {
      const id = normalizeId(contrato.id);
      await setDoc(doc(contratosCollection, id), payload, { merge: true });
      return id;
    }
    const ref = await addDoc(contratosCollection, payload);
    return ref.id;
  },

  async getTodosContratos() {
    const snap = await getDocs(contratosCollection);
    const arr = [];
    snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
    return arr;
  },

  async getContratosByUserId(userId) {
    if (!userId) return [];
    const q = query(contratosCollection, where('userId', '==', userId));
    const snap = await getDocs(q);
    const arr = [];
    snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
    return arr;
  },

  async getContratoAtualDoUsuario(userId) {
    const contratos = await this.getContratosByUserId(userId);
    if (!contratos.length) return null;
    return contratos[0];
  },

  async getContratoById(id) {
    if (!id) return null;
    const docSnap = await getDoc(doc(contratosCollection, normalizeId(id)));
    if (!docSnap.exists()) return null;
    const data = { id: docSnap.id, ...docSnap.data() };
    return {
      id: data.id,
      inquilino: data.inquilino || data.tenant_id || null,
      imovel: data.imovel || data.property_id || null,
      valor: Number(data.valor || data.rent_value || 0),
      status: data.status || 'ativo',
      dataInicio: data.dataInicio || data.start_date || '',
      dataTermino: data.dataTermino || data.end_date || '',
      userId: data.userId || null,
      meta: data.meta || {}
    };
  },
};