import { DarkTheme, DefaultTheme, NavigationContainer, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from '@/components/contexts/AuthContext';
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

const RootLayout: React.FC = () => {
  const colorScheme = useColorScheme();
  const { auth } = useAuth();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

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

export default AppLayout;