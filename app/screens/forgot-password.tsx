import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Button, ActivityIndicator, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoHeader } from '@/components/LogoHeader';
import { LinearGradient } from 'expo-linear-gradient';

type ForgotPasswordProps = {
  showSnackbar: (message: string, type: string) => void;
};

const ForgotPassword = ({ showSnackbar }: ForgotPasswordProps) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;

  const validateEmail = (email: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showSnackbar('Email required.', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showSnackbar('Invalid email address.', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiUrl}/users/forgotPassword`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });
      console.log(response);

      if (response.ok) {
        showSnackbar('Password reset email sent. Please check your inbox.', 'success');
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
        <Text style={styles.title}>Enter email to reset password:</Text>
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
        {loading ? (
          <ActivityIndicator size="large" color="#65558F" />
        ) : (
          <Button onPress={handleForgotPassword}
            mode="contained"
            buttonColor='#65558F'
            textColor='#FFFFFF'
            style={styles.button}
            disabled={loading}>
            Reset Password
          </Button>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  logo: { marginBottom: 25 },
  title: { fontSize: 20, textAlign: 'center', color: 'black', marginBottom: 10 },
  input: { marginVertical: 10, backgroundColor: 'transparent' },
  button: { marginVertical: 20, marginHorizontal: 40 },
  text: { textAlign: 'center', color: '#65558F', marginTop: 20 },
  errorText: { color: 'red', marginBottom: 10, textAlign: 'center' },
});

export default ForgotPassword;
