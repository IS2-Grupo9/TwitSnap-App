import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Modal, TextInput, ScrollView } from 'react-native';
import { ActivityIndicator, Button, Card, Chip } from 'react-native-paper';
import { TopBar } from '@/components/TopBar';
import { useAuth } from '@/components/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const placeholderInterests = ['#coding', '#gaming', '#reading', '#cooking', '#music', '#sports', '#travel', '#photography', '#art', '#movies'];

interface ProfileScreenProps {
  showSnackbar: (message: string) => void; // Prop for showing snackbars
}

export default function ProfileScreen({ showSnackbar }: ProfileScreenProps) {
  const { auth } = useAuth();
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;
  const [isModalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameInput, setUsernameInput] = useState(username);
  const [email, setEmail] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [location, setLocation] = useState('Not specified');
  const [locationInput, setLocationInput] = useState(location);
  const [interests, setInterests] = useState(placeholderInterests);
  const [interestInput, setInterestInput] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

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
        showSnackbar('Username is required.');
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
          // TODO: Add location and interests to the request body
          // location: locationInput,
          // interests: interestInput.split(',').map((interest) => interest.trim()),
        }),
      });

      if (response.ok) {
        fetchProfile();
        showSnackbar('Profile updated successfully!');
      } else {
        showSnackbar('Failed to update profile. Please try again.');
      }
    } catch (error) {
      showSnackbar('An error occurred. Please try again later.');
    } finally {
      setLoadingEdit(false);
      setModalVisible(false);
    }
  };

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
        setUsername(data.username);
        setUsernameInput(data.username);
        setEmail(data.email);
        setCreatedAt(data.createdAt);
        setUpdatedAt(data.updatedAt);
        // TODO: Set location and interests
      } else {
        showSnackbar('Failed to fetch profile data. Please try again.'); // Use showSnackbar here
      }
    } catch (error) {
      showSnackbar('An error occurred. Please try again later.'); // Use showSnackbar here
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
            <Text style={styles.title}>{username}</Text>
            <Text style={styles.subtitle}>{email}</Text>
            <Text style={styles.subtitle}>Location: {location}</Text>
            <Text style={styles.subtitle}>Join date: {formatDate(createdAt)}</Text>
            <Text style={styles.subtitle}>Last updated: {formatDate(updatedAt)}</Text>
            <Text style={styles.sectionTitle}>Interests</Text>
            <ScrollView horizontal={true} style={styles.chipContainer}>
              {interests.map((interest, index) => (
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
              onPress={() => setModalVisible(true)}
              buttonColor='#65558F'
              textColor='#FFFFFF'
              style={styles.editButton}
            >
              Edit Profile
            </Button>
          </View>
        )}
      </LinearGradient>
      <Modal transparent={true} visible={isModalVisible} animationType="slide">
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
            <Button mode="text" onPress={() => setModalVisible(false)} style={styles.cancelButton}>
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
  avatarContainer: { alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', lineHeight: 32, color: '#65558F', textAlign: 'center' },
  subtitle: { fontSize: 16, fontWeight: 'bold', color: '#65558F', textAlign: 'center', marginTop: 10 },
  editButton: { marginTop: 20, paddingHorizontal: 20 },
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
});
