import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useAuth } from '@/components/contexts/AuthContext';
import { Chat, Message, User } from '@/components/types/models';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Button } from 'react-native-paper';
import UsersView from '@/components/UsersView';

interface ChatListScreenProps {
  showSnackbar: (message: string, type: string) => void;
}

export default function ChatListScreen( { showSnackbar }: ChatListScreenProps) {
  const { auth, logout } = useAuth();
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;
  const [chats, setChats] = useState<Chat[]>([]);
  const [showCreateChatModal, setShowCreateChatModal] = useState(false);
  const [createChatModalLoading, setCreateChatModalLoading] = useState(false);
  const [newChatUsername, setNewChatUsername] = useState('');

  const [suggestedUsersVisible, setSuggestedUsersVisible] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [loadingSuggestedUsers, setLoadingSuggestedUsers] = useState(true);
  const [suggestedSearchMade, setSuggestedSearchMade] = useState(false);

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

  const selectUser = (username: string) => {
    setNewChatUsername(username);
    setSuggestedUsersVisible(false);
  }

  const handleCreateChat = async () => {
    console.log('Creating chat with:', newChatUsername);
    setShowCreateChatModal(false);
  }

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('chats')
      .where('participants', 'array-contains', auth?.user?.username)
      .onSnapshot(snapshot => {
        const chatsData : Chat[] = snapshot.docs.map(doc => ({
          id: doc.id,
          participants: doc.data().participants,
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
          messages: doc.data().messages,          
          lastMessage: doc.data().messages[doc.data().messages.length - 1] || null,
        }));
        setChats(chatsData);
      });

    return unsubscribe;
  }, [auth?.user?.username]);

  // Navigate to chat screen
  const handleChatPress = (chat : Chat) => {
    const otherUsername = chat.participants.find(username => username !== auth?.user?.username);
  };

  return (
    <View style={styles.container}>
      {chats.length === 0 && <Text>No chats found.</Text>}
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatItem} onPress={() => handleChatPress(item)}>
            <Text style={styles.chatTitle}>{item.lastMessage?.sender}: {item.lastMessage?.text}</Text>
            <Text style={styles.chatSubtitle}>Last message at {item.updatedAt?.toLocaleString()}</Text>
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
              Create Chat
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
  container: { flex: 1, padding: 16, backgroundColor: '#f0f0f0' },
  chatItem: { 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: '#ddd' 
  },
  chatTitle: { 
    fontWeight: 'bold', 
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
