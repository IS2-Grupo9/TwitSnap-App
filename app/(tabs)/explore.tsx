import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ExploreScreenProps {
  showSnackbar: (message: string, type: string) => void;
  targetUser: string;
  setTargetUser: (user: string) => void;
}

export default function ExploreScreen({ showSnackbar, targetUser, setTargetUser }: ExploreScreenProps) {

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore</Text>
      <Text style={styles.subtitle}>This is the explore screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30, backgroundColor: '#f0f0f0' },
  title: { fontSize: 32, fontWeight: 'bold', lineHeight: 32, color: '#65558F' },
  subtitle: { fontSize: 20, fontWeight: 'bold', color: '#65558F' },
});
