import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Modal, TextInput, ScrollView } from 'react-native';
import { ActivityIndicator, Button, Card, Chip } from 'react-native-paper';
import { TopBar } from '@/components/TopBar';
import { useAuth } from '@/components/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from '@/components/types/models';

interface UserProfileScreenProps {
  showSnackbar: (message: string, type: string) => void;
  targetUser: string;
}

export default function UserProfileScreen({ showSnackbar, targetUser }: UserProfileScreenProps) {
  const { auth } = useAuth();
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;
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
  const [loadingProfile, setLoadingProfile] = useState(true);
  // TODO: Implement following functionality with interactions API
  const [following, setFollowing] = useState(false);

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

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const response = await fetch(`${apiUrl}/users/user?id=${targetUser}`, {
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
            <Button
              mode="contained"
              style={styles.followButton}
              onPress={() => setFollowing(!following)}
            >
              {following ? 'Unfollow' : 'Follow'}
            </Button>
          </View>
        )}
      </LinearGradient>     
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: 'white' },
  avatar: { width: 200, height: 200, borderRadius: 100, marginBottom: 20 },
  avatarContainer: { alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', lineHeight: 32, color: '#65558F', textAlign: 'center' },
  subtitle: { fontSize: 16, fontWeight: 'bold', color: '#65558F', textAlign: 'center', marginTop: 10 },
  followButton: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#65558F', marginTop: 20, textAlign: 'left' },
  chipContainer: { 
    flexDirection: 'row', 
    marginTop: 10,
    maxHeight: 40,
  },
  chip: { backgroundColor: '#EADDFF', marginRight: 5, color: '#65558F' },
});
