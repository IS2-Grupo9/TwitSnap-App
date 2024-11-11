import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Button, KeyboardAvoidingView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '@/components/contexts/AuthContext';
import { Message } from '@/components/types/models';
import TopBar from '@/components/TopBar';
import { useGlobalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native-paper';

export default function ChatScreen() {
  const { chatId } = useGlobalSearchParams<{ chatId: string }>();
  const { auth } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true);
      try {
        const chatDoc = await firestore().collection('chats').doc(chatId).get();
        setParticipants(chatDoc.data()?.participants || []);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch participants:", error);
        setLoading(false);
      }
    };
    fetchParticipants();
  }, [chatId]);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('chats')
      .doc(chatId)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .onSnapshot(snapshot => {
        const fetchedMessages: Message[] = snapshot.docs.map(doc => ({
          id: doc.id,
          sender: doc.data().sender,
          text: doc.data().text,
          createdAt: doc.data().createdAt,
        }));
        setMessages(fetchedMessages);
      });

    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async () => {
    if (newMessage.trim()) {
      const currentUser = auth?.user;
      const messageData = {
        sender: currentUser?.username,
        text: newMessage,
        createdAt: new Date(),
      };

      try {
        await firestore()
          .collection('chats')
          .doc(chatId)
          .collection('messages')
          .add(messageData);

        await firestore()
          .collection('chats')
          .doc(chatId)
          .update({
            lastMessage: {
              ...messageData,
            },
            unreadCount: firestore.FieldValue.increment(1),
          });

        setNewMessage('');
      } catch (error) {
        console.error("Error sending message:", error);
      }
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <TopBar type="back" showNotifications={true} />
      <View style={styles.chatContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#65558F" style={styles.loading} />
        ) : (
          <>
            <View>
              <Text style={styles.title}>Chat with {participants.filter((p) => p !== auth?.user?.username).join(', ')}</Text>
              <View style={styles.divider} />
            </View>
            <FlatList
              data={messages}
              inverted
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.messageContainer}>
                  {messages[messages.indexOf(item) + 1]?.sender !== item.sender && (
                    <Text style={[styles.senderText, item.sender === auth?.user?.username ? { textAlign: 'right' } : { textAlign: 'left' }]}>
                      {item.sender}
                    </Text>
                  )}
                  <View style={[styles.message, item.sender === auth?.user?.username ? styles.myMessage : styles.otherMessage]}>
                    <Text style={styles.messageText}>{item.text}</Text>
                  </View>
                </View>
              )}
            />
          </>
        )}
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message"
          value={newMessage}
          onChangeText={setNewMessage}
          onSubmitEditing={handleSend}
        />
        <Button title="Send" onPress={handleSend} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  chatContainer: { flex: 1, justifyContent: 'center' },
  loading: { alignSelf: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', margin: 10, color: '#000', textAlign: 'center' },
  messageContainer: { flex: 1, flexDirection: 'column', padding: 10 },
  divider: { flex: 1, borderBottomColor: 'rgba(0, 0, 0, 0.5)', borderBottomWidth: StyleSheet.hairlineWidth },
  senderText: { fontSize: 12, color: '#6c757d', marginBottom: 4, textAlign: 'right' },
  message: { padding: 15, borderRadius: 15, maxWidth: '75%' },
  myMessage: { alignSelf: 'flex-end', backgroundColor: '#74b9ff', borderTopRightRadius: 0 },
  otherMessage: { alignSelf: 'flex-start', backgroundColor: '#687076', borderTopLeftRadius: 0 },
  messageText: { fontSize: 16, color: '#fff' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#fff' },
  input: { flex: 1, height: 40, borderColor: '#ccc', borderWidth: 1, borderRadius: 20, paddingHorizontal: 15, marginRight: 10 },
});
