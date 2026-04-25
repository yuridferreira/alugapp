import { collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db as firestoreDb } from '../../../firebaseConfig.js';

const usuariosCollection = collection(firestoreDb, 'usuarios');

const normalizeId = (id) => {
  if (!id) return null;
  return String(id);
};

const normalizeEmail = (email) => {
  if (!email) return '';
  return String(email).trim().toLowerCase();
};

export const userService = {
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

  async getUsuario(id) {
    if (!id) return null;
    const docRef = doc(usuariosCollection, normalizeId(id));
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async getTodosUsuarios() {
    const querySnapshot = await getDocs(usuariosCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getUsuariosPorRole(role) {
    const q = query(usuariosCollection, where('role', '==', role));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },
};