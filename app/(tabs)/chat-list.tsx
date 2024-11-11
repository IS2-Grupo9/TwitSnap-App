import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '@/components/contexts/AuthContext';
import { Chat, Message, User } from '@/components/types/models';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Button } from 'react-native-paper';
import UsersView from '@/components/UsersView';
import { router } from 'expo-router';

import { useFirebase } from '@/components/contexts/FirebaseContext';

interface ChatListScreenProps {
  showSnackbar: (message: string, type: string) => void;
}

export default function ChatListScreen( { showSnackbar } : ChatListScreenProps) {
  const { auth, logout } = useAuth();
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;
  const [showCreateChatModal, setShowCreateChatModal] = useState(false);
  const [createChatModalLoading, setCreateChatModalLoading] = useState(false);
  const [newChatUser, setNewChatUser] = useState<User | null>(null);
  const [newChatUsername, setNewChatUsername] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const [suggestedUsersVisible, setSuggestedUsersVisible] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loadingSuggestedUsers, setLoadingSuggestedUsers] = useState(true);
  const [suggestedSearchMade, setSuggestedSearchMade] = useState(false);
  const { chats } = useFirebase().firebaseState;

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchUsers = async (searchQuery: string) => {
    try {
      setLoadingSuggestedUsers(true);
      const response = await fetch(`${apiUrl}/users/search?username=${searchQuery}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',          
        },
      });
      if (response.ok) {
        const data = await response.json();
        // Only keep the first 5 results
        data.splice(5);
        setSuggestedUsers(data);
        setSuggestedSearchMade(true);
      } else if (response.status === 401) {
        showSnackbar('Session expired. Please log in again.', 'error');
        logout();
      } else {
        setSuggestedUsers([]);
        setSuggestedSearchMade(true);
      }
    }
    catch (error: any) {
      showSnackbar('Error getting user suggestions:', 'error');
      console.error('Error getting user suggestions:', error.message);
    }
    finally {
      setLoadingSuggestedUsers(false);
    }
  }


  const handleTextChange = async (newUsername: string) => {
    setNewChatUsername(newUsername);
    setSuggestedUsersVisible(false);
    try { 
      // Use a timeout to debounce the search
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(async () => {
        const cursorPosition = newUsername.length;
        const textBeforeCursor = newUsername.substring(0, cursorPosition);
        const lastWordBeforeCursor = textBeforeCursor.split(' ').pop() || '';    
        // Show suggested users  
        if (lastWordBeforeCursor.length > 0) {
          setSuggestedUsersVisible(true);
          await searchUsers(lastWordBeforeCursor);
        } else {
          setSuggestedUsersVisible(false);
        }
      }, 500);  
    }
    catch (error: any) {
      showSnackbar('Error getting user suggestions:', 'error');
      console.error('Error getting user suggestions:', error.message);
    }     
  }

  const selectUser = (user: User) => {
    setNewChatUser(user);
    setNewChatUsername(user.username);
    setSuggestedUsersVisible(false);
  }

  const handleCreateChat = async () => {
    try {
      if (!newChatUser?.username.trim()) {
        showSnackbar('Please enter a username.', 'error');
        return;
      }
      if (!newMessage.trim()) {
        showSnackbar('Please enter a message.', 'error');
        return;
      }
      if (newChatUser?.username === auth?.user?.username) {
        showSnackbar('You cannot create a chat with yourself.', 'error');
        return;
      }
  
      const participant1 = auth?.user?.id.toString();
      const participant2 = newChatUser?.id.toString();
      if (!participant2) {
        showSnackbar('User not found.', 'error');
        return;
      }
      const sortedParticipants = [participant1, participant2].sort();
      const chatId = `${sortedParticipants[0]}_${sortedParticipants[1]}`;
  
      const chatRef = firestore().collection('chats').doc(chatId);
      const chatSnapshot = await chatRef.get();
  
      if (chatSnapshot.exists) {
        await chatRef.update({
          updatedAt: new Date(),
          lastMessage: {
            sender: auth?.user?.username,
            text: newMessage,
            createdAt: new Date(),
          },
          unreadCount: firestore.FieldValue.increment(1),
        });
      } else {
        setCreateChatModalLoading(true);
        await chatRef.set({
          createdAt: new Date(),
          updatedAt: new Date(),
          participants: [auth?.user?.username, newChatUser?.username],
          lastMessage: {
            sender: auth?.user?.username,
            text: newMessage,
            createdAt: new Date(),
          },
          unreadCount: 1,
        });
      }
  
      // Add the message to the `messages` subcollection
      await chatRef.collection('messages').add({
        sender: auth?.user?.username,
        text: newMessage,
        createdAt: new Date(),
      });
  
      router.setParams({ chatId: chatId });
    } catch (error: any) {
      showSnackbar('Error creating chat:', 'error');
      console.error('Error creating chat:', error.message);
    } finally {
      setCreateChatModalLoading(false);
      setNewChatUser(null);
      setNewMessage('');
      setShowCreateChatModal(false);
    }
  };
 

  const formatFirestoreTimestamp = (timestamp : any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  // Navigate to chat screen
  const handleChatPress = (chat : Chat) => {
    if (chat.lastMessage?.sender !== auth?.user?.username) {
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
    router.setParams({ chatId : chat.id });
    router.push({
      pathname: '/screens/chat',
      params: { chatId : chat.id },
    });
  };

  return (
    <View style={styles.container}>
      {chats.length === 0 && <Text style={{ textAlign: 'center', marginTop: 20 }}>No chats found.</Text>}
      <FlatList
        data={chats.sort((a, b) => b.lastMessage?.createdAt.toDate() - a.lastMessage?.createdAt.toDate())}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatItem} onPress={() => handleChatPress(item)}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.chatTitle}>{item.participants.filter(p => p !== auth?.user?.username).join(', ')}</Text>
              {(item.unreadCount && item.lastMessage?.sender !== auth?.user?.username) ? (
                <View style={{ backgroundColor: '#30AE30', borderRadius: 50, padding: 5, height: 30, width: 30, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: 'white' }}>{item.unreadCount}</Text>
                </View>
              ) : (
                <View style={{ backgroundColor: 'transparent', borderRadius: 50, padding: 5, height: 30, width: 30, justifyContent: 'center', alignItems: 'center' }} />
              )}
            </View>
            <Text style={styles.chatMessage}>{item.lastMessage?.sender}: {item.lastMessage?.text}</Text>
            <Text style={styles.chatSubtitle}>Last message at {formatFirestoreTimestamp(item.lastMessage?.createdAt)}</Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.floatingButton} onPress={() => setShowCreateChatModal(true)}>
        <Ionicons name="add-outline" size={36} color="white" />
      </TouchableOpacity>
      <Modal transparent={true} visible={showCreateChatModal} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Chat</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter username"
              value={newChatUsername}
              onChangeText={handleTextChange}
            />
            <TextInput
              style={styles.textMessageInput}
              placeholder="Type your message"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
            />
            {createChatModalLoading ? (
              <ActivityIndicator size="large" color="#65558F" />
            ) : (
            <Button
              mode="contained"
              onPress={handleCreateChat}
              buttonColor="#65558F"
              textColor="#FFFFFF"
              style={styles.modalButton}
            >
              Create
            </Button>
            )}
            <Button mode="text" onPress={() => setShowCreateChatModal(false)} style={styles.cancelButton}>
              Close
            </Button>
          </View>
        </View>
        {suggestedUsersVisible && (
            <View style={styles.suggestionsContainer}>
              {loadingSuggestedUsers ? (
                <ActivityIndicator size="small" color="#65558F" style={{ marginVertical: 20 }} />
              ) : (
                <ScrollView
                  keyboardShouldPersistTaps="handled"
                >
                  <UsersView
                    users={suggestedUsers}
                    setSelectedUser={selectUser}
                    redirect={false}
                    small={true}
                    searchMade={suggestedSearchMade}
                  />
                </ScrollView>
              )}
            </View>
          )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: 'white' },
  chatItem: { 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#ddd' 
  },
  chatTitle: { 
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 10,
    color: '#000'
  },
  chatMessage: { 
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#65558F' 
  },
  chatSubtitle: { 
    color: '#888' 
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#65558F',
    borderRadius: 50,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    color: 'black',
    marginBottom: 10,
  },
  modalButton: {
    marginTop: 20,
    paddingHorizontal: 20
  },
  cancelButton: {
    marginTop: 10,
  },
  textInput: {
    width: '100%',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  textMessageInput: {
    width: '100%',
    height: 100,
    textAlignVertical: 'top',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  suggestionsContainer: {
    position: 'absolute',
    backgroundColor: 'white',
    borderColor: '#65558F',
    borderWidth: 1,
    top: '75%',
    left: '25%',
    width: '50%',
    maxHeight: 100,
    zIndex: 1000,
  },
});
