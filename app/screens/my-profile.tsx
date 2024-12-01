import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Modal, TextInput, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Switch } from 'react-native-paper';
import TopBar from '@/components/TopBar';
import { useAuth } from '@/components/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from '@/components/types/models';
import UsersView from '@/components/UsersView';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFirebase } from '@/components/contexts/FirebaseContext';
import { router } from 'expo-router';

interface MyProfileScreenProps {
  showSnackbar: (message: string, type: string) => void;
}

export default function MyProfileScreen({ showSnackbar }: MyProfileScreenProps) {
  const { auth, updateUserData, logout } = useAuth();
  const { registerFCMToken } = useFirebase().firebaseState;
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
    private: false,
    verified: 'notVerified',
    fullName: '',
    IDPicture: '',
  });
  const [isPrivate, setIsPrivate] = useState(user.private); 
  const [parsedInterests, setParsedInterests] = useState<string[]>([]);
  const [usernameInput, setUsernameInput] = useState(user.username);
  const [locationInput, setLocationInput] = useState(user.location);
  const [interestInput, setInterestInput] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const [isVerifyModalVisible, setVerifyModalVisible] = useState(false);
  const [verified, setVerified] = useState(user.verified);
  const [fullNameInput, setFullNameInput] = useState('');
  const [IDPictureInput, setIDPictureInput] = useState('');
  const [loadingVerify, setLoadingVerify] = useState(false);

  const [isFollowInfoModalVisible, setFollowInfoModalVisible] = useState(false);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [followInfoType, setFollowInfoType] = useState('following');

  const [isVerifyInfoModalVisible, setVerifyInfoModalVisible] = useState(false);  

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

  const handleRequestVerification = async () => {
    setLoadingVerify(true);
    try {
      if (!fullNameInput || !IDPictureInput) {
        showSnackbar('Full name and ID picture URL are required.', 'error');
        return;
      }
      
      const response = await fetch(`${apiUrl}/users/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          fullName: fullNameInput,
          IDPicture: IDPictureInput,
        }),
      });

      if (response.ok) {
        showSnackbar('Verification request sent successfully!', 'success');
        setVerified('pending');
      } else if (response.status === 400) {
        const message = await response.text();
        showSnackbar(JSON.parse(message).error || 'Invalid input.', 'error');
      } else if (response.status === 401) {
        showSnackbar('Session expired. Please log in again.', 'error');
        logout();
      } else {
        showSnackbar('Failed to send verification request. Please try again.', 'error');
      }
    } catch (error) {
      showSnackbar('An error occurred. Please try again later.', 'error');
    } finally {
      setLoadingVerify(false);
      setVerifyModalVisible(false);
    }
  }

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
          _private: isPrivate,
        }),
      });

      if (response.ok) {
        await fetchProfile();
        registerFCMToken(usernameInput);
        showSnackbar('Profile updated successfully!', 'success');
      } else if (response.status === 400) {
        const message = await response.text();
        showSnackbar(JSON.parse(message).error || 'Invalid input.', 'error');
      } else if (response.status === 401) {
        showSnackbar('Session expired. Please log in again.', 'error');
        logout();
      } else {
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
        setIsPrivate(data.private);
        setVerified(data.verified);   
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

  const goToProfileFeed = (userId: any) => {
    router.push({
      pathname: '/screens/profile-feed',
      params: { userId : userId.toString() },
    });
  }

  const goToUserStats = (userId: any) => {
    router.push({
      pathname: '/screens/user-stats',
      params: { userId : userId.toString() },
    });
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <>
      <TopBar showSnackbar={showSnackbar} type='back' showNotifications={true} />
      <LinearGradient colors={['#EADDFF', '#FFFFFF']} style={styles.container}>
        {loadingProfile ? (
          <ActivityIndicator size="large" color="#65558F" />
        ) : (
          <View style={styles.avatarContainer}>
            <Image style={styles.avatar} source={require('@/assets/images/avatar.png')} />
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.title}>{user.username}</Text>
              {user.verified === 'verified' && (
                <TouchableOpacity onPress={() => setVerifyInfoModalVisible(true)}>
                  <Ionicons name="checkmark-circle" size={26} color="#65558F" style={{ marginLeft: 8, marginBottom: 5}} />
                </TouchableOpacity>
              )}
              {user.private && (
                <Ionicons name="lock-closed" size={20} color="#65558F" style={{ marginLeft: 8, marginBottom: 5}} />
              )}
            </View>
            <Text style={styles.subtitle}>{user.email}</Text>
            <Text style={styles.subtitle}>Location: {user.location || 'Not specified'}</Text>
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
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', margin: 20, width: '100%'}}>
              <TouchableOpacity onPress={() => goToUserStats(user.id)} style={styles.moreButton}>
                <Ionicons name="stats-chart-outline" size={24} color="#65558F" />
                <Text style={{ color: '#65558F', fontWeight: 'bold', textAlign: 'center' }}>Stats</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditModalVisible(true)} style={styles.moreButton}>
                <Ionicons name="pencil-outline" size={24} color="#65558F" />
                <Text style={{ color: '#65558F', fontWeight: 'bold', textAlign: 'center' }}>Edit</Text>
              </TouchableOpacity>
              {verified !== 'verified' && (
                <TouchableOpacity onPress={() => setVerifyModalVisible(true)} style={styles.moreButton}>
                  <Ionicons name="checkmark-circle-outline" size={24} color="#65558F" />
                  <Text style={{ color: '#65558F', fontWeight: 'bold', textAlign: 'center' }}>Verify</Text>
                </TouchableOpacity>
              )} 
              <TouchableOpacity onPress={() => goToProfileFeed(user.id)} style={styles.moreButton}>
                <Ionicons name="document-text-outline" size={24} color="#65558F" />
                <Text style={{ color: '#65558F', fontWeight: 'bold', textAlign: 'center' }}>Snaps</Text>
              </TouchableOpacity>
            </View>
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
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              <Text style={styles.inputLabel}>Private</Text>
              <Switch
                value={isPrivate}
                onValueChange={(value) => setIsPrivate(value)}
                trackColor={{ true: '#65558F', false: '#ccc' }}
              />
            </View>
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
      <Modal transparent={true} visible={isVerifyModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Verify your Account</Text>
            <ScrollView style={{ maxHeight: 200, marginVertical: 10, paddingHorizontal: 10 }}>
              <Text style={{ color: '#888', textAlign: 'center', fontSize: 16, fontWeight: 'bold' }}>
                TwitSnap Verification Terms and Conditions{"\n"}
              </Text>
              <Text style={{ color: '#888', textAlign: 'justify' }}>
                By submitting a verification request for your TwitSnap account, you agree to the following terms:{"\n\n"}
                
                1. Required Information:{"\n"}
                - You must provide your full legal name.{"\n"}
                - You must provide a URL to a clear and valid photo ID (e.g., passport, driver’s license, or government-issued identification).{"\n\n"}
                
                2. Verification Process:{"\n"}
                - Submitting a request does not guarantee verification. TwitSnap administrators will review your submission and decide at their sole discretion whether to grant verified status.{"\n"}
                - TwitSnap reserves the right to request additional information if necessary.{"\n\n"}
                
                3. Verification Revocation:{"\n"}
                - Verified status may be revoked at any time if the provided information is found to be inaccurate, outdated, or if the account violates TwitSnap’s Community Guidelines or Terms of Service.{"\n\n"}
                
                4. Privacy:{"\n"}
                - Any personal information submitted during the verification process will be handled in accordance with TwitSnap’s Privacy Policy.{"\n\n"}
                
                By proceeding with the verification request, you confirm that the information provided is accurate and that you understand and accept these terms.
              </Text>
            </ScrollView>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={fullNameInput}
              onChangeText={setFullNameInput}
              placeholderTextColor="#888"
            />
            <Text style={styles.inputLabel}>ID Picture URL</Text>
            <TextInput
              style={styles.input}
              placeholder="ID Picture URL"
              value={IDPictureInput}
              onChangeText={setIDPictureInput}
              placeholderTextColor="#888"
            />
            {loadingVerify ? (
              <ActivityIndicator size="large" color="#65558F" />
            ) : (
              <Button
                mode="contained"
                onPress={verified === 'pending' ? () => {} : handleRequestVerification}
                buttonColor={verified === 'pending' ? "#D3CFE3" : "#65558F"}
                textColor={verified === 'pending' ? "#A39BAA" : "#FFFFFF"}
                style={styles.modalButton}
              >
                {verified === 'pending' ? 'Request Pending' : 'Request Verification'}
              </Button>
            )}
            <Button mode="text" onPress={() => setVerifyModalVisible(false)} style={styles.cancelButton}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
      <Modal transparent={true} visible={isVerifyInfoModalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Verification Information</Text>
            <Text style={{ color: '#65558F', textAlign: 'center', fontSize: 16, fontWeight: 'bold', marginBottom: 20 }}>
              Your account has been verified by TwitSnap administrators!
            </Text>
            <Text style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>
              You provided the following information for verification:
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '90%' }}>
              <Text style={{ color: '#888', fontSize: 14, marginBottom: 10, fontWeight: 'bold' }}>
                Full Name:
              </Text>
              <Text style={{ color: '#888', fontSize: 14, marginBottom: 10 }}>
                {user.fullName}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '90%' }}>
              <Text style={{ color: '#888', fontSize: 14, marginBottom: 10, fontWeight: 'bold' }}>
                ID Picture URL:
              </Text>
              <Text style={{ color: '#65558F', fontSize: 14, marginBottom: 10 }} onPress={() => Linking.openURL(user.IDPicture || '')}>
                View
              </Text>
            </View>     
            <Button mode="text" onPress={() => setVerifyInfoModalVisible(false)} style={styles.cancelButton}>
              Cancel
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
  avatarContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  title: { fontSize: 32, fontWeight: 'bold', lineHeight: 32, color: '#65558F', textAlign: 'center' },
  subtitle: { fontSize: 16, fontWeight: 'bold', color: '#65558F', textAlign: 'center', marginTop: 10 },
  editButton: { marginTop: 20, paddingHorizontal: 20 },
  moreButton: { marginTop: 20, alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#65558F', marginTop: 20, textAlign: 'left' },
  chipContainer: { flexDirection: 'row', marginVertical: 10, maxHeight: 40 },
  chip: { backgroundColor: '#EADDFF', marginRight: 5, color: '#65558F' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: 300, padding: 20, backgroundColor: '#ffffff', borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', padding: 10, marginVertical: 10, borderColor: '#cccccc', borderWidth: 1, borderRadius: 5 },
  inputLabel: { alignSelf: 'flex-start', marginBottom: 5, marginTop: 2, fontWeight: 'bold'},
  modalButton: { marginTop: 20, paddingHorizontal: 20 },
  cancelButton: { marginTop: 10 },
  scrollContainer: { maxHeight: 300, width: '100%' },
  followInfo: { color: '#65558F', fontWeight: 'bold', fontSize: 16},
  followInfoModalContent: { height: '40%' },
});
