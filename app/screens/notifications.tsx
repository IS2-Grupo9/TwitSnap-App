import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useFirebase } from '@/components/contexts/FirebaseContext';
import { router } from 'expo-router';
import { useAuth } from '@/components/contexts/AuthContext';
import TopBar from '@/components/TopBar';

interface NotificationListProps {
  showSnackbar: (message: string, type: string) => void;
}

export default function NotificationListScreen({ showSnackbar }: NotificationListProps) {
  const { auth } = useAuth();
  const { notifications, markAsRead, chats } = useFirebase().firebaseState;

  const handleNotificationPress = (notification : any) => {
    if (notification.data.snapId) {
      router.push({
        pathname: '/screens/snap',
        params: { snapId: notification.data.snapId.toString() },
      });
    } else if (notification.data.chat_id) {
      const chat = chats.find((chat) => chat.id === notification.data.chat_id);
      if (chat && chat.lastMessage?.sender !== auth?.user?.username) {
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
        params: { chatId: notification.data.chat_id },
      });
    }
  };

  useEffect(() => {
    markAsRead();
  } , []);

  const formatDate = (date : Date) => {
    const options = { 
      year: 'numeric' as const,
      month: 'short' as const,
      day: 'numeric' as const,
      hour: '2-digit' as const,
      minute: '2-digit' as const };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  return (
    <View style={styles.container}>
      <TopBar showSnackbar={showSnackbar} type="back" showNotifications={false} />
      {notifications.length === 0 ? (
        <Text style={styles.noNotificationsText}>No notifications found.</Text>
      ) : (
        <FlatList
          data={notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
          keyExtractor={(item, index) => `${item.data.post_id || item.data.chat_id}-${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.notificationItem}
              onPress={() => handleNotificationPress(item)}
            >
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationBody}>{item.body}</Text>
              <Text style={styles.notificationDate}>{formatDate(item.date)}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  noNotificationsText: {
    textAlign: 'center',
    marginTop: 20,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  notificationTitle: {
    fontWeight: 'bold',
  },
  notificationBody: {
    marginTop: 4,
    color: '#555',
  },
  notificationDate: {
    marginTop: 4,
    color: '#999',
  },
});

