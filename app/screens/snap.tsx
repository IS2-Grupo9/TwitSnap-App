import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Image } from 'react-native';
import { useAuth } from '@/components/contexts/AuthContext';
import { router, useGlobalSearchParams } from 'expo-router';
import { ExtendedSnap } from '@/components/types/models';
import { ActivityIndicator, Card } from 'react-native-paper';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import EditSnapModal from '@/components/modals/EditSnapModal';
import DeleteSnapModal from '@/components/modals/DeleteSnapModal';
import TopBar from '@/components/TopBar';

interface SnapScreenProps {
  showSnackbar: (message: string, type: string) => void;
}

export default function SnapScreen({ showSnackbar }: SnapScreenProps) {
  const { auth, logout } = useAuth();
  const { snapId } = useGlobalSearchParams<{ snapId: string }>();
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;
  const postApiUrl = process.env.EXPO_PUBLIC_POSTS_URL;
  const interactionsApiUrl = process.env.EXPO_PUBLIC_INTERACTIONS_URL;

  const [snap, setSnap] = useState<ExtendedSnap | null>(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedSnap, setEditedSnap] = useState<ExtendedSnap | null>(null);
  const [editedSnapMessage, setEditedSnapMessage] = useState('');

  const [snapToDelete, setSnapToDelete] = useState<number | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const [loading, setLoading] = useState(true);

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

  const handleEditSnap = (snap: ExtendedSnap) => {
    setEditModalVisible(true);
    setEditedSnap(snap);
    setEditedSnapMessage(snap.message);
  }

  const handleDeleteSnap = (snapId: number) => {
    setSnapToDelete(snapId);
    setDeleteModalVisible(true);
  };

  const handleLikeSnap = async (snapId: number | undefined, liked: boolean | undefined) => {
    if (!snapId || liked === undefined) return;
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
        showSnackbar(`Failed to ${action} snap.`, 'error');
        return;
      }
      loadSnap();
      showSnackbar(`Snap ${action}d.`, 'success');
    } catch (error) {
      showSnackbar(`Failed to ${action} snap.`, 'error');
    }      
  };

  const handleShareSnap = async (snapId: number | undefined, userId: string | undefined, shared: boolean | undefined) => {
    if (!snapId || !userId || shared === undefined) return;
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
      loadSnap();
      showSnackbar(`Snap ${action}d.`, 'success');
    } catch (error) {
      showSnackbar(`Failed to ${action} snap.`, 'error');
    }      
  };

  const goToProfile = (userId: string | undefined) => {
    if (!userId) return;
    if (userId === String(auth.user?.id)){
      router.push('/screens/my-profile');
    }
    else {
      router.push({
        pathname: '/screens/user-profile',
        params: { userId: userId },
      });
    }
  }

  const fetchLiked = async () => {
    try {
      const response = await fetch(`${interactionsApiUrl}/interactions/users/${auth.user?.id}/likes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        showSnackbar('Failed to fetch liked snaps.', 'error');
        return false;
      }
      const likedSnaps = await response.json();
      const likedSnapIds = likedSnaps.data.map((like: any) => like.post_id);
      return likedSnapIds.includes(snapId);      
    } catch (error) {
      showSnackbar('Failed to fetch liked snaps.', 'error');
      return false;
    }
  }

  const fetchShared = async () => {
    try {
      const response = await fetch(`${interactionsApiUrl}/interactions/users/${auth.user?.id}/shares`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        showSnackbar('Failed to fetch shared snaps.', 'error');
        return false;
      }
      const shares = await response.json();
      const sharedSnaps = shares.data.map((share: any) => share.post_id);
      return sharedSnaps.includes(snapId);
    } catch (error) {
      showSnackbar('Failed to fetch shared snaps.', 'error');
      return false;
    }
  }

  const loadSnap = async () => {
    try {
      const response = await fetch(`${postApiUrl}/snaps/${snapId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        router.push('/(tabs)/home');
        return;
      }
      const snap = (await response.json()).data;
      const userDict = await fetchUsersById([snap.user, snap.user_share]);
      snap.username = userDict[snap.user];
      snap.shared_username = userDict[snap.user_share];
      snap.liked = await fetchLiked();
      snap.shared = await fetchShared();
      snap.editable = snap.user.toString() === auth.user?.id.toString();
      setSnap(snap);
      setLoading(false);
    } catch (error) {
      showSnackbar('Failed to fetch snap.', 'error');
      router.push('/(tabs)/home');
    }
  }

  useEffect(() => {
    loadSnap();
  }, [snapId]);
  
  return (
    <>
    <TopBar type='back' showNotifications={true} />
      <View style={styles.container}>
          {loading ? ( 
            <ActivityIndicator size="large" color="#65558F" />
          ) : (
            <Card style={styles.snapCard}>
              {snap?.is_share && (
                <TouchableOpacity onPress={() => goToProfile(snap?.user_share || '')}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, marginLeft: 10 }}
                >
                  <Text style={styles.sharedStyle}>SnapShared by {snap?.shared_username || 'Unknown'}</Text>
                  <MaterialIcons name="repeat" size={18} color="#65558F"
                    style={{ paddingLeft: 5, marginBottom: 2 }}
                  />
                </TouchableOpacity>
              )}
              <Card.Title
                title={
                  <TouchableOpacity onPress={() => goToProfile(snap?.user)}>
                    <Text style={styles.titleStyle}>{snap?.username || 'Unkwown'}</Text>
                  </TouchableOpacity>
                }
                subtitle={
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={styles.subtitleStyle}>
                      {formatDate(snap?.created_at, snap?.updated_at)}
                    </Text>
                    {snap?.is_private && (
                      <Ionicons name="lock-closed" size={15} color="#65558F" style={{ marginLeft: 8, marginBottom: 5 }} />
                    )}
                  </View>
                }
                titleStyle={styles.titleStyle}
                subtitleStyle={styles.subtitleStyle}
                left={() => (
                  <TouchableOpacity onPress={() => goToProfile(snap?.user)}>
                    <Image style={styles.avatar} source={require('@/assets/images/avatar.png')} />
                  </TouchableOpacity>
                )}
                right={() => (
                    snap?.editable && (
                      <View style={styles.topActions}>
                        <TouchableOpacity onPress={() => handleEditSnap(snap)}>
                          <Ionicons name="pencil" size={18} color="#65558F" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteSnap(snap.id)}>
                          <Ionicons name="trash" size={18} color="#65558F" />
                        </TouchableOpacity>
                      </View>
                    )
                )}
              />
              <Card.Content>
                <Text style={styles.message}>{snap?.message}</Text>
              </Card.Content>
              <Card.Actions style={styles.bottomActions}>
                <Ionicons
                  name={snap?.liked ? 'heart' : 'heart-outline'}
                  size={30}
                  color="#65558F"
                  style={styles.iconButton}
                  onPress={() => handleLikeSnap(snap?.id, snap?.liked)}
                />
                <View style={{width: 5}} />
                <MaterialIcons
                  name={snap?.shared ? "repeat-on" : "repeat"}
                  size={30}
                  color="#65558F"
                  style={styles.iconButton}
                  onPress={() => handleShareSnap(snap?.id, snap?.user, snap?.shared)}
                />
                <View style={{width: 5}} />
              </Card.Actions>
            </Card>
          )}
        <EditSnapModal
          showSnackbar={showSnackbar}
          editModalVisible={editModalVisible}
          setEditModalVisible={setEditModalVisible}
          editedSnap={editedSnap}
          editedSnapMessage={editedSnapMessage}
          setEditedSnapMessage={setEditedSnapMessage}
          loadSnaps={loadSnap}
        />
        <DeleteSnapModal
          showSnackbar={showSnackbar}
          deleteModalVisible={deleteModalVisible}
          setDeleteModalVisible={setDeleteModalVisible}
          snapToDelete={snapToDelete}
          setSnapToDelete={setSnapToDelete}
          loadSnaps={loadSnap}
        />
      </View>    
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white', height: '100%', alignContent: 'center', justifyContent: 'center' },
  tabContainer: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white' },
  scrollView: { flex: 1 },
  snapCard: {
    backgroundColor: '#ffffff',
    height: '100%',
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
  sharedStyle: {
    fontSize: 14,
    color: '#65558F',
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
});