import { collection, addDoc, doc, setDoc, getDoc, getDocs, query, where, orderBy, deleteDoc, onSnapshot } from 'firebase/firestore';
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

const normalizeEmail = (email) => {
  if (!email) return '';
  return String(email).trim().toLowerCase();
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
      nome: usuario.nome || usuario.name || '',
      email: normalizeEmail(usuario.email),
      role: usuario.role || 'usuario',
      password: usuario.password || usuario.senha || null,
      userId: id,
      criadoEm: usuario.criadoEm || usuario.createdAt || new Date().toISOString(),
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
    const q = query(usuariosCollection, where('email', '==', normalizeEmail(email)));
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

  async deleteContrato(id) {
    if (!id) return;
    const pagamentos = await this.getPagamentosByContratoId(id);
    await Promise.all(
      pagamentos.map((pagamento) => deleteDoc(doc(pagamentosCollection, normalizeId(pagamento.id))))
    );
    await deleteDoc(doc(contratosCollection, normalizeId(id)));
  },

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

  async getResumoContratoDoUsuario(userId) {
    if (!userId) return null;

    const contrato = await this.getContratoAtualDoUsuario(userId);
    if (!contrato) return null;

    const [tenant, property, pagamentoAtual] = await Promise.all([
      contrato.tenant_id || contrato.inquilino
        ? this.getInquilinoById(contrato.tenant_id || contrato.inquilino)
        : null,
      contrato.property_id || contrato.imovel
        ? this.getImovelById(contrato.property_id || contrato.imovel)
        : null,
      this.getPagamentoAtualByContratoId(contrato.id)
    ]);

    return {
      contrato: {
        id: contrato.id,
        status: contrato.status || 'ativo',
        dataInicio: contrato.dataInicio || contrato.start_date || '',
        dataTermino: contrato.dataTermino || contrato.end_date || '',
        valor: Number(contrato.valor || contrato.rent_value || 0),
        userId: contrato.userId || null,
      },
      inquilino: {
        nome: tenant?.nome || tenant?.name || contrato.inquilino || '—',
        email: tenant?.email || contrato.tenantEmail || '—',
        cpf: tenant?.cpf || '—',
      },
      imovel: {
        endereco: property?.endereco || property?.address || contrato.imovel || '—',
        tipo: property?.tipo || '—',
      },
      pagamentoAtual: pagamentoAtual ? {
        id: pagamentoAtual.id,
        status: pagamentoAtual.status || 'pendente',
        data: pagamentoAtual.date || pagamentoAtual.data || '',
        valor: Number(pagamentoAtual.amount || pagamentoAtual.valor || contrato.valor || 0),
      } : null
    };
  },

  async atualizarStatusPagamentoAtual(contratoId, novoStatus, overrides = {}) {
    if (!contratoId) throw new Error('ID do contrato é obrigatório');

    const contrato = await this.getContratoById(contratoId);
    if (!contrato) throw new Error('Contrato não encontrado');

    const pagamentos = await this.getPagamentosByContratoId(contratoId);
    const pagamentoAtual = selectPagamentoAtual(pagamentos);

    const payloadBase = {
      contract_id: contratoId,
      userId: contrato.userId || null,
      valor: contrato.valor,
      data: pagamentoAtual?.date || pagamentoAtual?.data || contrato.dataInicio || formatDateToIso(new Date()),
      status: normalizePaymentStatus(novoStatus),
      metodo: overrides.metodo || pagamentoAtual?.method || pagamentoAtual?.metodo || '',
      nota: overrides.nota || pagamentoAtual?.notes || pagamentoAtual?.nota || '',
    };

    let pagamentoId = null;
    if (pagamentoAtual?.id) {
      pagamentoId = await this.savePagamento({
        ...pagamentoAtual,
        ...payloadBase,
        id: pagamentoAtual.id
      });
    } else {
      pagamentoId = await this.savePagamento(payloadBase);
    }

    await this.saveContrato({
      ...contrato,
      status: normalizePaymentStatus(novoStatus)
    });

    return this.getPagamentoById(pagamentoId);
  },

  // ========== NOVAS FUNÇÕES PARA VÍNCULO AUTOMÁTICO ==========

  /**
   * Função para vincular automaticamente um contrato a um usuário pelo email do inquilino
   * @param {Object} contrato - Dados do contrato (sem userId)
   * @param {string} emailInquilino - Email do usuário/inquilino
   * @returns {Promise<{id: string, userId: string}>} - ID do contrato e userID vinculado
   */
  async saveContratoComVinculoUsuario(contrato, emailInquilino) {
    if (!contrato) throw new Error('Contrato inválido');
    if (!emailInquilino) throw new Error('Email do inquilino é obrigatório para vincular ao contrato');

    // 1. Buscar usuário pelo email
    const normalizedEmail = normalizeEmail(emailInquilino);
    const usuario = await this.getUsuarioByEmail(normalizedEmail);
    if (!usuario) {
      throw new Error(`Usuário com email "${normalizedEmail}" não encontrado. Cadastre o usuário antes de criar o contrato.`);
    }

    const tenantRef = contrato.tenant_id || contrato.inquilino || null;
    if (tenantRef) {
      const inquilino = await this.getInquilinoById(tenantRef) || await this.getInquilinoByCpf(tenantRef);
      const tenantEmail = normalizeEmail(inquilino?.email);
      if (tenantEmail && tenantEmail !== normalizedEmail) {
        throw new Error('O email informado não corresponde ao inquilino selecionado.');
      }
    }

    // 2. Validar role do usuário
    if (usuario.role !== 'usuario') {
      console.warn(`⚠️ Advertência: Usuário ${emailInquilino} tem role "${usuario.role}". Esperado "usuario".`);
    }

    // 3. Salvar contrato com userId vinculado
    const contratoComUserId = {
      ...contrato,
      userId: usuario.id,
      tenantEmail: normalizedEmail
    };

    const contratoId = await this.saveContrato(contratoComUserId);

    console.log(`✓ Contrato "${contratoId}" vinculado ao usuário "${emailInquilino}" (ID: ${usuario.id})`);

    return {
      id: contratoId,
      userId: usuario.id,
      email: usuario.email,
      usuario: usuario
    };
  },

  /**
   * Busca usuário pelo email com validações
   * @param {string} email - Email do usuário
   * @returns {Promise<Object|null>} - Usuário encontrado ou null
   */
  async getUsuarioPorEmailValidado(email) {
    if (!email) throw new Error('Email é obrigatório');
    
    const usuario = await this.getUsuarioByEmail(email);
    if (!usuario) {
      throw new Error(`Usuário com email "${email}" não encontrado`);
    }

    return usuario;
  },

  /**
   * Cria um contrato com pagamentos automáticos vinculados ao usuário
   * @param {Object} contratoData - Dados do contrato
   * @param {string} emailInquilino - Email do usuário
   * @param {Array} pagamentosData - Array de pagamentos para criar
   * @returns {Promise<Object>} - Resultado com contrato e pagamentos criados
   */
  async criarContratoComPagamentosAutomaticos(contratoData, emailInquilino, pagamentosData = []) {
    if (!contratoData) throw new Error('Dados do contrato são obrigatórios');
    if (!emailInquilino) throw new Error('Email do inquilino é obrigatório');

    try {
      // 1. Vincular contrato ao usuário
      const resultadoContrato = await this.saveContratoComVinculoUsuario(contratoData, emailInquilino);

      // 2. Criar pagamentos vinculados ao contrato
      const pagamentosParaCriar = Array.isArray(pagamentosData) && pagamentosData.length > 0
        ? pagamentosData
        : buildPagamentosFromPeriodo({
            valor: contratoData.valor || contratoData.rent_value,
            dataInicio: contratoData.dataInicio || contratoData.start_date,
            dataTermino: contratoData.dataTermino || contratoData.end_date,
            userId: resultadoContrato.userId,
            contract_id: resultadoContrato.id
          });

      const pagamentosCriados = [];
      for (const pagData of pagamentosParaCriar) {
        const pagamento = {
          ...pagData,
          contract_id: resultadoContrato.id,
          userId: resultadoContrato.userId
        };
        const pagId = await this.savePagamento(pagamento);
        pagamentosCriados.push({ id: pagId, ...pagamento });
      }

      return {
        sucesso: true,
        contrato: resultadoContrato,
        pagamentos: pagamentosCriados,
        mensagem: `Contrato criado e ${pagamentosCriados.length} pagamento(s) registrado(s) com sucesso!`
      };
    } catch (error) {
      console.error('Erro ao criar contrato com pagamentos:', error);
      throw new Error(`Erro ao criar contrato: ${error.message}`);
    }
  },

  /**
   * Atualiza um contrato existente e revincula a um novo usuário se necessário
   * @param {string} contratoId - ID do contrato
   * @param {string} novoEmailInquilino - Novo email do usuário para vincular
   * @returns {Promise<Object>} - Contrato atualizado
   */
  async revincularContratoAoUsuario(contratoId, novoEmailInquilino) {
    if (!contratoId) throw new Error('ID do contrato é obrigatório');
    if (!novoEmailInquilino) throw new Error('Email do novo usuário é obrigatório');

    // 1. Buscar novo usuário
    const novoUsuario = await this.getUsuarioByEmail(novoEmailInquilino);
    if (!novoUsuario) {
      throw new Error(`Usuário com email "${novoEmailInquilino}" não encontrado`);
    }

    // 2. Atualizar contrato com novo userId
    const contratoAtual = await this.getContratoById(contratoId);
    if (!contratoAtual) {
      throw new Error(`Contrato "${contratoId}" não encontrado`);
    }

    const contratoAtualizado = {
      ...contratoAtual,
      userId: novoUsuario.id
    };

    await this.saveContrato(contratoAtualizado);

    const pagamentos = await this.getPagamentosByContratoId(contratoId);
    await Promise.all(
      pagamentos.map((pagamento) => this.savePagamento({
        ...pagamento,
        userId: novoUsuario.id,
        contract_id: contratoId
      }))
    );

    console.log(`✓ Contrato "${contratoId}" revinculado para usuário "${novoEmailInquilino}"`);

    return {
      id: contratoId,
      usuarioAnterior: contratoAtual.userId,
      usuarioNovo: novoUsuario.id,
      email: novoUsuario.email
    };
  },

  /**
   * Obtém um contrato com todos os dados relacionados (usuário, inquilino, imóvel, pagamentos)
   * @param {string} contratoId - ID do contrato
   * @returns {Promise<Object|null>} - Contrato completo com dados relacionados
   */
  async getContratoComDadosCompletos(contratoId) {
    if (!contratoId) return null;

    try {
      const contrato = await this.getContratoById(contratoId);
      if (!contrato) return null;

      // Buscar dados relacionados em paralelo
      const [usuario, inquilino, imovel, pagamentos] = await Promise.all([
        contrato.userId ? this.getUsuariobyId(contrato.userId) : null,
        contrato.inquilino ? this.getInquilinoById(contrato.inquilino) : null,
        contrato.imovel ? this.getImovelById(contrato.imovel) : null,
        this.getPagamentosByContratoId(contratoId)
      ]);

      return {
        ...contrato,
        usuarioVinculado: usuario,
        inquilinoData: inquilino,
        imovelData: imovel,
        pagamentos: pagamentos,
        totalPagamentos: pagamentos.length,
        valorTotalRecebido: pagamentos
          .filter(p => p.status?.toLowerCase() === 'pago')
          .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
      };
    } catch (error) {
      console.error('Erro ao buscar contrato com dados completos:', error);
      return null;
    }
  },

  /**
   * Lista todos os contratos de um usuário com dados relacionados
   * @param {string} userId - ID do usuário
   * @returns {Promise<Array>} - Array de contratos com dados completos
   */
  async getContratosComDadosCompletosPorUserId(userId) {
    if (!userId) return [];

    try {
      const contratos = await this.getContratosByUserId(userId);
      
      const contratosCompletos = await Promise.all(
        contratos.map(async (c) => {
          const [inquilino, imovel, pagamentos] = await Promise.all([
            c.inquilino ? this.getInquilinoById(c.inquilino) : null,
            c.imovel ? this.getImovelById(c.imovel) : null,
            this.getPagamentosByContratoId(c.id)
          ]);

          return {
            ...c,
            inquilinoData: inquilino,
            imovelData: imovel,
            pagamentos: pagamentos,
            totalPagamentos: pagamentos.length,
            valorTotalRecebido: pagamentos
              .filter(p => p.status?.toLowerCase() === 'pago')
              .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)
          };
        })
      );

      return contratosCompletos;
    } catch (error) {
      console.error('Erro ao buscar contratos com dados completos:', error);
      return [];
    }
  },

  // Método auxiliar faltante
  async getUsuariobyId(userId) {
    if (!userId) return null;
    const docSnap = await getDoc(doc(usuariosCollection, userId));
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() };
  },

  // ========== FIM DAS FUNÇÕES DE VÍNCULO ==========

  async addHistory(entity, entity_id, action, data = {}) {
    const inferredUserId = data.userId || data.usuarioId || null;
    await addDoc(historicoCollection, {
      entity,
      entity_id: entity_id || null,
      action,
      userId: inferredUserId,
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
