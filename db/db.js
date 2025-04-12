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
  }
};
