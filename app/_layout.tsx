import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PaperProvider, Snackbar } from 'react-native-paper';
import { AuthProvider, useAuth } from '@/components/contexts/AuthContext';
import { useFonts } from 'expo-font';
import TabLayout from './(tabs)/_layout';
import CreateAccount from './screens/create-account';
import Welcome from './screens/welcome';
import Login from './screens/login';
import EmailRegister from './screens/email-register';
import EmailLogin from './screens/email-login';
import ProfileScreen from './screens/profile';

const RootStack = createNativeStackNavigator();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout: React.FC = () => {
  const colorScheme = useColorScheme();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { auth } = useAuth();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PaperProvider>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {auth.token ? (
            <>
              <RootStack.Screen name="(tabs)" component={TabLayout} />
              <RootStack.Screen name="screens/profile">
                {() => <ProfileScreen showSnackbar={showSnackbar} />}
              </RootStack.Screen>
            </>
          ) : (
            <>
              <RootStack.Screen name="screens/welcome" component={Welcome} />
              <RootStack.Screen name="screens/create-account" component={CreateAccount} />
              <RootStack.Screen name="screens/login" component={Login} />
              <RootStack.Screen name="screens/email-register">
                {() => <EmailRegister showSnackbar={showSnackbar} />}
              </RootStack.Screen>
              <RootStack.Screen name="screens/email-login">
                {() => <EmailLogin showSnackbar={showSnackbar} />}
              </RootStack.Screen>
            </>
          )}
        </RootStack.Navigator>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}>
          {snackbarMessage}
        </Snackbar>
      </PaperProvider>
    </ThemeProvider>
  );
};

const AppLayout: React.FC = () => {
  return (
    <AuthProvider>
      <RootLayout />
    </AuthProvider>
  );
};

const styles = StyleSheet.create({
  snackbar: { 
    backgroundColor: 'white',
    alignSelf: 'center',
    position: 'absolute',
    bottom: 20,
    width: '90%',
  },
});

export default AppLayout;