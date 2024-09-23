import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChatScreen() {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>
      <Text style={styles.subtitle}>This is the chat screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#f0f0f0' },
  title: { fontSize: 32, fontWeight: 'bold', lineHeight: 32, color: '#65558F' },
  subtitle: { fontSize: 20, fontWeight: 'bold', color: '#65558F' },
});
