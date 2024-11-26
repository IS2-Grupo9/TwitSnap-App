import { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Text, Image, Share } from 'react-native';
import { useAuth } from '@/components/contexts/AuthContext';
import { router, useGlobalSearchParams } from 'expo-router';
import { ExtendedSnap } from '@/components/types/models';
import { ActivityIndicator, Card } from 'react-native-paper';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import EditSnapModal from '@/components/modals/EditSnapModal';
import DeleteSnapModal from '@/components/modals/DeleteSnapModal';
import TopBar from '@/components/TopBar';
import ShareSnapModal from '@/components/modals/ShareSnapModal';

interface SnapScreenProps {
  showSnackbar: (message: string, type: string) => void;
}

export default function SnapScreen({ showSnackbar }: SnapScreenProps) {
  const { auth, logout } = useAuth();
  const { snapId, creatorId } = useGlobalSearchParams<{ snapId: string, creatorId: string }>();
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;
  const postApiUrl = process.env.EXPO_PUBLIC_POSTS_URL;
  const interactionsApiUrl = process.env.EXPO_PUBLIC_INTERACTIONS_URL;
  const statsApiUrl = process.env.EXPO_PUBLIC_STATISTICS_URL;

  const [snap, setSnap] = useState<ExtendedSnap | null>(null);
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [shareCount, setShareCount] = useState<number | null>(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedSnap, setEditedSnap] = useState<ExtendedSnap | null>(null);
  const [editedSnapMessage, setEditedSnapMessage] = useState('');

  const [snapToDelete, setSnapToDelete] = useState<number | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const [shareModalVisible, setShareModalVisible] = useState(false);

  const [loading, setLoading] = useState(true);

  const formatDate = (date: string | undefined) => {
    if (!date) return 'N/A';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    return new Date(date).toLocaleDateString(undefined, options);
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

  const fetchStats = async () => {
    try {
      const response = await fetch(`${statsApiUrl}/statistics/posts/${snapId}/creator/${creatorId}/viewer/${auth.user?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        return;
      }
      const likes = await response.json();
      setLikeCount(likes.data.like_counter);
      setShareCount(likes.data.share_counter);
    } catch (error) {
      showSnackbar('Failed to fetch like count.', 'error');
    }
  }

  const loadSnap = async () => {
    try {
      if (!snapId) return;
      const response = await fetch(`${postApiUrl}/snaps/${snapId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        showSnackbar('Failed to fetch snap.', 'error');
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
      fetchStats();
      setLoading(false);
    } catch (error) {
      showSnackbar('Failed to fetch snap.', 'error');
    }
  }

  useEffect(() => {
    loadSnap();
  }, [snapId]);
  
  return (
    <>
      <TopBar showSnackbar={showSnackbar} type="back" showNotifications />
      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#65558F" />
        ) : (
          <View style={styles.snapContainer}>
            <View>
              <Text style={styles.id}>Snap ID: {snap?.id}</Text>
              {snap?.is_share && (
                <TouchableOpacity onPress={() => goToProfile(snap?.user_share || '')} style={styles.sharedContainer}>
                  <Text style={styles.sharedText}>Shared by {snap?.shared_username || 'Unknown'}</Text>
                  <MaterialIcons name="repeat" size={18} color="#65558F" />
                </TouchableOpacity>
              )}
              <View style={styles.profileHeader}>
                <TouchableOpacity onPress={() => goToProfile(snap?.user)}>
                  <Image style={styles.avatar} source={require('@/assets/images/avatar.png')} />
                </TouchableOpacity>
                <Text style={styles.username}>{snap?.username || 'Unknown'}</Text>
              </View>
              {snap?.is_private && 
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                  <Text style={styles.details}>Private snap</Text>
                  <Ionicons name="lock-closed" size={15} color="#65558F" style={{ marginLeft: 5, marginBottom: 2 }} />
                </View>
              }
              <Text style={styles.details}>Created at: {formatDate(snap?.created_at)}</Text>
              <Text style={styles.details}>Updated at: {formatDate(snap?.updated_at)}</Text>
            </View>
            <View style={styles.divider} />
            <View>
              <Text style={styles.details}>Message:</Text>
              <Card style={styles.messageCard}>
                <Card.Content>
                  <Text style={styles.message}>{snap?.message}</Text>
                </Card.Content>
              </Card>
            </View>
            <View style={styles.divider} />
            <View style={styles.iconContainer}>
              <Ionicons
                name={snap?.liked ? 'heart' : 'heart-outline'}
                size={25}
                color="#65558F"
                onPress={() => handleLikeSnap(snap?.id, snap?.liked)}
              />
              <Text style={styles.likesCount}>{likeCount ? `${likeCount} like` + (likeCount > 1 ? 's' : '') : ''}</Text>
              <View style={{ width: 10 }} />
              <MaterialIcons
                name={snap?.shared ? 'repeat-on' : 'repeat'}
                size={25}
                color="#65558F"
                onPress={() => handleShareSnap(snap?.id, snap?.user, snap?.shared)}
              />
              <Text style={styles.likesCount}>{shareCount ? `${shareCount} share` + (shareCount > 1 ? 's' : '') : ''}</Text>
              <View style={{ width: 10 }} />
              <MaterialIcons
                name="share"
                size={25}
                color="#65558F"
                onPress={() => {
                  setShareModalVisible(true);                  
                }}
              />
              {snap?.editable && (
                <View style={styles.editIcons}>
                  <Ionicons
                    name="pencil-outline"
                    size={20}
                    color="#65558F"
                    onPress={() => handleEditSnap(snap)}
                  />
                  <View style={{ width: 15 }} />
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color="#65558F"
                    onPress={() => handleDeleteSnap(snap.id)}
                  />
                </View>
              )}
            </View>
          </View>
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
        <ShareSnapModal
          showSnackbar={showSnackbar}
          shareModalVisible={shareModalVisible}
          setShareModalVisible={setShareModalVisible}
          snapToShare={snap}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
  },
  snapContainer: {
    flex: 1,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    justifyContent: 'space-between',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  id: {
    fontSize: 10,
    color: '#888',
    marginBottom: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 20,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 5,
  },
  editIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 'auto',
  },
  details: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  messageCard: {
    backgroundColor: 'white',
    marginTop: 10,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: 'black',
    textAlignVertical: 'top',
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  likesCount: {
    marginLeft: 10,
    fontSize: 14,
    color: '#555',
  },
  sharedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sharedText: {
    color: '#65558F',
    fontSize: 14,
  },
  divider: {
    borderBottomColor: 'rgba(0, 0, 0, 0.5)',
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  
});