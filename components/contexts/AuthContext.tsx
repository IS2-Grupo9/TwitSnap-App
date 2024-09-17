import { createContext } from 'react';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext<AuthContextType>({
    auth: null,
    setAuthState: () => {},
});

import { ReactNode } from 'react';

type Auth = {
    token: 'string',
    email: 'string',
};

interface AuthContextType {
    auth: Auth | null,
    setAuthState: (auth: Auth | null) => void,
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

    const setAuth = async (auth : Auth) => {
        try {
            await AsyncStorage.setItem('auth', JSON.stringify(auth));
            setAuthState(auth);
        } catch (error) {
            Promise.reject(error);
        }
    };

    useEffect(() => {
        getAuthState();
    }, []);

    return (
        <AuthContext.Provider value={{ auth, setAuthState }}>
            {children}
        </AuthContext.Provider>
    );

};

export { AuthContext, AuthProvider };