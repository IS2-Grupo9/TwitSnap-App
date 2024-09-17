import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogoHeader } from '@/components/LogoHeader';
import { LinearGradient } from 'expo-linear-gradient';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const router = useRouter();

  const handleRegister = async () => {
    // Register logic here, for now just redirect to the feed
  }

  return (
    <LinearGradient
          colors={['#4c669f', '#EADDFF']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style= {styles.container}>
      <SafeAreaView style={styles.container}>
        <LogoHeader small={true} style={styles.logo}/>
        <Text style={styles.title}>Sign Up with email:</Text>
        <TextInput
            mode="flat"
            style={styles.input}
            label={"Email"}
            value={email}
            underlineColor='black'
            activeUnderlineColor='black'
            textColor='black'
            placeholderTextColor='black'
            theme = {{
              colors: {
                onSurfaceVariant: 'rgba(0, 0, 0, 0.5)',
              },
            }}
            onChangeText={setEmail}
        />
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
            theme = {{
              colors: {
                onSurfaceVariant: 'rgba(0, 0, 0, 0.5)',
              },
            }}
            onChangeText={setPassword}
            secureTextEntry={hidePassword}
        />
        <Button onPress={() => handleRegister()}
          mode="contained"
          buttonColor='#65558F'
          textColor='#FFFFFF'
          style = {styles.button}>
          Sign Up
        </Button>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  logo: { marginBottom: 25 },
  title: { fontSize: 24, textAlign: 'center', color: 'black'},
  input: { marginVertical: 10, backgroundColor: 'transparent'},
  button: { marginVertical: 20, marginHorizontal: 40 },
});
  
export default Register;