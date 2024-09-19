import { DarkTheme, DefaultTheme, NavigationContainer, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useContext, useEffect, useState } from 'react';
import 'react-native-reanimated';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PaperProvider } from 'react-native-paper';
import { AuthContext, AuthProvider } from '@/components/contexts/AuthContext';
import { useFonts } from 'expo-font';
import TabLayout from './(tabs)/_layout';
import CreateAccount from './screens/create-account';
import Welcome from './screens/welcome';
import Login from './screens/login';
import EmailRegister from './screens/email-register';
import EmailLogin from './screens/email-login';

const RootStack = createNativeStackNavigator();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { auth } = useContext(AuthContext);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <PaperProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootStack.Navigator screenOptions={{ headerShown: false }}>
            {(auth && auth.token) ? (
              <RootStack.Screen name="(tabs)" component={TabLayout} />
            ) : (
              <>
                <RootStack.Screen name="screens/welcome" component={Welcome} />
                <RootStack.Screen name="screens/create-account" component={CreateAccount} />
                <RootStack.Screen name="screens/login" component={Login} />
                <RootStack.Screen name="screens/email-register" component={EmailRegister} />
                <RootStack.Screen name="screens/email-login" component={EmailLogin} />
              </>
            )}
          </RootStack.Navigator>
        </ThemeProvider>
      </PaperProvider>
    </AuthProvider>
  );
}
