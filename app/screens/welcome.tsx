import { useRouter } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { LogoHeader } from '@/components/LogoHeader';
import { LinearGradient } from 'expo-linear-gradient';

const Welcome = () => {
  const router = useRouter();

  return (
      <LinearGradient
          colors={['#4c669f', '#EADDFF']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style= {styles.container}>
        <LogoHeader />
        <View style={styles.divider} />
        <Text style={styles.title}>Join now!</Text>
        <Button onPress={() => router.push('/screens/create-account')} 
          mode="contained" 
          buttonColor='#1E1E1E'
          textColor='#FFFFFF'
          style = {styles.button}>
          Create Account
        </Button>
        <View style={styles.divider} />
        <Text style={styles.subtitle}>Already have an account?</Text>
        <Button
          mode="contained"
          buttonColor='#65558F'
          textColor='#FFFFFF'
          style = {styles.button}>
          Log In
        </Button>
      </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30 },
  title: { fontSize: 36, marginBottom: 20, textAlign: 'center', color: 'black'},
  subtitle: { fontSize: 16, marginBottom: 20, textAlign: 'center', color: 'black'},  
  divider: { borderBottomColor: 'rgba(0, 0, 0, 0.5)', borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 20, marginTop: 30 },
  button: { marginHorizontal: 40 },
});

export default Welcome;