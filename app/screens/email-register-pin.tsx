import { useRouter } from 'expo-router';
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
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;

  const handleRegisterPIN = async () => {
    if (!pin) {
      showSnackbar('PIN required.', 'error');
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
        <Text style={styles.title}>Enter PIN sent to your email:</Text>
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
          <Button onPress={handleRegisterPIN}
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
