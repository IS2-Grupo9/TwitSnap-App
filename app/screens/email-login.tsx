import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { TextInput, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/components/contexts/AuthContext';
import { LogoHeader } from '@/components/LogoHeader';

type EmailLoginProps = {
  showSnackbar: (message: string, type: string) => void;
};

const EmailLogin = ({ showSnackbar }: EmailLoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [emailError, setEmailError] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        showSnackbar('All fields are required.', 'error');
        return;
      }

      if (!validateEmail(email)) {
        showSnackbar('Invalid email address.', 'error');
        return;
      }
      
      setLoading(true); // Start loading
      const response = await fetch(`${apiUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        showSnackbar(data.message || 'Invalid email or password. Please try again.', 'error');
        setLoading(false);
        return;
      }

      login({ token: data.token, user: data.user, google: false });
      setLoading(false);
    } catch (error: any) {
      showSnackbar(`An unexpected error occurred: ${error.message}. Service may be down?`, 'error');
      console.error('Login Error:', error.message);
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#EADDFF']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}>
      <SafeAreaView style={styles.container}>
        <LogoHeader small={true} style={styles.logo} />
        <Text style={styles.title}>Log In with email:</Text>
        <TextInput
          mode="flat"
          style={styles.input}
          label={"Email"}
          value={email}
          underlineColor='black'
          activeUnderlineColor='black'
          textColor='black'
          placeholderTextColor='black'
          theme={{
            colors: {
              onSurfaceVariant: 'rgba(0, 0, 0, 0.5)',
              error: 'red',
            },
          }}
          error={emailError}
          onChangeText={(text) => {
            setEmail(text);
            setEmailError(!validateEmail(text));
          }}
        />
        {emailError && (
          <Text style={styles.errorText}>Please enter a valid email address.</Text>
        )}
        <TextInput
          mode="flat"
          right={<TextInput.Icon
            icon={hidePassword ? 'eye' : 'eye-off'}
            color='black'
            onPress={() => setHidePassword(!hidePassword)} />}
          style={styles.input}
          label={"Password"}
          value={password}
          underlineColor='black'
          activeUnderlineColor='black'
          textColor='black'
          placeholderTextColor='black'
          theme={{
            colors: {
              onSurfaceVariant: 'rgba(0, 0, 0, 0.5)',
            },
          }}
          onChangeText={setPassword}
          secureTextEntry={hidePassword}
        />
        {loading ? (
          <ActivityIndicator size="large" color="#65558F" />
        ) : (
          <Button onPress={handleLogin}
            mode="contained"
            buttonColor='#65558F'
            textColor='#FFFFFF'
            style={styles.button}
            disabled={loading}>
            Log In
          </Button>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  logo: { marginBottom: 25 },
  title: { fontSize: 24, textAlign: 'center', color: 'black', marginBottom: 10 },
  input: { marginVertical: 10, backgroundColor: 'transparent' },
  button: { marginVertical: 20, marginHorizontal: 40 },
  errorText: { color: 'red', marginBottom: 10, textAlign: 'center' },
});

export default EmailLogin;
