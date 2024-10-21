import React, { useState } from 'react';
import { View, Modal, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

interface DeleteSnapModalProps {
    showSnackbar: (message: string, type: string) => void;
    deleteModalVisible: boolean;
    setDeleteModalVisible: (visible: boolean) => void;
    snapToDelete: number | null;
    setSnapToDelete: (snapId: number | null) => void;
    loadSnaps: () => void;
}

export default function DeleteSnapModal({
  showSnackbar,
  deleteModalVisible,
  setDeleteModalVisible,
  snapToDelete,
  setSnapToDelete,
  loadSnaps
}: DeleteSnapModalProps) {
    const { auth } = useAuth();
    
    const postsApiUrl = process.env.EXPO_PUBLIC_POSTS_URL;

    const [loadingDeleteModal, setLoadingDeleteModal] = useState(false);

    const handleConfirmDeleteSnap = async () => {
      if (snapToDelete === null) return;
        setLoadingDeleteModal(true);
      try {
        const response = await fetch(`${postsApiUrl}/snaps/${snapToDelete}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
    
        if (!response.ok) {
          const message = await response.text();
          showSnackbar(JSON.parse(message).detail || 'Failed to delete snap.', 'error');
          setLoadingDeleteModal(false);
          setDeleteModalVisible(false);
          setSnapToDelete(null);
          return;
        }
    
        setLoadingDeleteModal(false);
        setDeleteModalVisible(false);
        setSnapToDelete(null);
        loadSnaps();
      } catch (error) {
        showSnackbar('An error occurred. Please try again later.', 'error');
        setLoadingDeleteModal(false);
        setDeleteModalVisible(false);
        setSnapToDelete(null);
      }
    };
  
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={{ marginBottom: 20, color: 'black' }}>Are you sure you want to delete this snap?</Text>
            {loadingDeleteModal ? (
              <ActivityIndicator size="large" color="#65558F" />
            ) : (
              <Button
                mode="contained"
                onPress={handleConfirmDeleteSnap}
                buttonColor="#FF6347"
                textColor="#FFFFFF"
                style={styles.modalButton}
              >
                Delete
              </Button>
            )}
            <Button
              mode="text"
              onPress={() => setDeleteModalVisible(false)}
              style={styles.cancelButton}
            >
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