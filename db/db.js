import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Database abstraction: use expo-sqlite on native (Android/iOS) and AsyncStorage on web
const isWeb = Platform.OS === 'web';

let sqliteDb = null;
if (!isWeb) {
  sqliteDb = SQLite.openDatabase('alugapp.db');
}

function runSqlAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (isWeb) return reject(new Error('SQLite not available on web'));
    sqliteDb.transaction(
      tx => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result),
          (_, error) => {
            reject(error);
            return false;
          }
        );
      },
      err => reject(err)
    );
  });
}

export const db = {
  // Initialize DB and create tables
  async init() {
    if (isWeb) {
      // nothing to init for AsyncStorage fallback
      return;
    }

    const create = async (sql) => {
      await runSqlAsync(sql);
    };

    // Users, Tenants, Properties, Contracts, Payments, History
    await create(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT UNIQUE,
        password TEXT,
        role TEXT,
        meta TEXT
      );`
    );

    await create(
      `CREATE TABLE IF NOT EXISTS tenants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        cpf TEXT UNIQUE,
        phone TEXT,
        email TEXT,
        meta TEXT
      );`
    );

    await create(
      `CREATE TABLE IF NOT EXISTS properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        address TEXT,
        rent_value REAL,
        meta TEXT
      );`
    );

    await create(
      `CREATE TABLE IF NOT EXISTS contracts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        property_id INTEGER,
        tenant_id INTEGER,
        start_date TEXT,
        end_date TEXT,
        rent_value REAL,
        status TEXT,
        meta TEXT
      );`
    );

    await create(
      `CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract_id INTEGER,
        amount REAL,
        date TEXT,
        method TEXT,
        notes TEXT
      );`
    );

    await create(
      `CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity TEXT,
        entity_id INTEGER,
        action TEXT,
        date TEXT,
        data TEXT
      );`
    );
  },

  // --- USERS ---
  async saveUsuario(usuario) {
    if (isWeb) {
      const key = 'usuario_' + usuario.email.toLowerCase();
      const existente = await AsyncStorage.getItem(key);
      if (existente) throw new Error('Usuário já existe');
      await AsyncStorage.setItem(key, JSON.stringify(usuario));
      return;
    }

    // Upsert by email
    const existing = await runSqlAsync('SELECT id FROM users WHERE email = ?;', [usuario.email.toLowerCase()]);
    const meta = JSON.stringify(usuario.meta || {});
    if (existing.rows.length > 0) {
      const id = existing.rows.item(0).id;
      await runSqlAsync(
        'UPDATE users SET name = ?, password = ?, role = ?, meta = ? WHERE id = ?;',[usuario.name, usuario.password, usuario.role || null, meta, id]
      );
    } else {
      await runSqlAsync(
        'INSERT INTO users (name, email, password, role, meta) VALUES (?, ?, ?, ?, ?);',
        [usuario.name, usuario.email.toLowerCase(), usuario.password, usuario.role || null, meta]
      );
    }
  },

  async getTodosUsuarios() {
    if (isWeb) {
      const keys = await AsyncStorage.getAllKeys();
      const usuarioKeys = keys.filter(k => k.startsWith('usuario_'));
      if (!usuarioKeys || usuarioKeys.length === 0) return [];
      const items = await AsyncStorage.multiGet(usuarioKeys);
      return items.map(([_, value]) => (value ? JSON.parse(value) : null)).filter(Boolean);
    }

    const res = await runSqlAsync('SELECT * FROM users;');
    const arr = [];
    for (let i = 0; i < res.rows.length; i++) {
      const it = res.rows.item(i);
      try { it.meta = it.meta ? JSON.parse(it.meta) : {}; } catch (e) { it.meta = {}; }
      arr.push(it);
    }
    return arr;
  },

  async getUsuarioByEmail(email) {
    if (!email) return null;
    const key = email.toLowerCase();
    if (isWeb) {
      const data = await AsyncStorage.getItem('usuario_' + key);
      if (!data) return null;
      try { return JSON.parse(data); } catch (e) { return null; }
    }
    const res = await runSqlAsync('SELECT * FROM users WHERE email = ? LIMIT 1;', [key]);
    if (res.rows.length === 0) return null;
    const it = res.rows.item(0);
    try { it.meta = it.meta ? JSON.parse(it.meta) : {}; } catch (e) { it.meta = {}; }
    return it;
  },

  async authUsuario(email, senha) {
    if (!email || !senha) throw new Error('Email e senha são obrigatórios');
    const user = await this.getUsuarioByEmail(email);
    if (!user) throw new Error('Usuário não encontrado');
    const stored = user.password || user.senha || '';
    if (stored !== senha) throw new Error('Senha incorreta');
    return user;
  },

  async deleteUsuario(email) {
    if (isWeb) {
      await AsyncStorage.removeItem('usuario_' + email.toLowerCase());
      return;
    }
    await runSqlAsync('DELETE FROM users WHERE email = ?;', [email.toLowerCase()]);
  },

  // --- TENANTS (INQUILINOS) ---
  async saveInquilino(inquilino) {
    if (isWeb) {
      await AsyncStorage.setItem('inquilino_' + inquilino.cpf, JSON.stringify(inquilino));
      return;
    }
    const existing = await runSqlAsync('SELECT id FROM tenants WHERE cpf = ?;', [inquilino.cpf]);
    const meta = JSON.stringify(inquilino.meta || {});
    if (existing.rows.length > 0) {
      const id = existing.rows.item(0).id;
      await runSqlAsync('UPDATE tenants SET name = ?, phone = ?, email = ?, meta = ? WHERE id = ?;', [inquilino.name, inquilino.phone || null, inquilino.email || null, meta, id]);
    } else {
      await runSqlAsync('INSERT INTO tenants (name, cpf, phone, email, meta) VALUES (?, ?, ?, ?, ?);', [inquilino.name, inquilino.cpf, inquilino.phone || null, inquilino.email || null, meta]);
    }
  },

  async getTodosInquilinos() {
    if (isWeb) {
      const keys = await AsyncStorage.getAllKeys();
      const inquilinoKeys = keys.filter(k => k.startsWith('inquilino_'));
      if (!inquilinoKeys || inquilinoKeys.length === 0) return [];
      const items = await AsyncStorage.multiGet(inquilinoKeys);
      return items.map(([_, value]) => (value ? JSON.parse(value) : null)).filter(Boolean);
    }
    const res = await runSqlAsync('SELECT * FROM tenants;');
    const arr = [];
    for (let i = 0; i < res.rows.length; i++) {
      const it = res.rows.item(i);
      try { it.meta = it.meta ? JSON.parse(it.meta) : {}; } catch (e) { it.meta = {}; }
      arr.push(it);
    }
    return arr;
  },

  async deleteInquilino(cpfOrId) {
    if (isWeb) {
      await AsyncStorage.removeItem('inquilino_' + cpfOrId);
      return;
    }
    // try delete by cpf or id
    await runSqlAsync('DELETE FROM tenants WHERE cpf = ? OR id = ?;', [cpfOrId, cpfOrId]);
  },

  async getInquilinoByCpf(cpf) {
    if (!cpf) return null;
    if (isWeb) {
      const data = await AsyncStorage.getItem('inquilino_' + cpf);
      if (!data) return null;
      try { return JSON.parse(data); } catch (e) { return null; }
    }
    const res = await runSqlAsync('SELECT * FROM tenants WHERE cpf = ? LIMIT 1;', [cpf]);
    if (res.rows.length === 0) return null;
    const it = res.rows.item(0);
    try { it.meta = it.meta ? JSON.parse(it.meta) : {}; } catch (e) { it.meta = {}; }
    return it;
  },
  async getInquilinoById(id) {
    if (!id) return null;
    if (isWeb) {
      // web stores inquilinos by cpf key; try to fetch by id string
      const data = await AsyncStorage.getItem('inquilino_' + id);
      if (!data) return null;
      try { return JSON.parse(data); } catch (e) { return null; }
    }
    const res = await runSqlAsync('SELECT * FROM tenants WHERE id = ? LIMIT 1;', [id]);
    if (res.rows.length === 0) return null;
    const it = res.rows.item(0);
    try { it.meta = it.meta ? JSON.parse(it.meta) : {}; } catch (e) { it.meta = {}; }
    return it;
  },

  // --- PROPERTIES (IMÓVEIS) ---
  async saveImovel(imovel) {
    if (isWeb) {
      const id = imovel.id || Date.now().toString();
      await AsyncStorage.setItem('imovel_' + id, JSON.stringify({ ...imovel, id }));
      return;
    }
    const meta = JSON.stringify(imovel.meta || {});
    if (imovel.id) {
      await runSqlAsync('UPDATE properties SET title = ?, address = ?, rent_value = ?, meta = ? WHERE id = ?;', [imovel.title, imovel.address || null, imovel.rent_value || null, meta, imovel.id]);
    } else {
      await runSqlAsync('INSERT INTO properties (title, address, rent_value, meta) VALUES (?, ?, ?, ?);', [imovel.title, imovel.address || null, imovel.rent_value || null, meta]);
    }
  },

  async getTodosImoveis() {
    if (isWeb) {
      const keys = await AsyncStorage.getAllKeys();
      const imovelKeys = keys.filter(k => k.startsWith('imovel_'));
      if (!imovelKeys || imovelKeys.length === 0) return [];
      const items = await AsyncStorage.multiGet(imovelKeys);
      return items.map(([_, value]) => (value ? JSON.parse(value) : null)).filter(Boolean);
    }
    const res = await runSqlAsync('SELECT * FROM properties;');
    const arr = [];
    for (let i = 0; i < res.rows.length; i++) {
      const it = res.rows.item(i);
      try { it.meta = it.meta ? JSON.parse(it.meta) : {}; } catch (e) { it.meta = {}; }
      arr.push(it);
    }
    return arr;
  },

  async deleteImovel(id) {
    if (isWeb) {
      await AsyncStorage.removeItem('imovel_' + id);
      return;
    }
    await runSqlAsync('DELETE FROM properties WHERE id = ?;', [id]);
  },

  async getImovelById(id) {
    if (!id) return null;
    if (isWeb) {
      const data = await AsyncStorage.getItem('imovel_' + id);
      if (!data) return null;
      try { return JSON.parse(data); } catch (e) { return null; }
    }
    const res = await runSqlAsync('SELECT * FROM properties WHERE id = ? LIMIT 1;', [id]);
    if (res.rows.length === 0) return null;
    const it = res.rows.item(0);
    try { it.meta = it.meta ? JSON.parse(it.meta) : {}; } catch (e) { it.meta = {}; }
    return it;
  },

  // --- CONTRACTS ---
  async saveContrato(contrato) {
    if (isWeb) {
      await AsyncStorage.setItem('contrato_' + contrato.id, JSON.stringify(contrato));
      return;
    }
    const meta = JSON.stringify(contrato.meta || {});
    if (contrato.id) {
      await runSqlAsync('UPDATE contracts SET property_id = ?, tenant_id = ?, start_date = ?, end_date = ?, rent_value = ?, status = ?, meta = ? WHERE id = ?;', [contrato.property_id || null, contrato.tenant_id || null, contrato.start_date || null, contrato.end_date || null, contrato.rent_value || null, contrato.status || null, meta, contrato.id]);
    } else {
      await runSqlAsync('INSERT INTO contracts (property_id, tenant_id, start_date, end_date, rent_value, status, meta) VALUES (?, ?, ?, ?, ?, ?, ?);', [contrato.property_id || null, contrato.tenant_id || null, contrato.start_date || null, contrato.end_date || null, contrato.rent_value || null, contrato.status || null, meta]);
    }
  },

  async getTodosContratos() {
    if (isWeb) {
      const keys = await AsyncStorage.getAllKeys();
      const contratoKeys = keys.filter(k => k.startsWith('contrato_'));
      if (!contratoKeys || contratoKeys.length === 0) return [];
      const items = await AsyncStorage.multiGet(contratoKeys);
      return items.map(([_, value]) => (value ? JSON.parse(value) : null)).filter(Boolean);
    }
    const res = await runSqlAsync('SELECT * FROM contracts;');
    const arr = [];
    for (let i = 0; i < res.rows.length; i++) {
      const it = res.rows.item(i);
      try { it.meta = it.meta ? JSON.parse(it.meta) : {}; } catch (e) { it.meta = {}; }
      arr.push(it);
    }
    return arr;
  },

  async getContratoById(id) {
    if (!id) return null;
    if (isWeb) {
      const data = await AsyncStorage.getItem('contrato_' + id);
      if (!data) return null;
      try {
        const raw = JSON.parse(data);
        // normalize legacy/web object to common shape expected by screens
        return {
          id: raw.id || id,
          inquilino: raw.inquilino || raw.tenant_id || raw.tenant || raw.tenantId || raw.tenant_id || null,
          imovel: raw.imovel || raw.property_id || raw.property || raw.propertyId || null,
          valor: Number(raw.valor || raw.rent_value || raw.amount || 0),
          status: raw.status || null,
          dataInicio: raw.dataInicio || raw.start_date || raw.inicio || null,
          dataTermino: raw.dataTermino || raw.end_date || raw.fim || null,
          meta: raw.meta || {}
        };
      } catch (e) {
        return null;
      }
    }

    const res = await runSqlAsync('SELECT * FROM contracts WHERE id = ? LIMIT 1;', [id]);
    if (res.rows.length === 0) return null;
    const it = res.rows.item(0);
    try { it.meta = it.meta ? JSON.parse(it.meta) : {}; } catch (e) { it.meta = {}; }
    // normalize to legacy-friendly keys
    return {
      id: it.id,
      inquilino: it.tenant_id || it.inquilino || (it.meta && it.meta.inquilino) || null,
      imovel: it.property_id || it.imovel || (it.meta && it.meta.imovel) || null,
      valor: Number(it.rent_value || it.valor || 0),
      status: it.status || null,
      dataInicio: it.start_date || it.dataInicio || null,
      dataTermino: it.end_date || it.dataTermino || null,
      meta: it.meta || {}
    };
  },

  async deleteContrato(id) {
    if (isWeb) {
      await AsyncStorage.removeItem('contrato_' + id);
      return;
    }
    await runSqlAsync('DELETE FROM contracts WHERE id = ?;', [id]);
  },

  // --- PAYMENTS ---
  async savePagamento(pagamento) {
    if (isWeb) {
      const id = pagamento.id || Date.now().toString();
      await AsyncStorage.setItem('pagamento_' + id, JSON.stringify({ ...pagamento, id }));
      return;
    }
    if (pagamento.id) {
      await runSqlAsync('UPDATE payments SET contract_id = ?, amount = ?, date = ?, method = ?, notes = ? WHERE id = ?;', [pagamento.contract_id || null, pagamento.amount || null, pagamento.date || null, pagamento.method || null, pagamento.notes || null, pagamento.id]);
    } else {
      await runSqlAsync('INSERT INTO payments (contract_id, amount, date, method, notes) VALUES (?, ?, ?, ?, ?);', [pagamento.contract_id || null, pagamento.amount || null, pagamento.date || null, pagamento.method || null, pagamento.notes || null]);
    }
  },

  async getTodosPagamentos() {
    if (isWeb) {
      const keys = await AsyncStorage.getAllKeys();
      const pagamentoKeys = keys.filter(k => k.startsWith('pagamento_'));
      if (!pagamentoKeys || pagamentoKeys.length === 0) return [];
      const items = await AsyncStorage.multiGet(pagamentoKeys);
      return items.map(([_, value]) => (value ? JSON.parse(value) : null)).filter(Boolean);
    }
    const res = await runSqlAsync('SELECT * FROM payments;');
    const arr = [];
    for (let i = 0; i < res.rows.length; i++) arr.push(res.rows.item(i));
    return arr;
  },

  async getPagamentoById(id) {
    if (!id) return null;
    if (isWeb) {
      const data = await AsyncStorage.getItem('pagamento_' + id);
      if (!data) return null;
      try {
        const raw = JSON.parse(data);
        return {
          id: raw.id || id,
          contrato: raw.contrato || raw.contract_id || raw.contract || null,
          contract_id: raw.contract_id || raw.contrato || null,
          valor: Number(raw.valor || raw.amount || 0),
          data: raw.date || raw.data || null,
          metodo: raw.metodo || raw.method || raw.notes || null,
          raw
        };
      } catch (e) {
        return null;
      }
    }
    const res = await runSqlAsync('SELECT * FROM payments WHERE id = ? LIMIT 1;', [id]);
    if (res.rows.length === 0) return null;
    const p = res.rows.item(0);
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

  // --- HISTORY ---
  async addHistory(entity, entity_id, action, data = {}) {
    const date = new Date().toISOString();
    if (isWeb) {
      const key = `history_${Date.now()}`;
      await AsyncStorage.setItem(key, JSON.stringify({ entity, entity_id, action, date, data }));
      return;
    }
    await runSqlAsync('INSERT INTO history (entity, entity_id, action, date, data) VALUES (?, ?, ?, ?, ?);', [entity, entity_id || null, action, date, JSON.stringify(data || {})]);
  },

  async getHistory() {
    if (isWeb) {
      const keys = await AsyncStorage.getAllKeys();
      const historyKeys = keys.filter(k => k.startsWith('history_'));
      if (!historyKeys || historyKeys.length === 0) return [];
      const items = await AsyncStorage.multiGet(historyKeys);
      return items.map(([_, value]) => (value ? JSON.parse(value) : null)).filter(Boolean);
    }
    const res = await runSqlAsync('SELECT * FROM history ORDER BY date DESC;');
    const arr = [];
    for (let i = 0; i < res.rows.length; i++) arr.push(res.rows.item(i));
    return arr;
  },

  // --- MIGRATION from AsyncStorage ---
  async migrateFromAsyncStorage() {
    // Only do this on native (where SQLite is available)
    if (isWeb) return { migrated: 0 };

    const keys = await AsyncStorage.getAllKeys();
    let migrated = 0;

    const importPrefix = async (prefix, handler) => {
      const matched = keys.filter(k => k.startsWith(prefix));
      if (!matched || matched.length === 0) return;
      const items = await AsyncStorage.multiGet(matched);
      for (const [key, value] of items) {
        if (!value) continue;
        try {
          const obj = JSON.parse(value);
          await handler(obj);
          migrated++;
        } catch (e) {
          // ignore parse errors
        }
      }
    };

    await importPrefix('usuario_', async u => {
      try { await this.saveUsuario(u); } catch (e) { /* ignore duplicates */ }
    });

    await importPrefix('inquilino_', async iq => {
      try { await this.saveInquilino(iq); } catch (e) { }
    });

    await importPrefix('imovel_', async im => {
      try { await this.saveImovel(im); } catch (e) { }
    });

    await importPrefix('contrato_', async c => {
      try { await this.saveContrato(c); } catch (e) { }
    });

    await importPrefix('pagamento_', async p => {
      try { await this.savePagamento(p); } catch (e) { }
    });

    await importPrefix('history_', async h => {
      try { await runSqlAsync('INSERT INTO history (entity, entity_id, action, date, data) VALUES (?, ?, ?, ?, ?);', [h.entity, h.entity_id || null, h.action, h.date || new Date().toISOString(), JSON.stringify(h.data || {})]); } catch (e) { }
    });

    return { migrated };
  }
};

export default db;