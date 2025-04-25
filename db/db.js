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
    const items = await AsyncStorage.multiGet(usuarioKeys);
    return items.map(([_, value]) => JSON.parse(value));
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
    const items = await AsyncStorage.multiGet(inquilinoKeys);
    return items.map(([key, value]) => JSON.parse(value));
  },

  async saveContrato(contrato) {
    const data = JSON.stringify(contrato);
    await AsyncStorage.setItem('contrato_' + contrato.id, data);
  },

  async getTodosContratos() {
    const keys = await AsyncStorage.getAllKeys();
    const contratoKeys = keys.filter(k => k.startsWith('contrato_'));
    const items = await AsyncStorage.multiGet(contratoKeys);
    return items.map(([key, value]) => JSON.parse(value));
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
    const items = await AsyncStorage.multiGet(imovelKeys);
    return items.map(([_, value]) => JSON.parse(value));
  },

  async deleteImovel(id) {
    await AsyncStorage.removeItem('imovel_' + id);
  }
};