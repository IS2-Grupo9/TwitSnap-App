import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Modal, TextInput, ScrollView } from 'react-native';
import { ActivityIndicator, Button, Card, Chip } from 'react-native-paper';
import { TopBar } from '@/components/TopBar';
import { useAuth } from '@/components/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from '@/components/types/models';
import UsersView from '@/components/UsersView';

interface MyProfileScreenProps {
  showSnackbar: (message: string, type: string) => void;
  targetUser: string;
  setTargetUser: (user: string) => void;
}

export default function MyProfileScreen({ showSnackbar, targetUser, setTargetUser }: MyProfileScreenProps) {
  const { auth, updateUserData } = useAuth();
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;
  const interactionsApiUrl = process.env.EXPO_PUBLIC_INTERACTIONS_URL;
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [user, setUser] = useState<User>({
    id: 0,
    username: '',
    email: '',
    location: 'Not specified',
    interests: '',
    createdAt: '',
    updatedAt: '',
  });
  const [parsedInterests, setParsedInterests] = useState<string[]>([]);
  const [usernameInput, setUsernameInput] = useState(user.username);
  const [locationInput, setLocationInput] = useState(user.location);
  const [interestInput, setInterestInput] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingEdit, setLoadingEdit] = useState(false);

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

  const handleProfileEdit = async () => {
    setLoadingEdit(true);
    try {
      if (!usernameInput) {
        showSnackbar('Username is required.', 'error');
        return;
      }
      
      const response = await fetch(`${apiUrl}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          username: usernameInput,
          location: locationInput,
          interests: interestInput,
        }),
      });

      if (response.ok) {
        fetchProfile();
        showSnackbar('Profile updated successfully!', 'success');
      } else if (response.status === 400) {
        const message = await response.text();
        showSnackbar(JSON.parse(message).error || 'Invalid input.', 'error');
      }
      else {
        showSnackbar('Failed to update profile. Please try again.', 'error');
      }
    } catch (error) {
      showSnackbar('An error occurred. Please try again later.', 'error');
    } finally {
      setLoadingEdit(false);
      setEditModalVisible(false);
    }
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
        showSnackbar('Failed to fetch users for follow info.', 'error');
        return {};
      } else {
        const users = await response.json();
        const userDict: { [key: string]: string } = {};
        users.forEach((user: any) => {
          userDict[user.id] = user;
        });
        return userDict;
      }
    } catch (error) {
      showSnackbar('Failed to fetch users for follow info.', 'error');
      return {};
    }
  };

  const fetchFollowInfo = async () => {
    try {
      const followsResponse = await fetch(`${interactionsApiUrl}/interactions/users/${auth.user?.id}/follows`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!followsResponse.ok) {
        showSnackbar('Failed to fetch follow data.', 'error');
        return;
      }
      const followersResponse = await fetch(`${interactionsApiUrl}/interactions/users/${auth.user?.id}/followers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!followersResponse.ok) {
        showSnackbar('Failed to fetch follow data.', 'error');
        return;
      }
      const followsData = await followsResponse.json();
      const followersData = await followersResponse.json();
      const followsIds = followsData.data.map((follow: any) => follow.followed_id);
      const followersIds = followersData.data.map((follow: any) => follow.follower_id);

      const followIds = followsIds.concat(followersIds);
      
      const users = await fetchUsersById(followIds);

      setFollowers(followersIds.map((id: string) => users[id]));
      setFollowing(followsIds.map((id: string) => users[id]));
    } catch (error) {
      showSnackbar('An error occurred. Please try again later.', 'error');
    }
  }   

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const response = await fetch(`${apiUrl}/users/profile`, {
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
        setUsernameInput(data.username);
        setLocationInput(data.location || 'Not specified');
        const interests = data.interests?.split(',').map((interest: string) => interest.trim()) || [];
        setUser(data);
        updateUserData(data);
        setParsedInterests(interests);
        setInterestInput(data.interests ? interests.join(', ') : '');
        await fetchFollowInfo();
      } else {
        showSnackbar('Failed to fetch profile data. Please try again.', 'error');
      }
    } catch (error) {
      showSnackbar('An error occurred. Please try again later.', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <>
      <TopBar type='back' />
      <LinearGradient colors={['#EADDFF', '#FFFFFF']} style={styles.container}>
        {loadingProfile ? (
          <ActivityIndicator size="large" color="#65558F" />
        ) : (
          <View style={styles.avatarContainer}>
            <Image style={styles.avatar} source={require('@/assets/images/avatar.png')} />
            <Text style={styles.title}>{user.username}</Text>
            <Text style={styles.subtitle}>{user.email}</Text>
            <Text style={styles.subtitle}>Location: {user.location}</Text>
            <Text style={styles.subtitle}>Join date: {formatDate(user.createdAt)}</Text>
            <Text style={styles.subtitle}>Last updated: {formatDate(user.updatedAt)}</Text>
            {user.interests && (
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.sectionTitle}>Interests</Text>
              <ScrollView horizontal={true} style={styles.chipContainer}>
                {parsedInterests.map((interest, index) => (
                  <Chip
                    key={index}
                    style={styles.chip}
                    textStyle={{ color: '#65558F' }}
                    mode="outlined"
                  >
                    {interest}
                  </Chip>
                ))}
              </ScrollView>
            </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <Button 
                mode='outlined'
                labelStyle={styles.followInfo}
                onPress={() => {
                  setFollowInfoType('following');
                  setFollowInfoModalVisible(true);
                }}
              >
                Following: {following.length}
              </Button>
              <View style={{ width: 10 }} />
              <Button
                mode='outlined'
                labelStyle={styles.followInfo}
                onPress={() => {
                  setFollowInfoType('followers');
                  setFollowInfoModalVisible(true);
                }}
              >
                Followers: {followers.length}
              </Button>
            </View>
            <Button
              mode="contained"
              onPress={() => setEditModalVisible(true)}
              buttonColor='#65558F'
              textColor='#FFFFFF'
              style={styles.editButton}
            >
              Edit Profile
            </Button>
          </View>
        )}
      </LinearGradient>
      <Modal transparent={true} visible={isEditModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={usernameInput}
              onChangeText={setUsernameInput}
              placeholderTextColor="#888"
            />
            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={locationInput}
              onChangeText={setLocationInput}
              placeholderTextColor="#888"
            />
            <Text style={styles.inputLabel}>Interests</Text>
            <TextInput
              style={styles.input}
              placeholder="Interests (comma separated)"
              value={interestInput}
              onChangeText={setInterestInput}
              placeholderTextColor="#888"
            />
            {loadingEdit ? (
              <ActivityIndicator size="large" color="#65558F" />
            ) : (
              <Button
                mode="contained"
                onPress={handleProfileEdit}
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
      <Modal transparent={true} visible={isFollowInfoModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{followInfoType === 'following' ? 'Following' : 'Followers'}</Text>
            <ScrollView style={styles.scrollContainer}>
              <UsersView
                users={followInfoType === 'following' ? following : followers}
                setSelectedUser={setTargetUser}
                redirect={true}
                small={true}
                searchMade={true}
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
  avatarContainer: { alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', lineHeight: 32, color: '#65558F', textAlign: 'center' },
  subtitle: { fontSize: 16, fontWeight: 'bold', color: '#65558F', textAlign: 'center', marginTop: 10 },
  editButton: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#65558F', marginTop: 20, textAlign: 'left' },
  chipContainer: { flexDirection: 'row', marginVertical: 10, maxHeight: 40 },
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
