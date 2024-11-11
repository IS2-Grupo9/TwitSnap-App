import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import firestore from '@react-native-firebase/firestore';
import { messagingInstance as messaging } from '@/config/firebaseConfig';
import * as Notifications from 'expo-notifications';
import { useAuth } from './AuthContext';
import { Chat, Notification } from '../types/models';

interface FirebaseState {
  chats: Chat[];
  unread: boolean;
  notifications: Notification[];
  fcmToken: string | null;
  registerForPushNotificationsAsync: () => Promise<void>;
}

interface FirebaseContextType {
  firebaseState: FirebaseState;
  addNotification: (notification: Notification) => void;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { auth } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [unread, setUnread] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [fcmToken, setFcmToken] = useState<string | null>(null);

  const registerForPushNotificationsAsync = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status === 'granted') {
      setFcmToken(await messaging.getToken());
    } else {
      console.log('Notification permissions not granted.');
    }
  };

  useEffect(() => {
    if (auth.token) {
      const unsubscribe = messaging.onMessage(async (message: any) => {
        const { title, body, data } = message.notification;
        
        const notification: Notification = {
          title: title || 'New Notification',
          body: body || 'You have a new notification.',
          data: data || {},
        };

        setNotifications((prev) => [...prev, notification]);

        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.body
          },
          trigger: null,
        });
      });

      return unsubscribe;
    }
  }, [auth.token]);

  useEffect(() => {
    if (auth.token) {
      const unsubscribe = firestore()
        .collection('chats')
        .where('participants', 'array-contains', auth.user?.username)
        .onSnapshot(snapshot => {
          const chatsData: Chat[] = snapshot.docs.map(doc => ({
            id: doc.id,
            participants: doc.data().participants,
            lastMessage: doc.data().lastMessage,
            createdAt: doc.data().createdAt,
            updatedAt: doc.data().updatedAt,
            unreadCount: doc.data().unreadCount,
          }));
          setChats(chatsData);
          setUnread(chatsData.some(chat => chat.unreadCount > 0 && chat.lastMessage?.sender !== auth.user?.username));
        });

      return unsubscribe;
    }
  }, [auth.token]);

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);
  };

  return (
    <FirebaseContext.Provider
      value={{
        firebaseState: { chats, unread, notifications, fcmToken, registerForPushNotificationsAsync },
        addNotification,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};