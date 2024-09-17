import { DarkTheme, DefaultTheme, NavigationContainer, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useContext, useEffect } from 'react';
import 'react-native-reanimated';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme } from '@/hooks/useColorScheme';
import { PaperProvider } from 'react-native-paper';
import TabLayout from './(tabs)/_layout';
import { AuthContext } from '@/components/contexts/AuthContext';
import CreateAccount from './screens/create-account';
import Register from './screens/register';
import Welcome from './screens/welcome';

import { useFonts } from 'expo-font';

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
    <PaperProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {auth && auth.token ? (
            <RootStack.Screen name="(tabs)" component={TabLayout} />
          ) : (
            <>
              <RootStack.Screen name="screens/welcome" component={Welcome} />
              <RootStack.Screen name="screens/register" component={Register} />
              <RootStack.Screen name="screens/create-account" component={CreateAccount} />
            </>
          )}
        </RootStack.Navigator>
      </ThemeProvider>
    </PaperProvider>
  );
}
