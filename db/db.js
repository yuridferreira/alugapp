import AsyncStorage from '@react-native-async-storage/async-storage';

export const db = {
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
  }
};