import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as Device from 'expo-device';
import firestore from '@react-native-firebase/firestore';
import { messagingInstance as messaging } from '@/config/firebaseConfig';
import * as Notifications from 'expo-notifications';
import { useAuth } from './AuthContext';
import { Chat, Message, Notification } from '../types/models';
import { router } from 'expo-router';

interface FirebaseState {
  chats: Chat[];
  unread: boolean;
  notifications: Notification[];
  markAsRead: () => void;
  fcmToken: string | null;
  clearNotifications: () => void;
  registerForPushNotificationsAsync: () => void;
  registerFCMToken: (username: string) => void;
}

interface FirebaseContextType {
  firebaseState: FirebaseState;
  addNotification: (notification: Notification) => void;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    };
  },
});

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { auth } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [unread, setUnread] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [previousLastMessages, setPreviousLastMessages] = useState<{ [key: string]: Message }>({});

  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;

  async function replaceUserIdWithUsername(userId: string) {
    if (userId) {
      try {
        const response = await fetch(`${apiUrl}/users/users?ids=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });
        const user = await response.json();
        return user[0]?.username || userId;
      } catch (error) {
        console.error('Error fetching user:', error);
        return userId;
      }
    }
    return userId;
  }

  async function registerForPushNotificationsAsync() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      const token = (await Notifications.getDevicePushTokenAsync()).data;
      setFcmToken(token);

      if (auth.token && auth.user?.username) {
        registerFCMToken(auth.user.username);
      }      
    } else {
      console.log('Must use physical device for Push Notifications');
    }
  }  

  async function registerFCMToken(username: string) {
    if (auth.token && fcmToken) {
      try {
        const userDoc = await firestore().collection('users').doc(username);
        const user = await userDoc.get();
        if (user.exists) {
          await userDoc.update({
            fcmTokens: firestore.FieldValue.arrayUnion(fcmToken),
          });
        } else {
          await userDoc.set({
            fcmTokens: [fcmToken],
          });
        }
      } catch (error) {
        console.error('Error registering FCM token:', error);
      }        
    }
  }

  async function resolveMessage(data: any) {
    let title = '';
    let body = '';
    let otherUser = '';
    if (data.otherUserId) {
      otherUser = await replaceUserIdWithUsername(data.otherUserId.toString());
    }
    switch (data.type) {
      case 'mention':
        title = 'You have been mentioned!';
        body = otherUser + ' mentioned you in a Snap.';
        break;
      default:
        title = 'New notification';
        body = 'You have a new notification.';
        break;
    }
    return [title, body];
  }

  useEffect(() => {
    // Background messages
    messaging.setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
      if (remoteMessage.ttl !== 0) {
        if (remoteMessage.data?.user && remoteMessage.data?.user === auth.user?.username) {
          console.log('Message handled in the background!', remoteMessage);
          const [title, body] = await resolveMessage(remoteMessage.data);
          const notification : Notification = {
            id: remoteMessage.messageId || '',
            title: title,
            body: body,
            data: remoteMessage.data,
            date: new Date(),
            read: false,
          };
          // Schedule a notification
          await Notifications.scheduleNotificationAsync({
            content: {
              title: notification.title,
              body: notification.body,
              data: notification.data,
            },
            trigger: null,
          });
          addNotification(notification);
        }
    }
    });
    // Foreground messages
    const unsubscribeForeground = messaging.onMessage(async remoteMessage => {
      if (remoteMessage.ttl !== 0) {
        if (remoteMessage.data?.user && remoteMessage.data?.user === auth.user?.username) {
          console.log('Message handled in the foreground!', remoteMessage);
          const [title, body] = await resolveMessage(remoteMessage.data);
          const notification : Notification = {
            id: remoteMessage.messageId || '',
            title: title,
            body: body,
            data: remoteMessage.data,
            date: new Date(),
            read: false,
          };
          addNotification(notification);
        }
      }
      });

    return () => {
      unsubscribeForeground();
    };
  }, [auth.user?.username]);

  useEffect(() => {
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
      if (response.actionIdentifier === "expo.modules.notifications.actions.DEFAULT") {
        const notificationData = response.notification.request.content.data;
        handleNotificationTap(notificationData, response.notification.request.identifier);
      }
    });

    return () => {
      responseSubscription.remove();
    };
  }, []);

  const handleNotificationTap = (data : any, notificationId : string) => {
    if (data && data.chatId) {
      const chat = chats.find((chat) => chat.id === data.chatId);
      if (chat && (chat.lastMessage?.sender !== auth?.user?.username)) {
        // Mark the message as read
        firestore()
          .collection('chats')
          .doc(chat.id)
          .update({
            lastMessage: {
              ...chat.lastMessage,
            },
            unreadCount: 0,
          });
      }
      router.push({
        pathname: '/screens/chat',
        params: { chatId: data.chatId },
      });
    } else if (data && data.snapId) {
      // Mark the notification as read
      setNotifications((prev) => prev.map((notification) => notification.id === notificationId ? { ...notification, read: true } : notification));
      router.push({
        pathname: '/screens/snap',
        params: { snapId: data.snapId.toString() },
      });
    }
  };

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

  useEffect(() => {
    if (auth.token) {
      const unsubscribe = firestore()
        .collection('chats')
        .where('participants', 'array-contains', auth.user?.username)
        .onSnapshot(snapshot => {
          snapshot.docChanges().forEach(change => {
            if (change.type === 'modified' || change.type === 'added') {
              const chat = change.doc.data() as Chat;
              let previousLastMessage;
              if (!previousLastMessages[change.doc.id]) { 
                previousLastMessage = null;
              } else {
                previousLastMessage = previousLastMessages[change.doc.id];
              }
              if (!previousLastMessage || previousLastMessage.createdAt < chat.lastMessage?.createdAt) {
                setPreviousLastMessages((prev) => ({
                  ...prev,
                  [change.doc.id]: chat.lastMessage as Message,
                }));
                if (chat.lastMessage?.sender !== auth.user?.username) {
                  Notifications.scheduleNotificationAsync({
                    content: {
                      title: chat.lastMessage?.sender,
                      body: chat.lastMessage?.text || 'You have a new message.',
                      data: { chatId: change.doc.id },
                    },
                    trigger: null,
                  });
                }
              }
            }
          });
        });
  
      return unsubscribe;
    }
  }, [auth.token]);

  const markAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  }  

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [...prev, notification]);
  };

  const clearNotifications = () => {
    setNotifications([]);
  }

  return (
    <FirebaseContext.Provider
      value={{
        firebaseState: { 
          chats,
          unread,
          notifications,
          markAsRead,
          fcmToken,
          clearNotifications,
          registerForPushNotificationsAsync,
          registerFCMToken,
         },
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