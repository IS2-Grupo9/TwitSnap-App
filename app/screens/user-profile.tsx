import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Modal, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Button, Card, Chip } from 'react-native-paper';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/components/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from '@/components/types/models';
import UsersView from '@/components/UsersView';
import { router, useGlobalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface UserProfileScreenProps {
  showSnackbar: (message: string, type: string) => void;
}

export default function UserProfileScreen({ showSnackbar }: UserProfileScreenProps) {
  const { auth, logout } = useAuth();
  const { userId } = useGlobalSearchParams<{ userId: string }>();
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;
  const [user, setUser] = useState<User>({
    id: 0,
    username: '',
    email: '',
    location: 'Not specified',
    interests: '',
    createdAt: '',
    updatedAt: '',
    private: false,
  });
  const [isPrivate, setIsPrivate] = useState(user.private); 
  const [parsedInterests, setParsedInterests] = useState<string[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [followingUser, setFollowingUser] = useState(false);
  const [isfollowingMe, setIsFollowingMe] = useState(false);

  const [isFollowInfoModalVisible, setFollowInfoModalVisible] = useState(false);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [followInfoType, setFollowInfoType] = useState('following');

  const formatDate = (dateString: string | undefined) => {
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
          userDict[user.id] = user;
        });
        return userDict;
      } else if (response.status === 401) {
        showSnackbar('Session expired. Please log in again.', 'error');
        logout();
        return {};
      } else {
        showSnackbar('Failed to fetch users for follow info.', 'error');
        return {};
      }
    } catch (error) {
      showSnackbar('Failed to fetch users for follow info.', 'error');
      return {};
    }
  };

  const fetchFollowInfo = async () => {
    try {
      const followsResponse = await fetch(`${apiUrl}/interactions/users/${userId}/follows`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
      });
      if (!followsResponse.ok) {
        if (followsResponse.status === 401) {
          showSnackbar('Session expired. Please log in again.', 'error');
          logout();
        } else {
          showSnackbar('Failed to fetch follow data.', 'error');
        }
        return;
      }
      const followersResponse = await fetch(`${apiUrl}/interactions/users/${userId}/followers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
      });
      if (!followersResponse.ok) {
        if (followersResponse.status === 401) {
          showSnackbar('Session expired. Please log in again.', 'error');
          logout();
        } else {
          showSnackbar('Failed to fetch follow data.', 'error');
        }
        return;
      }
      const followsData = await followsResponse.json();
      const followersData = await followersResponse.json();
      const followsIds = followsData.data.map((follow: any) => follow.followed_id);
      const followersIds = followersData.data.map((follow: any) => follow.follower_id);

      if (followersIds.includes(auth.user?.id.toString())) {
        setFollowingUser(true);
      } else {
        setFollowingUser(false);
      }

      if (followsIds.includes(auth.user?.id.toString())) {
        setIsFollowingMe(true);
      } else {
        setIsFollowingMe(false);
      }

      const followIds = followsIds.concat(followersIds);
      
      if (followIds.length > 0) {
        const users = await fetchUsersById(followIds);
        setFollowers(followersIds.map((id: string) => users[id]));
        setFollowing(followsIds.map((id: string) => users[id]));
      }
    } catch (error) {
      showSnackbar('Failed to fetch follow information.', 'error');
    }
  }  

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const response = await fetch(`${apiUrl}/users/user?id=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        const interests = data.interests?.split(',').map((interest: string) => interest.trim()) || [];
        setParsedInterests(interests);
        await fetchFollowInfo();
      } else if (response.status === 401) {
        showSnackbar('Session expired. Please log in again.', 'error');
        logout();
      } else {
        showSnackbar('Failed to fetch profile data. Please try again.', 'error');
      }
    } catch (error) {
      showSnackbar('An error occurred. Please try again later.', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await fetch(`${apiUrl}/interactions/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          follower_id: auth.user?.id.toString(),
          followed_id: userId.toString(),
        }),
      });

      if (response.ok) {
        setFollowingUser(true);
        showSnackbar('User followed.', 'success');
      } else if (response.status === 401) {
        showSnackbar('Session expired. Please log in again.', 'error');
        logout();
      } else {      
        showSnackbar('Failed to follow user.', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to follow user.', 'error');
    }
  }

  const handleUnfollow = async () => {
    try {
      const response = await fetch(`${apiUrl}/interactions/unfollow`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          follower_id: auth.user?.id.toString(),
          followed_id: userId.toString(),
        }),
      });

      if (response.ok) {
        setFollowingUser(false);
        showSnackbar('User unfollowed.', 'success');
      } else if (response.status === 401) {
        showSnackbar('Session expired. Please log in again.', 'error');
        logout();
      } else {
        showSnackbar('Failed to unfollow user.', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to unfollow user.', 'error');
    }
  }
  
  const goToProfileFeed = (userId: any) => {
    router.push({
      pathname: '/screens/profile-feed',
      params: { userId : userId.toString() },
    });
  }

  useEffect(() => {
    fetchProfile();
  }, [followingUser]);

  return (
    <>
      <TopBar showSnackbar={showSnackbar} type="back" showNotifications={true} />
      <LinearGradient colors={["#EADDFF", "#FFFFFF"]} style={styles.container}>
        {loadingProfile ? (
          <ActivityIndicator size="large" color="#65558F" />
        ) : (
          <View style={styles.avatarContainer}>
            <Image style={styles.avatar} source={require("@/assets/images/avatar.png")} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.title}>{user.username}</Text>  
              {user.verified === 'verified' && (
                <Ionicons name="checkmark-circle" size={26} color="#65558F" style={{ marginLeft: 8, marginBottom: 5}} />
              )}
              {user.private && (
                <Ionicons name="lock-closed" size={20} color="#65558F" style={{ marginLeft: 8, marginBottom: 5}} />
              )}
            </View>
            {!user.private ? (
              <>
                <Text style={styles.subtitle}>{user.email}</Text>
                <Text style={styles.subtitle}>Location: {user.location || 'Not specified'}</Text>
                <Text style={styles.subtitle}>Join date: {formatDate(user.createdAt)}</Text>
                <Text style={styles.subtitle}>Last updated: {formatDate(user.updatedAt)}</Text>
                {user.interests && (
                  <View style={{ justifyContent: "center", alignItems: "center" }}>
                    <Text style={styles.sectionTitle}>Interests</Text>
                    <ScrollView horizontal style={styles.chipContainer}>
                      {parsedInterests.map((interest, index) => (
                        <Chip
                          key={index}
                          style={styles.chip}
                          textStyle={{ color: "#65558F" }}
                          mode="outlined"
                        >
                          {interest}
                        </Chip>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </>
            ) : (
              <Text style={styles.subtitle}>Join date: {formatDate(user.createdAt)}</Text>
            )}
            {isfollowingMe && (
              <Text style={{ color: "#65558F", fontWeight: "bold", fontSize: 16, paddingTop: 20 }}>
                Follows you
              </Text>
            )}
            {(!user.private || (isfollowingMe && followingUser)) && (
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
                <Button
                  mode="outlined"
                  labelStyle={styles.followInfo}
                  onPress={() => {
                    setFollowInfoType("following");
                    setFollowInfoModalVisible(true);
                  }}
                >
                  Following: {following.length}
                </Button>
                <View style={{ width: 10 }} />
                <Button
                  mode="outlined"
                  labelStyle={styles.followInfo}
                  onPress={() => {
                    setFollowInfoType("followers");
                    setFollowInfoModalVisible(true);
                  }}
                >
                  Followers: {followers.length}
                </Button>
              </View>
            )}
            <Button
              mode="contained"
              style={styles.followButton}
              onPress={() => (followingUser ? handleUnfollow() : handleFollow())}
            >
              {followingUser ? "Unfollow" : "Follow"}
            </Button>
            <View style={{ position: 'absolute', bottom: 0, right: 0 }}>
              {(!user.private || followingUser) && (
                <TouchableOpacity onPress={() => goToProfileFeed(userId)} style={styles.snapsButton}>
                  <Ionicons name="document-text-outline" size={24} color="#65558F" />
                  <Text style={{ color: '#65558F', fontWeight: 'bold', textAlign: 'center' }}>Snaps</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </LinearGradient>
      <Modal transparent visible={isFollowInfoModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {followInfoType === "following" ? "Following" : "Followers"}
            </Text>
            <ScrollView style={styles.scrollContainer}>
              <UsersView
                users={followInfoType === "following" ? following : followers}
                redirect
                small
                searchMade
                closeModal={() => setFollowInfoModalVisible(false)}
              />
            </ScrollView>
            <Button mode="text" onPress={() => setFollowInfoModalVisible(false)} style={styles.cancelButton}>
              Close
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: 'white' },
  avatar: { width: 200, height: 200, borderRadius: 100, marginBottom: 20 },
  avatarContainer: { alignItems: 'center', height: '100%', justifyContent: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', lineHeight: 32, color: '#65558F', textAlign: 'center' },
  subtitle: { fontSize: 16, fontWeight: 'bold', color: '#65558F', textAlign: 'center', marginTop: 10 },
  followButton: { marginTop: 20, paddingHorizontal: 20 },
  snapsButton: { justifyContent: 'flex-end', alignItems: 'center', marginTop: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#65558F', marginTop: 20, textAlign: 'left' },
  chipContainer: { 
    flexDirection: 'row', 
    marginTop: 10,
    maxHeight: 40,
  },
  chip: { backgroundColor: '#EADDFF', marginRight: 5, color: '#65558F' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: 300, padding: 20, backgroundColor: '#ffffff', borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', padding: 10, marginVertical: 10, borderColor: '#cccccc', borderWidth: 1, borderRadius: 5 },
  inputLabel: { alignSelf: 'flex-start', marginBottom: 5, fontWeight: 'bold' },
  modalButton: { marginTop: 20, paddingHorizontal: 20 },
  cancelButton: { marginTop: 10 },
  scrollContainer: { maxHeight: 300, width: '100%' },
  followInfo: { color: '#65558F', fontWeight: 'bold', fontSize: 16},
  followInfoModalContent: { height: '40%' },
});
