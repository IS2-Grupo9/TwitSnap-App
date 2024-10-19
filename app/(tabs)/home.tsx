import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Image, RefreshControl, View, TouchableOpacity, Modal, TextInput } from 'react-native';
import { ActivityIndicator, Card, Text, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/components/contexts/AuthContext';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

interface Snap {
  ID: number;
  message: string;
  user: string;
  created_at: string;
  updated_at: string;
  username?: string;
  liked?: boolean;
  editable?: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
  location: string;
  interests: string;
  created_at: string;
  updated_at: string;
}

interface HomeScreenProps {
  showSnackbar: (message: string, type: string) => void;
  targetUser: string;
  setTargetUser: (user: string) => void;
}

export default function HomeScreen({ showSnackbar, targetUser, setTargetUser }: HomeScreenProps) {
  const { auth } = useAuth();
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;
  const postsApiUrl = process.env.EXPO_PUBLIC_POSTS_URL;

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newSnapMessage, setNewSnapMessage] = useState('');
  const [loadingCreateModal, setLoadingCreateModal] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedSnap, setEditedSnap] = useState<Snap | null>(null);
  const [editedSnapMessage, setEditedSnapMessage] = useState('');
  const [loadingEditModal, setLoadingEditModal] = useState(false);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [snapToDelete, setSnapToDelete] = useState<number | null>(null);
  const [loadingDeleteModal, setLoadingDeleteModal] = useState(false);

  const formatDate = (created_at: string | undefined, updated_at: string | undefined) => {
    const dateString = updated_at || created_at;
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const fetchUsersById = async (userIds: string[]) => {
    try {
      // Remove user IDs that are not numbers and duplicates
      userIds = userIds.filter((id) => !isNaN(Number(id)));
      userIds = Array.from(new Set(userIds));
      const response = await fetch(`${apiUrl}/users/users?ids=${userIds}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      if (!response.ok) {
        showSnackbar('Failed to fetch usernames.', 'error');
        return {};
      } else {
        const users = await response.json();
        const userDict: { [key: string]: string } = {};
        users.forEach((user: any) => {
          userDict[user.id] = user.username;
        });
        return userDict;
      }
    } catch (error) {
      showSnackbar('Failed to fetch usernames.', 'error');
      return {};
    }
  };

  const fetchSnaps = async () => {
    setLoading(true);
    const response = await fetch(`${postsApiUrl}/snaps`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      showSnackbar('Failed to fetch snaps.', 'error');
      setLoading(false);
      return;
    }
    const snaps = await response.json();
    const userNames = await fetchUsersById(snaps.data?.map((snap: any) => snap.user));
    const completedSnaps = snaps.data?.map((snap: any) => ({
      ...snap,
      liked: false,
      editable: snap.user === String(auth.user?.id),
      username: userNames[snap.user] || 'Unknown',
    }));
    completedSnaps.sort((a: Snap, b: Snap) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    setSnaps(completedSnaps);
    setLoading(false);
  };

  const handleCreateSnap = () => {
    setCreateModalVisible(true);
  };

  const handleEditSnap = (snap: Snap) => {
    setEditModalVisible(true);
    setEditedSnap(snap);
    setEditedSnapMessage(snap.message);
  }

  const handleSubmitSnap = async () => {
    // TODO: Do through gateway API with authorization
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
      fetchSnaps();
    } catch (error) {
      showSnackbar('An error occurred. Please try again later.', 'error');
      setCreateModalVisible(false);
      setLoadingCreateModal(false);
    }
  };

  const handleSubmitEditSnap = async () => {
    setLoadingEditModal(true);
    try{
      if (!editedSnapMessage.trim()) {
        showSnackbar('Snap message cannot be empty!', 'error');
        return;
      }

      const response = await fetch(`${postsApiUrl}/snaps/${editedSnap?.ID}`, {
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
      fetchSnaps();
    }
    catch (error) {
      showSnackbar('An error occurred. Please try again later.', 'error');
      setEditModalVisible(false);
      setLoadingEditModal(false);
    }
  }

  const handleDeleteSnap = (snapId: number) => {
    setSnapToDelete(snapId);
    setDeleteModalVisible(true);
  };

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
      fetchSnaps();
    } catch (error) {
      showSnackbar('An error occurred. Please try again later.', 'error');
      setLoadingDeleteModal(false);
      setDeleteModalVisible(false);
      setSnapToDelete(null);
    }
  };

  const handleLikeSnap = (snapId: number) => {
    const updatedSnaps = snaps.map(snap => {
      if (snap.ID === snapId) {
        return { ...snap, liked: !snap.liked };
      }
      return snap;
    });
    setSnaps(updatedSnaps);
  };

  const goToProfile = (userId: string) => {
    const state = navigation.getState();
    if (userId === String(auth.user?.id)){
      if (state && !state.routes.find(route => route.name === 'screens/my-profile')){
        router.push('/screens/my-profile');
      }
    }
    else {
      setTargetUser(userId);
      if (state && !state.routes.find(route => route.name === 'screens/user-profile')){
        router.push('/screens/user-profile');
      }
    }
  }

  useEffect(() => {
    fetchSnaps();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchSnaps} colors={['#65558F']} />
        }
      >
        {snaps.map(snap => (
          <Card key={snap.ID} style={styles.snapCard}>
            <Card.Title
              title={
                <TouchableOpacity onPress={() => goToProfile(snap.user)}>
                  <Text style={styles.titleStyle}>{snap.username || 'Unkwown'}</Text>
                </TouchableOpacity>
              }
              subtitle={formatDate(snap.created_at, snap.updated_at)}
              titleStyle={styles.titleStyle}
              subtitleStyle={styles.subtitleStyle}
              left={() => (
                <TouchableOpacity onPress={() => goToProfile(snap.user)}>
                  <Image style={styles.avatar} source={require('@/assets/images/avatar.png')} />
                </TouchableOpacity>
              )}
              right={() => (
                  snap.editable && (
                    <View style={styles.topActions}>
                      <TouchableOpacity onPress={() => handleEditSnap(snap)}>
                        <Ionicons name="pencil" size={18} color="#65558F" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteSnap(snap.ID)}>
                        <Ionicons name="trash" size={18} color="#65558F" />
                      </TouchableOpacity>
                    </View>
                  )
              )}
            />
            <Card.Content>
              <Text style={styles.message}>{snap.message}</Text>
            </Card.Content>
            <Card.Actions style={styles.bottomActions}>
              <Ionicons
                name={snap.liked ? 'heart' : 'heart-outline'}
                size={24}
                color="#65558F"
                style={styles.iconButton}
                onPress={() => handleLikeSnap(snap.ID)}
              />
              <Text style={styles.interactionCount}>3</Text>
              <Ionicons
                name="arrow-redo-outline"
                size={24}
                color="#65558F"
                style={styles.iconButton}
                onPress={() => console.log('SnapShare')}
              />
              <Text style={styles.interactionCount}>5</Text>
            </Card.Actions>
          </Card>
        ))}
        <View style={{ height: 100 }}>
          <Text style={{ textAlign: 'center', color: '#65558F', marginTop: 20 }}>
            {snaps.length === 0 ? 'No snaps available' : ''}
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.floatingButton} onPress={handleCreateSnap}>
        <Ionicons name="create-outline" size={36} color="white" />
      </TouchableOpacity>
      {/* Create Snap Modal */}
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
      {/* Edit Snap Modal */}
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
      {/* Delete Snap Modal */}
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
            <Button
              mode="contained"
              onPress={handleConfirmDeleteSnap}
              buttonColor="#FF6347"
              textColor="#FFFFFF"
              style={styles.modalButton}
            >
              Delete
            </Button>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  scrollView: { flex: 1 },
  snapCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#4c669f',
    borderRadius: 0,
    paddingRight: 20,
    paddingLeft: 10,
    paddingVertical: 10,
  },
  titleStyle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  subtitleStyle: {
    fontSize: 14,
    color: 'black',
    marginBottom: 5,
  },
  bottomActions: {
    justifyContent: 'flex-start',
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 60,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 20,
  },
  message: {
    fontSize: 16,
    marginVertical: 10,
    paddingVertical: 10,
    color: 'black',
  },
  iconButton: {
    borderRadius: 0,
    padding: 0,
  },
  interactionCount: {
    marginLeft: 5,
    color: '#65558F',
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
});