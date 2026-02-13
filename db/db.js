import AsyncStorage from '@react-native-async-storage/async-storage';

export const db = {
  // -------------------------------
  // USUÁRIOS
  // -------------------------------
  async saveUsuario(usuario) {
    const key = 'usuario_' + usuario.email.toLowerCase();
    const existente = await AsyncStorage.getItem(key);
    if (existente) {
      throw new Error('Usuário já existe');
    }
    const data = JSON.stringify(usuario);
    await AsyncStorage.setItem(key, data);
  },

  async getTodosUsuarios() {
    const keys = await AsyncStorage.getAllKeys();
    const usuarioKeys = keys.filter(k => k.startsWith('usuario_'));
    if (!usuarioKeys || usuarioKeys.length === 0) return [];
    const items = await AsyncStorage.multiGet(usuarioKeys);
    return items
      .map(([_, value]) => {
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch (err) {
          console.warn('db.getTodosUsuarios: failed to parse item', err);
          return null;
        }
      })
      .filter(Boolean);
  },

  async deleteUsuario(email) {
    await AsyncStorage.removeItem('usuario_' + email.toLowerCase());
  },

  // -------------------------------
  // INQUILINOS
  // -------------------------------
  async saveInquilino(inquilino) {
    const data = JSON.stringify(inquilino);
    await AsyncStorage.setItem('inquilino_' + inquilino.cpf, data);
  },

  async getTodosInquilinos() {
    const keys = await AsyncStorage.getAllKeys();
    const inquilinoKeys = keys.filter(k => k.startsWith('inquilino_'));
    if (!inquilinoKeys || inquilinoKeys.length === 0) return [];
    const items = await AsyncStorage.multiGet(inquilinoKeys);
    return items
      .map(([_, value]) => {
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch (err) {
          console.warn('db.getTodosInquilinos: failed to parse item', err);
          return null;
        }
      })
      .filter(Boolean);
  },

  async saveContrato(contrato) {
    const data = JSON.stringify(contrato);
    await AsyncStorage.setItem('contrato_' + contrato.id, data);
  },

  async getTodosContratos() {
    const keys = await AsyncStorage.getAllKeys();
    const contratoKeys = keys.filter(k => k.startsWith('contrato_'));
    if (!contratoKeys || contratoKeys.length === 0) return [];
    const items = await AsyncStorage.multiGet(contratoKeys);
    return items
      .map(([_, value]) => {
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch (err) {
          console.warn('db.getTodosContratos: failed to parse item', err);
          return null;
        }
      })
      .filter(Boolean);
  },

  async deleteContrato(id) {
    await AsyncStorage.removeItem('contrato_' + id);
  },

  // -------------------------------
  // IMÓVEIS
  // -------------------------------
  async saveImovel(imovel) {
    const id = imovel.id || Date.now().toString();
    const data = JSON.stringify({ ...imovel, id });
    await AsyncStorage.setItem('imovel_' + id, data);
  },

  async getTodosImoveis() {
    const keys = await AsyncStorage.getAllKeys();
    const imovelKeys = keys.filter(k => k.startsWith('imovel_'));
    if (!imovelKeys || imovelKeys.length === 0) return [];
    const items = await AsyncStorage.multiGet(imovelKeys);
    return items
      .map(([_, value]) => {
        if (!value) return null;
        try {
          return JSON.parse(value);
        } catch (err) {
          console.warn('db.getTodosImoveis: failed to parse item', err);
          return null;
        }
      })
      .filter(Boolean);
  },

  async deleteImovel(id) {
    await AsyncStorage.removeItem('imovel_' + id);
  }
};