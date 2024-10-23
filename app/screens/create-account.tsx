import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button, Icon } from 'react-native-paper';
import { LogoHeader } from '@/components/LogoHeader';
import { LinearGradient } from 'expo-linear-gradient';
import { GoogleSignin, statusCodes, isErrorWithCode, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { useAuth } from '@/components/contexts/AuthContext';

GoogleSignin.configure({
  webClientId: '823250306806-qvjrjb4uleclm1s2dd10q95euc8r69hc.apps.googleusercontent.com'
});

type CreateAccountProps = {
  showSnackbar: (message: string, type: string) => void;
};

const CreateAccount = ({ showSnackbar }: CreateAccountProps) => {
  const { login } = useAuth();
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response) && response.data.idToken) {
        sendToBackend(response.data.idToken);
      }
      else {
        showSnackbar('Failed to sign in with Google. Please try again.', 'error');
      }
    } catch (error: any) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            showSnackbar('Google sign in cancelled.', 'error');
            break;
          case statusCodes.IN_PROGRESS:
            showSnackbar('Google sign in already in progress.', 'error');
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            showSnackbar('Google Play Services not available.', 'error');
            break;
          default:
            console.error(error);
            showSnackbar('Failed to sign in with Google. Please try again.', 'error');
            break;
        }
      }
      else {
        console.error(error);
        showSnackbar('Failed to sign in with Google. Please try again.', 'error');
      }
    }
  };

  const sendToBackend = async (googleToken: string) => {
    try {
      const response = await fetch(`${apiUrl}/users/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: googleToken,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        showSnackbar(data.message || 'Failed to sign in with Google. Please try again.', 'error');
        return;
      }
      if (data.token && data.user) {
        login({ token: data.token, user: data.user, google: true });
      }
    }
    catch (error: any) {
      showSnackbar(`An unexpected error occurred. Service may be down?`, 'error');
      console.error('Google Sign In Error:', error.message);
    }
  }

  return (
    <LinearGradient
          colors={['#4c669f', '#EADDFF']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style= {styles.container}>
      <LogoHeader small={true} style={styles.logo}/>
      <Text style={styles.title}>Create an account:</Text>
      <Button
          mode="contained"
          buttonColor='#FFFFFF'
          textColor='#000000'
          onPress={handleGoogleSignIn}
          style = {styles.button}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image source={require('@/assets/images/google-icon.png')}
                style={{width: 20, height: 20, marginRight: 10}} />
              <Text>Sign Up with Google</Text>
            </View>
      </Button>
      <View style={styles.dividerWrapper}>
        <View style={styles.divider} />
        <Text style={styles.text}>or</Text>
        <View style={styles.divider} />
      </View>
      <Button onPress={() => router.push('./email-register')}
          mode="contained"
          buttonColor='#65558F'
          textColor='#FFFFFF'
          style = {styles.button}>
          Sign Up with email
      </Button>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  logo: { marginBottom: 25 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  dividerWrapper: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  divider: { flex: 1, borderBottomColor: 'rgba(0, 0, 0, 0.5)', borderBottomWidth: StyleSheet.hairlineWidth },
  text: { marginHorizontal: 10, fontSize: 16 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 12, paddingLeft: 8 },
  button: { marginHorizontal: 40 },
});
  
export default CreateAccount;