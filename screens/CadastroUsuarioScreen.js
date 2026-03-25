import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Button, KeyboardAvoidingView, ScrollView } from 'react-native';
import { commonStyles, colors } from '../styles/commonStyles';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function CadastroUsuarioScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleCadastro = async () => {
    if (!email || !senha || !name) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    try {
      // Cria usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.toLowerCase(),
        senha
      );

      const uid = userCredential.user.uid;

      // Salva dados adicionais no Firestore
      await setDoc(doc(db, 'usuarios', uid), {
        nome: name,
        email: email.toLowerCase(),
        role: 'user',
        criadoEm: new Date()
      });

      Alert.alert('Sucesso', 'Usuário cadastrado com sucesso');

      setName('');
      setEmail('');
      setSenha('');

      navigation.goBack();

    } catch (error) {
      Alert.alert('Erro', error.message);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Cadastro de Usuário</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleCadastro}>
          <Text style={styles.buttonText}>Cadastrar</Text>
        </TouchableOpacity>
        <View style={{ marginTop: 12 }}>
          <Button title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', backgroundColor: colors.background, padding: 20 },
  title: commonStyles.title,
  input: commonStyles.input,
  button: commonStyles.button,
  buttonText: commonStyles.buttonText,
});