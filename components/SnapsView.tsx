import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Image, RefreshControl, View, TouchableOpacity, Modal, TextInput } from 'react-native';
import { ActivityIndicator, Card, Text, Button, TextInput as PaperTextInput } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/components/contexts/AuthContext';
import { ExtendedSnap, User } from '@/components/types/models';
import CreateSnapModal from './modals/CreateSnapModal';
import EditSnapModal from './modals/EditSnapModal';
import DeleteSnapModal from './modals/DeleteSnapModal';

interface SnapsViewProps {
  showSnackbar: (message: string, type: string) => void;
  feed?: boolean;
  searchType?: string;
}

export default function SnapsView({ showSnackbar, feed, searchType }: SnapsViewProps) {
  const { auth, logout } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [snaps, setSnaps] = useState<ExtendedSnap[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMade, setSearchMade] = useState(feed || false);
  
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;

  // TODO: Do through gateway API with authorization
  const postsApiUrl = process.env.EXPO_PUBLIC_POSTS_URL;
  const interactionsApiUrl = process.env.EXPO_PUBLIC_INTERACTIONS_URL;
  const statisticsApiUrl = process.env.EXPO_PUBLIC_STATISTICS_URL;

  const [createModalVisible, setCreateModalVisible] = useState(false);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedSnap, setEditedSnap] = useState<ExtendedSnap | null>(null);
  const [editedSnapMessage, setEditedSnapMessage] = useState('');

  const [snapToDelete, setSnapToDelete] = useState<number | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const [currentSnapLikes, setCurrentSnapLikes] = useState(0);
  const [currentSnapShares, setCurrentSnapShares] = useState(0);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalLoading, setInfoModalLoading] = useState(false);

  const [likedSnaps, setLikedSnaps] = useState<number[]>([]);
  const [sharedSnaps, setSharedSnaps] = useState<number[]>([]);


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
      if (response.ok) {
        const users = await response.json();
        const userDict: { [key: string]: string } = {};
        users.forEach((user: any) => {
          userDict[user.id] = user.username;
        });
        return userDict;
      } else if (response.status === 401) {
        showSnackbar('Session expired. Please log in again.', 'error');
        logout();
        return {};
      } else {
        showSnackbar('Failed to fetch usernames.', 'error');
        return {};
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

  const handleDeleteSnap = (snapId: number) => {
    setSnapToDelete(snapId);
    setDeleteModalVisible(true);
  };

  const handleLikeSnap = async (snapId: number, liked: boolean) => {
    const method = liked ? 'DELETE' : 'POST';
    const action = liked ? 'unlike' : 'like';
    try {
      const response = await fetch(`${interactionsApiUrl}/interactions/${action}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: auth.user?.id.toString(), post_id: snapId.toString() }),
      });
      if (!response.ok) {
        console.log(response.status);
        showSnackbar(`Failed to ${action} snap.`, 'error');
        return;
      }
      const updatedSnaps = snaps.map(snap => {
        if (snap.ID === snapId) {
          snap.liked = !liked;
        }
        return snap;
      });
      setSnaps(updatedSnaps);
      if (liked) {
        setLikedSnaps(likedSnaps.filter(id => id !== snapId));
      } else {
        setLikedSnaps([...likedSnaps, snapId]);
      }
      showSnackbar(`Snap ${action}d.`, 'success');
    } catch (error) {
      showSnackbar(`Failed to ${action} snap.`, 'error');
    }      
  };

  const handleShareSnap = async (snapId: number, userId: string, shared: boolean) => {
    const method = shared ? 'DELETE' : 'POST';
    const action = shared ? 'unshare' : 'share';
    try {
      const response = await fetch(`${interactionsApiUrl}/interactions/${action}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_user_id: userId.toString(),
          user_id: auth.user?.id.toString(),
          post_id: snapId.toString(),
        }),
      });
      if (!response.ok) {
        showSnackbar(`Failed to ${action} snap.`, 'error');
        return;
      }
      const updatedSnaps = snaps.map(snap => {
        if (snap.ID === snapId) {
          snap.shared = !shared;
        }
        return snap;
      });
      setSnaps(updatedSnaps);
      if (shared) {
        setSharedSnaps(sharedSnaps.filter(id => id !== snapId));
      } else {
        setSharedSnaps([...sharedSnaps, snapId]);
      }
      showSnackbar(`Snap ${action}d.`, 'success');
    } catch (error) {
      showSnackbar(`Failed to ${action} snap.`, 'error');
    }      
  };

  const handleInfoModal = async (snapId: number) => {
    setInfoModalVisible(true);
    setInfoModalLoading(true);
    try {
      const response = await fetch(`${statisticsApiUrl}/statistics/posts/${snapId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        showSnackbar('Failed to fetch snap information.', 'error');
        return;
      }
      const likes = await response.json();
      setCurrentSnapLikes(likes.data.like_counter);
      setCurrentSnapShares(likes.data.share_counter);
      setInfoModalLoading(false);
    } catch (error) {
      setInfoModalVisible(false);
      setInfoModalLoading(false);
      showSnackbar('Failed to fetch snap information.', 'error');
    }
  }

  const goToProfile = (userId: string) => {
    const state = navigation.getState();
    if (userId === String(auth.user?.id)){
      if (state && !state.routes.find(route => route.name === 'screens/my-profile')){
        router.push('/screens/my-profile');
      }
    }
    else {
      if (state && !state.routes.find(route => route.name === 'screens/user-profile')){
        
      router.push({
        pathname: '/screens/user-profile',
        params: { userId: userId },
      });
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
        return [];
      }
    }
    catch (error: any) {
      showSnackbar('Error searching snaps.', 'error');
      console.error('Error searching snaps:', error.message);
      return [];
    }
  }

  const fetchLikedSnaps = async () => {
    try {
      const response = await fetch(`${interactionsApiUrl}/interactions/users/${auth.user?.id}/likes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        console.log(response.status);
        showSnackbar('Failed to fetch liked snaps.', 'error');
        return [];
      }
      const likes = await response.json();
      const likedSnaps = likes.data.map((like: any) => like.post_id);
      setLikedSnaps(likedSnaps);
      return likedSnaps;
    } catch (error) {
      showSnackbar('Failed to fetch liked snaps.', 'error');
      return [];
    }
  }

  const fetchSharedSnaps = async () => {
    try {
      const response = await fetch(`${interactionsApiUrl}/interactions/users/${auth.user?.id}/shares`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        showSnackbar('Failed to fetch shared snaps.', 'error');
        return [];
      }
      const shares = await response.json();
      const sharedSnaps = shares.data.map((share: any) => share.post_id);
      setSharedSnaps(sharedSnaps);
      return sharedSnaps;
    } catch (error) {
      showSnackbar('Failed to fetch shared snaps.', 'error');
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
      const lsnaps = await fetchLikedSnaps();
      const ssnaps = await fetchSharedSnaps();
      const completedSnaps = snaps.data?.map((snap: any) => ({
        ...snap,
        liked: Array.isArray(lsnaps) && lsnaps.includes(snap.ID),
        shared: Array.isArray(ssnaps) && ssnaps.includes(snap.ID),
        editable: snap.user === String(auth.user?.id),
        username: 'Unknown',
      }));
      completedSnaps.sort((a: ExtendedSnap, b: ExtendedSnap) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      return completedSnaps;
    } catch (error : any) {
      console.error('Error fetching snaps:', error.message);
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
        setSearchMade(true);
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
            keyboardShouldPersistTaps="handled"
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
                    size={30}
                    color="#65558F"
                    style={styles.iconButton}
                    onPress={() => handleLikeSnap(snap.ID, snap.liked)}
                  />
                  <View style={{width: 5}} />
                  <Ionicons
                    name={snap.shared ? 'arrow-redo' : 'arrow-redo-outline'}
                    size={30}
                    color="#65558F"
                    style={styles.iconButton}
                    onPress={() => handleShareSnap(snap.ID, snap.user, snap.shared)}
                  />
                  <View style={{width: 5}} />
                  <Ionicons
                    name="information-circle-outline"
                    size={30}
                    color="#65558F"
                    style={styles.iconButton}
                    onPress={() => handleInfoModal(snap.ID)}
                  />
                </Card.Actions>
              </Card>
            ))}
            <View style={{ height: 100 }}>
              <Text style={{ textAlign: 'center', color: '#65558F', marginTop: 20 }}>
                {snaps.length === 0 && searchMade ? 'No snaps found' : ''}
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
      <CreateSnapModal
        showSnackbar={showSnackbar}
        createModalVisible={createModalVisible}
        setCreateModalVisible={setCreateModalVisible}
        loadSnaps={loadSnaps}
      />
      <EditSnapModal
        showSnackbar={showSnackbar}
        editModalVisible={editModalVisible}
        setEditModalVisible={setEditModalVisible}
        editedSnap={editedSnap}
        editedSnapMessage={editedSnapMessage}
        setEditedSnapMessage={setEditedSnapMessage}
        loadSnaps={loadSnaps}
      />
      <DeleteSnapModal
        showSnackbar={showSnackbar}
        deleteModalVisible={deleteModalVisible}
        setDeleteModalVisible={setDeleteModalVisible}
        snapToDelete={snapToDelete}
        setSnapToDelete={setSnapToDelete}
        loadSnaps={loadSnaps}
      />
      <Modal transparent={true} visible={infoModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {infoModalLoading ? (
              <ActivityIndicator size="large" color="#65558F" />
            ) : (
              <View style={{ width: '100%' }}>
                <Text style={styles.modalTitle}>Snap Information</Text>
                <Text style={styles.modalText}>Likes: {currentSnapLikes}</Text>
                <Text style={styles.modalText}>Shares: {currentSnapShares}</Text>
              </View>
            )}
            <Button mode="text" onPress={() => setInfoModalVisible(false)} style={styles.cancelButton}>
              Close
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
  input: { 
    marginVertical: 10,
    backgroundColor: 'transparent' 
  },
  scrollContainer: {
    flex: 1,
    justifyContent: 'center',
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
  cancelButton: {
    marginTop: 10,
  },
});