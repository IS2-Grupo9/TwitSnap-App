import React, { useState } from 'react';
import { View, Modal, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

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
    const { auth } = useAuth();
    
    const postsApiUrl = process.env.EXPO_PUBLIC_POSTS_URL;

    const [newSnapMessage, setNewSnapMessage] = useState('');
    const [loadingCreateModal, setLoadingCreateModal] = useState(false);

    const handleSubmitSnap = async () => {
      setLoadingCreateModal(true);
      try {
        if (!newSnapMessage.trim()) {
          showSnackbar('Snap message cannot be empty!', 'error');
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
              onChangeText={setNewSnapMessage}
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
});