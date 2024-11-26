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
import { User } from '@/components/types/models';
import TabLayout from './(tabs)/_layout';
import CreateAccount from './screens/create-account';
import Welcome from './screens/welcome';
import Login from './screens/login';
import EmailRegister from './screens/email-register';
import EmailLogin from './screens/email-login';
import MyProfileScreen from './screens/my-profile';
import UserProfileScreen from './screens/user-profile';
import ChatScreen from './screens/chat';
import { FirebaseProvider, useFirebase } from '@/components/contexts/FirebaseContext';
import NotificationListScreen from './screens/notifications';
import SnapScreen from './screens/snap';
import ProfileFeedScreen from './screens/profile-feed';
import UserStatsScreen from './screens/user-stats';
import EmailRegisterPIN from './screens/email-register-pin';

const RootStack = createNativeStackNavigator();

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout: React.FC = () => {
  const colorScheme = useColorScheme();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const { auth } = useAuth();
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { firebaseState } = useFirebase();

  const showSnackbar = (message: string, type: string) => {
    setSnackbarType(type);
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
      firebaseState.registerForPushNotificationsAsync();
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
              <RootStack.Screen name="(tabs)">
                {() => <TabLayout showSnackbar={showSnackbar} />}
              </RootStack.Screen>
              <RootStack.Screen name="screens/my-profile">
                {() => <MyProfileScreen showSnackbar={showSnackbar} />}
              </RootStack.Screen>
              <RootStack.Screen name="screens/user-profile">
                {() => <UserProfileScreen showSnackbar={showSnackbar} />}
              </RootStack.Screen>
              <RootStack.Screen name="screens/chat">
                {() => <ChatScreen />}
              </RootStack.Screen>
              <RootStack.Screen name="screens/snap">
                {() => <SnapScreen showSnackbar={showSnackbar} />}
              </RootStack.Screen>
              <RootStack.Screen name="screens/notifications">
                {() => <NotificationListScreen />}
              </RootStack.Screen>
              <RootStack.Screen name="screens/profile-feed">
                {() => <ProfileFeedScreen showSnackbar={showSnackbar} />}
              </RootStack.Screen>
              <RootStack.Screen name="screens/user-stats">
                {() => <UserStatsScreen showSnackbar={showSnackbar} />}
              </RootStack.Screen>
            </>
          ) : (
            <>
              <RootStack.Screen name="screens/welcome" component={Welcome} />
              <RootStack.Screen name="screens/create-account">
                {() => <CreateAccount showSnackbar={showSnackbar} fcmToken={firebaseState.fcmToken} />}
              </RootStack.Screen>
              <RootStack.Screen name="screens/login">
                {() => <Login showSnackbar={showSnackbar} fcmToken={firebaseState.fcmToken} />}
              </RootStack.Screen>
              <RootStack.Screen name="screens/email-register">
                {() => <EmailRegister showSnackbar={showSnackbar} />}
              </RootStack.Screen>
              <RootStack.Screen name="screens/email-register-pin">
                {() => <EmailRegisterPIN showSnackbar={showSnackbar} />}
              </RootStack.Screen>
              <RootStack.Screen name="screens/email-login">
                {() => <EmailLogin showSnackbar={showSnackbar} fcmToken={firebaseState.fcmToken} />}
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
      <FirebaseProvider>
        <RootLayout />
      </FirebaseProvider>
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