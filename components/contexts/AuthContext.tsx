import { createContext } from 'react';
import { useEffect, useState } from 'react';
import { ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext<AuthContextType>({
  auth: null,
  setAuth: async () => {},
});

type Auth = {
  token: string,
  email: string,
};

interface AuthContextType {
  auth: Auth | null;
  setAuth: (auth: Auth | null) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
    const [auth, setAuthState] = useState<Auth | null>(null);

    const getAuthState = async () => {
      try {
        const authDataString = await AsyncStorage.getItem('auth');
        const authData = JSON.parse(authDataString || '');
        setAuthState(authData);
      } catch (error) {
        setAuthState(null);
      }
    };

    const setAuth = async (auth: Auth | null) => {
      try {
        if (auth) {
          await AsyncStorage.setItem('auth', JSON.stringify(auth));
          console.log('Auth set');
        } else {
          await AsyncStorage.removeItem('auth');
        }
        setAuthState(auth);
      } catch (error) {
        return Promise.reject(error);
      }
      };

    useEffect(() => {
      getAuthState();
    }, []);

    return (
      <AuthContext.Provider value={{ auth, setAuth }}>
        {children}
      </AuthContext.Provider>
    );

};

export { AuthContext, AuthProvider };