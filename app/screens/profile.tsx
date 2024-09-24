import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Modal, TextInput, TouchableOpacity } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import { TopBar } from '@/components/TopBar';
import { useAuth } from '@/components/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const { auth, login } = useAuth();
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;
  const [isModalVisible, setModalVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const formatDate = (dateString : string | undefined) => {
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
      const response = await fetch(`${apiUrl}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          username: username,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        login({ ...auth, user: updatedUser });
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile. Please try again.');
      }
    } catch (error) {
      alert('An error occurred. Please try again later.');
    } finally {
      setLoadingEdit(false);
      setModalVisible(false);
    }
  };
  {/*
  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const response = await fetch(`${apiUrl}/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsername(data.username);
        setEmail(data.email);
        setCreatedAt(data.createdAt);
        setUpdatedAt(data.updatedAt);
      } else {
        alert('Failed to fetch profile data. Please try again.');
      }
    }
    catch (error) {
      alert('An error occurred. Please try again later.');
    }
    finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);
  */}
  return (
    <>
      <TopBar type='back' />
      <LinearGradient
        colors={['#EADDFF', '#FFFFFF']}
        style={styles.container}
      >
        {loadingProfile ? (
          <ActivityIndicator size="large" color="#65558F" />
        ) : 
        (<View style={styles.avatarContainer}>
          <Image style={styles.avatar} source={require('@/assets/images/avatar.png')} />
          <Text style={styles.title}>{auth?.user?.username}</Text>
          {/*<Text style={styles.subtitle}>{email}</Text>*/}
          <Text style={styles.subtitle}>Join date: {formatDate(auth?.user?.createdAt)}</Text>
          <Text style={styles.subtitle}>Last updated: {formatDate(auth?.user?.updatedAt)}</Text>
          <Button
            mode="contained"
            onPress={() => setModalVisible(true)}
            buttonColor='#65558F'
            textColor='#FFFFFF'
            style={styles.editButton}
          >
            Edit Profile
          </Button>
        </View>)}
      </LinearGradient>
      <Modal
        transparent={true}
        visible={isModalVisible}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />
            {loadingEdit ? (
              <ActivityIndicator size="large" color="#65558F" />
            ) : (
            <Button
              mode="contained"
              onPress={handleProfileEdit}
              buttonColor='#65558F'
              textColor='#FFFFFF'
              style={styles.modalButton}
            >
              Save Changes
            </Button>)}
            <Button
              mode="text"
              onPress={() => setModalVisible(false)}
              style={styles.cancelButton}
            >
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

  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: 300, padding: 20, backgroundColor: '#ffffff', borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', padding: 10, marginVertical: 10, borderColor: '#cccccc', borderWidth: 1, borderRadius: 5 },
  modalButton: { marginVertical: 10, width: '100%' },
  cancelButton: { marginTop: 10 },
});
