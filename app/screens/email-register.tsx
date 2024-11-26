import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoHeader } from '@/components/LogoHeader';
import { LinearGradient } from 'expo-linear-gradient';

type EmailRegisterProps = {
  showSnackbar: (message: string, type: string) => void;
};

const EmailRegister = ({ showSnackbar }: EmailRegisterProps) => {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [emailError, setEmailError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleRegister = async () => {
    if (!userName || !email || !password || !confirmPassword) {
      showSnackbar('All fields are required.', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showSnackbar('Invalid email address.', 'error');
      return;
    }

    if (password !== confirmPassword) {
      showSnackbar('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userName,
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        showSnackbar('Account created, please check your email for a PIN.', 'success');
        router.push('./email-register-pin');
      } else {
        const errorData = await response.json();
        showSnackbar(`An error occurred: ${errorData.message || 'Please try again.'}`, 'error');
      }
    } catch (error: any) {
      showSnackbar(`An unexpected error occurred. Service may be down?`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#4c669f', '#EADDFF']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <LogoHeader small={true} style={styles.logo} />
        <Text style={styles.title}>Sign Up with email:</Text>
        <TextInput
          mode="flat"
          style={styles.input}
          label={"Username"}
          value={userName}
          underlineColor='black'
          activeUnderlineColor='black'
          textColor='black'
          placeholderTextColor='black'
          theme={{
            colors: {
              onSurfaceVariant: 'rgba(0, 0, 0, 0.5)',
            },
          }}
          onChangeText={setUserName}
        />
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
          right={
            <TextInput.Icon
              icon={hidePassword ? 'eye' : 'eye-off'}
              color='black'
              onPress={() => setHidePassword(!hidePassword)}
            />
          }
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
        <TextInput
          mode="flat"
          right={
            confirmPassword !== '' && password === confirmPassword ? (
              <TextInput.Icon
                icon='check'
                color='#2E8F00'
                onPress={() => {}}
              />
            ) : null
          }
          style={styles.input}
          label={"Confirm password"}
          value={confirmPassword}
          underlineColor='black'
          activeUnderlineColor='black'
          textColor='black'
          placeholderTextColor='black'
          theme={{
            colors: {
              onSurfaceVariant: 'rgba(0, 0, 0, 0.5)',
            },
          }}
          onChangeText={setConfirmPassword}
          secureTextEntry={hidePassword}
        />
        {loading ? (
          <ActivityIndicator size="large" color="#65558F" />
        ) : (
          <Button onPress={handleRegister}
            mode="contained"
            buttonColor='#65558F'
            textColor='#FFFFFF'
            style={styles.button}
            disabled={loading}>
            Sign Up
          </Button>
        )}
        <TouchableOpacity onPress={() => router.push('./email-register-pin')}>
          <Text style={styles.text}>Received a PIN? Complete registration here.</Text>
        </TouchableOpacity>
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
  text: { textAlign: 'center', color: '#65558F', marginTop: 20 },
  errorText: { color: 'red', marginBottom: 10, textAlign: 'center' },
});

export default EmailRegister;
