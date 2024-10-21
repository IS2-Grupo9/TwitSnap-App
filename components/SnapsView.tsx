import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Image, RefreshControl, View, TouchableOpacity, Modal, TextInput } from 'react-native';
import { ActivityIndicator, Card, Text, Button, TextInput as PaperTextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/components/contexts/AuthContext';
import { ExtendedSnap } from '@/components/types/models';

interface SnapsViewProps {
  showSnackbar: (message: string, type: string) => void;
  targetUser: string;
  setTargetUser: (user: string) => void;
  feed?: boolean;
  searchType?: string;
}

export default function SnapsView({ showSnackbar, targetUser, setTargetUser, feed, searchType }: SnapsViewProps) {
  const { auth } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [snaps, setSnaps] = useState<ExtendedSnap[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;

  // TODO: Do through gateway API with authorization
  const postsApiUrl = process.env.EXPO_PUBLIC_POSTS_URL;

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newSnapMessage, setNewSnapMessage] = useState('');
  const [loadingCreateModal, setLoadingCreateModal] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedSnap, setEditedSnap] = useState<ExtendedSnap | null>(null);
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

  
  const handleCreateSnap = () => {
    setCreateModalVisible(true);
  };

  const handleEditSnap = (snap: ExtendedSnap) => {
    setEditModalVisible(true);
    setEditedSnap(snap);
    setEditedSnapMessage(snap.message);
  }

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

  const handleSubmitEditSnap = async () => {
    setLoadingEditModal(true);
    try {
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
      
      loadSnaps();
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
      loadSnaps();
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

  const handleSearch = async () => {
    try {
      const response = await fetch(`${postsApiUrl}/search/${searchType}?${searchType}=${searchQuery}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        const sortedSnaps = data?.data.sort((a: ExtendedSnap, b: ExtendedSnap) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        return sortedSnaps;
      } else {
        const error = await response.json();
        showSnackbar('Error searching snaps.', 'error');
        console.log('Error searching snaps:', error);
        return [];
      }
    }
    catch (error: any) {
      showSnackbar('Error searching snaps.', 'error');
      console.error('Error searching snaps:', error.message);
      return [];
    }
  }

  
  const fetchSnaps = async () => {
    try {
      const response = await fetch(`${postsApiUrl}/snaps`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        showSnackbar('Failed to fetch snaps.', 'error');
        return [];
      }
      const snaps = await response.json();
      const completedSnaps = snaps.data?.map((snap: any) => ({
        ...snap,
        liked: false,
        editable: snap.user === String(auth.user?.id),
        username: 'Unknown',
      }));
      completedSnaps.sort((a: ExtendedSnap, b: ExtendedSnap) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      return completedSnaps;
    } catch (error) {
      showSnackbar('Failed to fetch snaps.', 'error');
      return [];
    }
  };

  const loadSnaps = async () => {
    setLoading(true);
    try {
      let fetchedSnaps: ExtendedSnap[] = [];
      if (feed) {
        fetchedSnaps = await fetchSnaps();
      } else {
        if (searchQuery.trim() === '') {
          showSnackbar('Please enter a search query.', 'error');
          setLoading(false);
          return;
        }
        fetchedSnaps = await handleSearch();
      }
      if (fetchedSnaps.length === 0) {
        setSnaps([]);
        setLoading(false);
        return;
      }
      const userIds = fetchedSnaps.map(snap => snap.user);
      const userDict = await fetchUsersById(userIds);
      fetchedSnaps.forEach(snap => {
        snap.username = userDict[snap.user] || 'Unknown';
      });
      setSnaps(fetchedSnaps);
      setLoading(false);
    } catch (error) {
      showSnackbar('Failed to fetch snaps.', 'error');
      setLoading(false);
    }
  }

  useEffect(() => {
    if (feed) {
      loadSnaps();
    }
  }, []);

  return (
    <View style={feed ? styles.container : styles.tabContainer}>
      {!feed && (
        <PaperTextInput
        style={styles.input}
        value={searchQuery}
        right={<PaperTextInput.Icon icon="magnify" onPress={loadSnaps} />}
        onChangeText={setSearchQuery}
        label={ searchType === 'text' ? 'Search Snaps' : 'Search Hashtag' }
        mode="outlined"
        underlineColor='black'
        activeUnderlineColor='black'
        activeOutlineColor='#65558F'
        textColor='black'
        placeholderTextColor='black'
        theme={{
          colors: {
            background: 'white',
            onSurfaceVariant: 'rgba(0, 0, 0, 0.5)',
          },
        }}
        onSubmitEditing={loadSnaps}
        left={searchType === 'hashtag' ? <PaperTextInput.Affix text="#" /> : undefined}
      />
      )}
      <View style={{ ...styles.scrollContainer, marginTop: feed ? 0 : 20 }}>
        {!feed && loading ? ( 
          <ActivityIndicator size="large" color="#65558F" />
        ) :
          <ScrollView
            style={styles.scrollView}
            refreshControl={feed ? (
              <RefreshControl refreshing={loading} onRefresh={loadSnaps} colors={['#65558F']} />
            ) : undefined}
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
                {snaps.length === 0 ? 'No snaps found' : ''}
              </Text>
            </View>
          </ScrollView>
        }
      </View>
      { feed && (
        <TouchableOpacity style={styles.floatingButton} onPress={handleCreateSnap}>
          <Ionicons name="create-outline" size={36} color="white" />
        </TouchableOpacity>
      )}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  tabContainer: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white' },
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
  input: { 
    marginVertical: 10,
    backgroundColor: 'transparent' 
  },
  scrollContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});