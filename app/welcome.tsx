import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, Button, StyleSheet } from 'react-native';
import { LogoHeader } from '@/components/LogoHeader';
import { ThemedView } from '@/components/ThemedView';

const Welcome = () => {
  const [token, setToken] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      const token = await AsyncStorage.getItem('token');
      setToken(token || '');
    };
    fetchToken();
    if (token) {
      router.push('/(tabs)')
    }
  }, []);

  return (
    <ThemedView style={styles.container}>
      <LogoHeader />
      <View style={styles.divider} />
      <Text style={styles.title}>Join now!</Text>
      <Button title="Create Account" onPress={() => router.push('/create-account')} />
      <View style={styles.divider} />
      <Text style={styles.subtitle}>Already have an account?</Text>
      <Button title="Log In" onPress={() => router.push('/(tabs)')} />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  subtitle: { fontSize: 16, marginBottom: 20, textAlign: 'center' },    
  divider: { borderBottomColor: 'gray', borderBottomWidth: StyleSheet.hairlineWidth },
});
  
export default Welcome;
