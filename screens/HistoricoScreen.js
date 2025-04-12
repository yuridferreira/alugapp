import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HistoricoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico de Aluguéis</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22 },
});
