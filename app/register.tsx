import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, TextInput, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoHeader } from '@/components/LogoHeader';
import { ThemedView } from '@/components/ThemedView';

const Register = () => {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchToken = async () => {
      const storaged_token = await AsyncStorage.getItem('token');
      setToken(storaged_token || '');
    };
    fetchToken();
    if (token) {
      router.push('/(tabs)')
    }
  }, []);

  const handleRegister = async () => {
    // Register logic here, for now just redirect to the feed
    router.push('/(tabs)');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <LogoHeader small={true} />
        <Text style={styles.title}>Sign Up with email</Text>
        <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
        />
        <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
        />
        <Button title="Register" onPress={handleRegister} />
      </SafeAreaView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingLeft: 8 },
});
  
export default Register;