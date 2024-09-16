import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Button, TextInput, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogoHeader } from '@/components/LogoHeader';
import { ThemedView } from '@/components/ThemedView';

const CreateAccount = () => {
  const [token, setToken] = useState('');
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

  return (
    <ThemedView style={styles.container}>
      <LogoHeader small={true} />
      <Text style={styles.title}>Create an account:</Text>
      <Button title="Sign Up with Google" onPress={() => {}} />
      <View style={styles.dividerWrapper}>
        <View style={styles.divider} />
        <Text style={styles.text}>or</Text>
        <View style={styles.divider} />
      </View>
      <Button title="Sign Up with email" onPress={() => router.push('/register')} />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  dividerWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  divider: { borderBottomColor: 'gray', borderBottomWidth: StyleSheet.hairlineWidth },
  text: { marginHorizontal: 10, fontSize: 16 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingLeft: 8 },
});
  
export default CreateAccount;