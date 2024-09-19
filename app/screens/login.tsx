import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button, Icon } from 'react-native-paper';
import { LogoHeader } from '@/components/LogoHeader';
import { LinearGradient } from 'expo-linear-gradient';

const Login = () => {
  const router = useRouter();

  return (
    <LinearGradient
          colors={['#4c669f', '#EADDFF']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style= {styles.container}>
      <LogoHeader small={true} style={styles.logo}/>
      <Text style={styles.title}>Log In:</Text>
      <Button
          mode="contained"
          buttonColor='#FFFFFF'
          textColor='#000000'
          style = {styles.button}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Image source={require('@/assets/images/google-icon.png')}
                style={{width: 20, height: 20, marginRight: 10}} />
              <Text>Log In with Google</Text>
            </View>
      </Button>
      <View style={styles.dividerWrapper}>
        <View style={styles.divider} />
        <Text style={styles.text}>or</Text>
        <View style={styles.divider} />
      </View>
      <Button onPress={() => router.push('./email-login')}
          mode="contained"
          buttonColor='#65558F'
          textColor='#FFFFFF'
          style = {styles.button}>
          Log In with email
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
  
export default Login;