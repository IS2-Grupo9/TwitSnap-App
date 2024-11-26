import React, { useState } from 'react';
import { View, Modal, TextInput, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import { SocialIcon } from '@rneui/themed';
import { Text, Button } from 'react-native-paper';
import { ExtendedSnap } from '../types/models';

interface ShareSnapModalProps {
    showSnackbar: (message: string, type: string) => void;
    shareModalVisible: boolean;
    setShareModalVisible: (visible: boolean) => void;
    snapToShare: ExtendedSnap | null;
}

export default function ShareSnapModal({
  showSnackbar,
  shareModalVisible,
  setShareModalVisible,
  snapToShare
}: ShareSnapModalProps) {
    const [loadingShareModal, setLoadingShareModal] = useState(false);

    const handleShareSnap = async (social : string) => {
        setLoadingShareModal(true);
        try {
          if (snapToShare === null) return;
          const message = encodeURIComponent(
            `Shared from TwitSnap: \n${snapToShare.username} posted: "${snapToShare.message}"`
          );
          let url = '';
          if (social === 'whatsapp') {
            url = `whatsapp://send?text=${message}`;
          } else if (social === 'twitter') {
            url = `https://twitter.com/intent/tweet?text=${message}`;
          }
          await Linking.openURL(url);
        } catch (error) {
          showSnackbar('An error occurred. Please try again later.', 'error');
        } finally {
          setLoadingShareModal(false);
          setShareModalVisible(false);
        }
      };

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={shareModalVisible}
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Share snap on:</Text>
            {loadingShareModal ? (
              <ActivityIndicator size="large" color="#65558F" />
            ) : (
              <View style={styles.shareButtons}>
                <SocialIcon
                  type="whatsapp"
                  onPress={() => handleShareSnap('whatsapp')}
                />
                <SocialIcon
                  type="twitter"
                  onPress={() => handleShareSnap('twitter')}
                />
              </View>
            )}
            <Button
              mode="text"
              onPress={() => setShareModalVisible(false)}
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
  shareButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
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