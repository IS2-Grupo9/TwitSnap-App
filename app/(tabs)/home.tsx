import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { useAuth } from '@/components/contexts/AuthContext';

export default function HomeScreen() {
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
  }

  return (
    <View style={styles.container}>
      <Button onPress={() => handleLogout()}>
      Logout
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30 },
});