import React, { useEffect, useRef, useState } from 'react';
import { View, Modal, TextInput, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types/models';
import UsersView from '../UsersView';

interface CreateSnapModalProps {
    showSnackbar: (message: string, type: string) => void;
    createModalVisible: boolean;
    setCreateModalVisible: (visible: boolean) => void;
    loadSnaps: () => void;
}

export default function CreateSnapModal({
  showSnackbar,
  createModalVisible,
  setCreateModalVisible,
  loadSnaps
}: CreateSnapModalProps) {
    const { auth, logout } = useAuth();
    
    const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL
    const postsApiUrl = process.env.EXPO_PUBLIC_POSTS_URL;

    const [newSnapMessage, setNewSnapMessage] = useState('');
    const [loadingCreateModal, setLoadingCreateModal] = useState(false);

    const [suggestedUsersVisible, setSuggestedUsersVisible] = useState(false);
    const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
    const [loadingSuggestedUsers, setLoadingSuggestedUsers] = useState(true);
    const [suggestedSearchMade, setSuggestedSearchMade] = useState(false);

    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSubmitSnap = async () => {
      setLoadingCreateModal(true);
      try {
        if (!newSnapMessage.trim()) {
          showSnackbar('Snap message cannot be empty!', 'error');
          setLoadingCreateModal(false);
          setCreateModalVisible(false);
          return;
        }
  
        const id = String(auth.user?.id || '');
        const response = await fetch(`${postsApiUrl}/snaps`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            user: id,
            message: newSnapMessage
          }),
        });
  
        if (!response.ok) {
          const message = await response.text();
          showSnackbar(JSON.parse(message).detail || 'Failed to create snap.', 'error');
          setLoadingCreateModal(false);
          setCreateModalVisible(false);
          return;
        }
  
        const newSnap = await response.json();
        setLoadingCreateModal(false);
        setCreateModalVisible(false);
        setNewSnapMessage('');
        loadSnaps();
      } catch (error) {
        showSnackbar('An error occurred. Please try again later.', 'error');
        setCreateModalVisible(false);
        setLoadingCreateModal(false);
      }
    };

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


    const handleTextChange = async (newSnapMessage: string) => {
      setNewSnapMessage(newSnapMessage);
      setSuggestedUsersVisible(false);
      try { 
        // Use a timeout to debounce the search
        if (debounceTimeoutRef.current) {
          clearTimeout(debounceTimeoutRef.current);
        }
        debounceTimeoutRef.current = setTimeout(async () => {
          const cursorPosition = newSnapMessage.length;
          const textBeforeCursor = newSnapMessage.substring(0, cursorPosition);
          const lastWordBeforeCursor = textBeforeCursor.split(' ').pop();      
          // Check the last word, if it starts with '@', show suggested users  
          if (lastWordBeforeCursor?.startsWith('@') && lastWordBeforeCursor.length > 1) {
            setSuggestedUsersVisible(true);
            await searchUsers(lastWordBeforeCursor.substring(1));
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
      const lastAt = newSnapMessage.lastIndexOf('@');
      if (lastAt === -1) return;
      const newText = newSnapMessage.substring(0, lastAt) + `@${user.username} `;
      setNewSnapMessage(newText);
      setSuggestedUsersVisible(false);
    }
  
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Snap</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What's on your mind?"
              value={newSnapMessage}
              onChangeText={handleTextChange}
              multiline
            />
            {loadingCreateModal ? (
              <ActivityIndicator size="large" color="#65558F" />
            ) : (
            <Button
              mode="contained"
              onPress={handleSubmitSnap}
              buttonColor="#65558F"
              textColor="#FFFFFF"
              style={styles.modalButton}
            >
              Create Snap
            </Button>
            )}
            <Button mode="text" onPress={() => setCreateModalVisible(false)} style={styles.cancelButton}>
              Cancel
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
    );

}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'black',
  },
  textInput: {
    width: '100%',
    textAlignVertical: 'top',
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  modalButton: {
    marginTop: 20,
    paddingHorizontal: 20
  },
  cancelButton: {
    marginTop: 10
  },
  input: { 
    marginVertical: 10,
    backgroundColor: 'transparent' 
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