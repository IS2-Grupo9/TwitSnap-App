import React, { useState } from 'react';
import { View, Modal, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { ExtendedSnap } from '../types/models';

interface EditSnapModalProps {
    showSnackbar: (message: string, type: string) => void;
    editModalVisible: boolean;
    setEditModalVisible: (visible: boolean) => void;
    editedSnap: ExtendedSnap | null;    
    editedSnapMessage: string;
    setEditedSnapMessage: (message: string) => void;
    loadSnaps: () => void;
}

export default function EditSnapModal({
  showSnackbar,
  editModalVisible,
  setEditModalVisible,
  editedSnap,
  editedSnapMessage,
  setEditedSnapMessage,
  loadSnaps
}: EditSnapModalProps) {
    const { auth } = useAuth();
    
    const postsApiUrl = process.env.EXPO_PUBLIC_POSTS_URL;

    const [loadingEditModal, setLoadingEditModal] = useState(false);

    const handleSubmitEditSnap = async () => {
      setLoadingEditModal(true);
      try {
        if (!editedSnapMessage.trim()) {
          showSnackbar('Snap message cannot be empty!', 'error');
          setLoadingEditModal(false);
          setEditModalVisible(false);
          return;
        }

        const response = await fetch(`${postsApiUrl}/snaps/${editedSnap?.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            message: editedSnapMessage
          }),
        });

        if (!response.ok) {
          const message = await response.text();
          showSnackbar(JSON.parse(message).detail || 'Failed to edit snap.', 'error');
          setLoadingEditModal(false);
          setEditModalVisible(false);
          return;
        }

        const newSnap = await response.json();
        setLoadingEditModal(false);
        setEditModalVisible(false);
        setEditedSnapMessage('');
        
        loadSnaps();
      }
      catch (error) {
        showSnackbar('An error occurred. Please try again later.', 'error');
        setEditModalVisible(false);
        setLoadingEditModal(false);
      }
    }
  
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Snap</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Edit your snap..."
              value={editedSnapMessage}
              onChangeText={setEditedSnapMessage}
              multiline
            />
            {loadingEditModal ? (
              <ActivityIndicator size="large" color="#65558F" />
            ) : (
              <Button
                mode="contained"
                onPress={handleSubmitEditSnap}
                buttonColor="#65558F"
                textColor="#FFFFFF"
                style={styles.modalButton}
              >
                Save Changes
              </Button>
            )}
            <Button mode="text" onPress={() => setEditModalVisible(false)} style={styles.cancelButton}>
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