import { collection, addDoc, doc, setDoc, getDoc, getDocs, query, where, orderBy, deleteDoc } from 'firebase/firestore';
import { db as firestoreDb } from '../firebaseConfig';

const usuariosCollection = collection(firestoreDb, 'usuarios');
const inquilinosCollection = collection(firestoreDb, 'inquilinos');
const imoveisCollection = collection(firestoreDb, 'imoveis');
const contratosCollection = collection(firestoreDb, 'contratos');
const pagamentosCollection = collection(firestoreDb, 'pagamentos');
const historicoCollection = collection(firestoreDb, 'historico');

const normalizeId = (id) => {
  if (!id) return null;
  return String(id);
};

export const db = {
  async init() {
    return;
  },

  async saveUsuario(usuario) {
    if (!usuario) throw new Error('Usuário inválido');
    const id = normalizeId(usuario.uid || usuario.id || usuario.email);
    if (!id) throw new Error('Usuário precisa de id/email');
    const payload = {
      name: usuario.name || usuario.nome || '',
      email: (usuario.email || '').toLowerCase(),
      role: usuario.role || 'user',
      password: usuario.password || usuario.senha || null,
      meta: usuario.meta || {}
    };
    await setDoc(doc(usuariosCollection, id), payload, { merge: true });
  },

  async getTodosUsuarios() {
    const snap = await getDocs(usuariosCollection);
    const arr = [];
    snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
    return arr;
  },

  async getUsuarioByEmail(email) {
    if (!email) return null;
    const q = query(usuariosCollection, where('email', '==', email.toLowerCase()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  },

  async authUsuario(email, senha) {
    if (!email || !senha) throw new Error('Email e senha são obrigatórios');
    const user = await this.getUsuarioByEmail(email);
    if (!user) throw new Error('Usuário não encontrado');
    if (!user.password || user.password !== senha) throw new Error('Senha incorreta');
    return user;
  },

  async deleteUsuario(email) {
    if (!email) return;
    const user = await this.getUsuarioByEmail(email);
    if (!user) return;
    await deleteDoc(doc(usuariosCollection, user.id));
  },

  async saveInquilino(inquilino) {
    if (!inquilino) throw new Error('Inquilino inválido');
    const payload = {
      name: inquilino.name || inquilino.nome || '',
      cpf: inquilino.cpf || '',
      phone: inquilino.phone || inquilino.telefone || '',
      email: inquilino.email || '',
      meta: inquilino.meta || {}
    };
    const id = normalizeId(inquilino.id || inquilino.cpf);
    if (id) {
      await setDoc(doc(inquilinosCollection, id), payload, { merge: true });
      return id;
    }
    const ref = await addDoc(inquilinosCollection, payload);
    return ref.id;
  },

  async getTodosInquilinos() {
    const snap = await getDocs(inquilinosCollection);
    const arr = [];
    snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
    return arr;
  },

  async deleteInquilino(cpfOrId) {
    if (!cpfOrId) return;
    const id = normalizeId(cpfOrId);
    const ref = doc(inquilinosCollection, id);
    const snapshot = await getDoc(ref);
    if (snapshot.exists()) {
      await deleteDoc(ref);
      return;
    }
    const q = query(inquilinosCollection, where('cpf', '==', String(cpfOrId)));
    const snap = await getDocs(q);
    snap.forEach(d => deleteDoc(doc(inquilinosCollection, d.id)));
  },

  async getInquilinoByCpf(cpf) {
    if (!cpf) return null;
    const q = query(inquilinosCollection, where('cpf', '==', String(cpf)));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    return { id: docSnap.id, ...docSnap.data() };
  },

  async getInquilinoById(id) {
    if (!id) return null;
    const docSnap = await getDoc(doc(inquilinosCollection, normalizeId(id)));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  },

  async saveImovel(imovel) {
    if (!imovel) throw new Error('Imóvel inválido');
    const payload = {
      title: imovel.title || imovel.tipo || imovel.endereco || '',
      address: imovel.address || imovel.endereco || '',
      tipo: imovel.tipo || '',
      andar: imovel.andar || '',
      completo: imovel.completo || '',
      torre: imovel.torre || '',
      rent_value: imovel.rent_value || imovel.valor || 0,
      meta: imovel.meta || {}
    };
    if (imovel.id) {
      const id = normalizeId(imovel.id);
      await setDoc(doc(imoveisCollection, id), payload, { merge: true });
      return id;
    }
    const ref = await addDoc(imoveisCollection, payload);
    return ref.id;
  },

  async getTodosImoveis() {
    const snap = await getDocs(imoveisCollection);
    const arr = [];
    snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
    return arr;
  },

  async deleteImovel(id) {
    if (!id) return;
    await deleteDoc(doc(imoveisCollection, normalizeId(id)));
  },

  async getImovelById(id) {
    if (!id) return null;
    const docSnap = await getDoc(doc(imoveisCollection, normalizeId(id)));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  },

  async saveContrato(contrato) {
    if (!contrato) throw new Error('Contrato inválido');
    const payload = {
      inquilino: contrato.inquilino || contrato.tenant_id || contrato.tenant || '',
      imovel: contrato.imovel || contrato.property_id || contrato.property || '',
      valor: Number(contrato.valor || contrato.rent_value || contrato.amount || 0),
      status: contrato.status || 'ativo',
      dataInicio: contrato.dataInicio || contrato.start_date || contrato.inicio || '',
      dataTermino: contrato.dataTermino || contrato.end_date || contrato.fim || '',
      tenant_id: contrato.tenant_id || contrato.inquilino || null,
      property_id: contrato.property_id || contrato.imovel || null,
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
      meta: data.meta || {}
    };
  },

  async deleteContrato(id) {
    if (!id) return;
    await deleteDoc(doc(contratosCollection, normalizeId(id)));
  },

  async savePagamento(pagamento) {
    if (!pagamento) throw new Error('Pagamento inválido');
    const payload = {
      contract_id: pagamento.contract_id || pagamento.contrato || null,
      amount: Number(pagamento.amount || pagamento.valor || 0),
      date: pagamento.date || pagamento.data || new Date().toISOString(),
      method: pagamento.method || pagamento.metodo || '',
      notes: pagamento.notes || pagamento.nota || ''
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

  async addHistory(entity, entity_id, action, data = {}) {
    await addDoc(historicoCollection, {
      entity,
      entity_id: entity_id || null,
      action,
      date: new Date().toISOString(),
      data
    });
  },

  async getHistory() {
    const q = query(historicoCollection, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    const arr = [];
    snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
    return arr;
  },

  async migrateFromAsyncStorage() {
    return { migrated: 0 };
  }
};

export default db;
