import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

export default function AjudaScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Central de Ajuda</Text>
      <View style={{ marginTop: 20 }}>
        <Button title="Voltar para o Menu" onPress={() => navigation.navigate('Home')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22 },
});
