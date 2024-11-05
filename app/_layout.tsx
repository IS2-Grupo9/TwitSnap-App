import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { StyleSheet, Text } from 'react-native';
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
import MyProfileScreen from './screens/my-profile';
import UserProfileScreen from './screens/user-profile';

import { messagingInstance as messaging } from '@/config/firebaseConfig';
import * as Notifications from 'expo-notifications';
import ChatScreen from './screens/chat';

const RootStack = createNativeStackNavigator();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout: React.FC = () => {
  const colorScheme = useColorScheme();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const { auth } = useAuth();
  const [targetUser, setTargetUser] = useState('');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  async function registerForPushNotificationsAsync() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      console.log('Notification permissions granted.');
      setFcmToken(await messaging.getToken());
    } else {
      console.log('Notifications permissions not granted.');
    }
  }

  const showSnackbar = (message: string, type: string) => {
    setSnackbarType(type);
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      registerForPushNotificationsAsync(); // Call once on load
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (auth.token) {
      const unsubscribe = messaging.onMessage(async (message: any) => {
        console.log('onMessage', message);
        const { title, body } = message.notification;
    
        await Notifications.scheduleNotificationAsync({
          content: {
            title: title || 'New Notification',
            body: body || 'You have a new notification.',
          },
          trigger: null,
        });
      });

      return unsubscribe;
    }
  }, [auth.token]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PaperProvider>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {auth.token ? (
            <>
              <RootStack.Screen name="(tabs)">
                {() => <TabLayout showSnackbar={showSnackbar}
                  targetUser={targetUser}
                  setTargetUser={setTargetUser}          
                  />}
              </RootStack.Screen>
              <RootStack.Screen name="screens/my-profile">
                {() => <MyProfileScreen showSnackbar={showSnackbar} targetUser={targetUser} setTargetUser={setTargetUser} />}
              </RootStack.Screen>
              <RootStack.Screen name="screens/user-profile">
                {() => <UserProfileScreen showSnackbar={showSnackbar} targetUser={targetUser} setTargetUser={setTargetUser} />}
              </RootStack.Screen>
              <RootStack.Screen name="screens/chat">
                {() => <ChatScreen />}
              </RootStack.Screen>
            </>
          ) : (
            <>
              <RootStack.Screen name="screens/welcome" component={Welcome} />
              <RootStack.Screen name="screens/create-account">
                {() => <CreateAccount showSnackbar={showSnackbar} fcmToken={fcmToken} />}
              </RootStack.Screen>
              <RootStack.Screen name="screens/login">
                {() => <Login showSnackbar={showSnackbar} fcmToken={fcmToken} />}
              </RootStack.Screen>
              <RootStack.Screen name="screens/email-register">
                {() => <EmailRegister showSnackbar={showSnackbar} />}
              </RootStack.Screen>
              <RootStack.Screen name="screens/email-login">
                {() => <EmailLogin showSnackbar={showSnackbar} fcmToken={fcmToken} />}
              </RootStack.Screen>
            </>
          )}
        </RootStack.Navigator>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={styles.snackbar}
          theme={{ colors: { accent: snackbarType === 'error' ? 'red' : 'green' } }}>
          <Text style={[styles.snackbarText, { color: snackbarType === 'error' ? 'red' : 'green' }]}>
            {snackbarMessage}
          </Text>
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
    bottom: 75,
    width: '90%',
  },
  snackbarText: {
    fontWeight: 'bold',
  },
});

export default AppLayout;