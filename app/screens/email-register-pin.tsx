import { useGlobalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { TextInput, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoHeader } from '@/components/LogoHeader';
import { LinearGradient } from 'expo-linear-gradient';

type EmailRegisterPINProps = {
  showSnackbar: (message: string, type: string) => void;
};

const EmailRegisterPIN = ({ showSnackbar }: EmailRegisterPINProps) => {
  const [loading, setLoading] = useState(false);
  const { registerEmail } = useGlobalSearchParams<{ registerEmail: string }>();
  const [email, setEmail] = useState(registerEmail);
  const [emailError, setEmailError] = useState(false);
  const [pin, setPin] = useState('');
  const router = useRouter();
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;
  
  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleRegisterPIN = async () => {
    if (!pin || !email) {
      showSnackbar('Email and PIN required.', 'error');
      return;
    }
    
    if (!validateEmail(email)) {
      showSnackbar('Invalid email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/users/register/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          pin: pin,
        }),
      });

      if (response.ok) {
        showSnackbar('Account registered successfully. Please log in.', 'success');
        router.push('./login');
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
        <Text style={styles.title}>Enter email and PIN:</Text>
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
          style={styles.input}
          label={"PIN"}
          value={pin}
          underlineColor='black'
          activeUnderlineColor='black'
          textColor='black'
          placeholderTextColor='black'
          theme={{
            colors: {
              onSurfaceVariant: 'rgba(0, 0, 0, 0.5)',
            },
          }}
          onChangeText={setPin}
        />
        {loading ? (
          <ActivityIndicator size="large" color="#65558F" />
        ) : (
          <Button onPress={() => {}}
            mode="contained"
            buttonColor='#65558F'
            textColor='#FFFFFF'
            style={styles.button}
            disabled={loading}>
            Complete registration
          </Button>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  logo: { marginBottom: 25 },
  title: { fontSize: 22, textAlign: 'center', color: 'black', marginBottom: 10 },
  input: { marginVertical: 10, backgroundColor: 'transparent' },
  button: { marginVertical: 20, marginHorizontal: 40 },
  errorText: { color: 'red', marginBottom: 10, textAlign: 'center' },
});

export default EmailRegisterPIN;
