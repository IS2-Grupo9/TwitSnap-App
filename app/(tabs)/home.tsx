import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Image, RefreshControl, View, TouchableOpacity, Modal, TextInput } from 'react-native';
import { ActivityIndicator, Card, Text, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/components/contexts/AuthContext';

interface Snap {
  ID: number;
  message: string;
  user: string;
  created_at: string;
  updated_at: string;
  username?: string;
  liked?: boolean;
  editable?: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
  location: string;
  interests: string;
  created_at: string;
  updated_at: string;
}

interface HomeScreenProps {
  showSnackbar: (message: string, type: string) => void;
}

export default function HomeScreen({ showSnackbar }: HomeScreenProps) {
  const { auth } = useAuth();
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [newSnapMessage, setNewSnapMessage] = useState('');
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;
  const postsApiUrl = process.env.EXPO_PUBLIC_POSTS_URL;

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

  const fetchUserById = async (userId: string) => {
    const response = await fetch(`${apiUrl}/users/user?id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });
    console.log(auth.token);
    if (!response.ok) {
      return 'Unknown';
    } else {
      const user = await response.json();
      return user.username;
    }
  };

  const fetchUser = async () => {
    // TODO: Have this in an user context
    const response = await fetch(`${apiUrl}/users/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });
    if (!response.ok) {
      showSnackbar('Failed to fetch user.', 'error');
      return;
    }
    const user = await response.json();
    setUser(user);
  };

  const fetchSnaps = async () => {
    setLoading(true);
    const response = await fetch(`${postsApiUrl}/snaps`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      showSnackbar('Failed to fetch snaps.', 'error');
      setLoading(false);
      return;
    }
    const snaps = await response.json();
    const completedSnaps = snaps.data?.map((snap: any) => ({
      ...snap,
      liked: false,
      editable: snap.user === user?.id,
    }));
    for (const snap of completedSnaps) {
      snap.username = await fetchUserById(snap.user);
    }
    completedSnaps.sort((a: Snap, b: Snap) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    setSnaps(completedSnaps);
    setLoading(false);
  };

  const handleCreateSnap = () => {
    setModalVisible(true);
  };

  const handleSubmitSnap = async () => {
    // TODO: Do through gateway API with authorization
    setLoadingCreate(true);
    try {
      if (!newSnapMessage.trim()) {
        showSnackbar('Snap message cannot be empty!', 'error');
        return;
      }

      const id = String(user?.id || '');
      console.log(`Creating snap for user: ${id}`);
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
        setLoadingCreate(false);
        setModalVisible(false);
        return;
      }

      const newSnap = await response.json();
      setLoadingCreate(false);
      setModalVisible(false);
      setNewSnapMessage('');
      fetchSnaps();
    } catch (error) {
      showSnackbar('An error occurred. Please try again later.', 'error');
      setModalVisible(false);
      setLoadingCreate(false);
    }
  };

  const handleEditSnap = (snapId: number) => {
    console.log(`Edit snap: ${snapId}`);
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

  useEffect(() => {
    fetchSnaps();
    fetchUser();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchSnaps} colors={['#65558F']} />
        }
      >
        {snaps.map(snap => (
          <Card key={snap.ID} style={styles.snapCard}>
            <Card.Title
              title={snap.username || 'Unknown'}
              subtitle={formatDate(snap.created_at, snap.updated_at)}
              titleStyle={styles.titleStyle}
              subtitleStyle={styles.subtitleStyle}
              left={() => (
                <Image style={styles.avatar} source={require('@/assets/images/avatar.png')} />
              )}
              right={() =>
                snap.editable && (
                  <TouchableOpacity onPress={() => handleEditSnap(snap.ID)}>
                    <Ionicons name="pencil" size={18} color="black" />
                  </TouchableOpacity>
                )
              }
            />
            <Card.Content>
              <Text style={styles.message}>{snap.message}</Text>
            </Card.Content>
            <Card.Actions style={styles.actions}>
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
            {snaps.length === 0 ? 'No snaps available' : ''}
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.floatingButton} onPress={handleCreateSnap}>
        <Ionicons name="create-outline" size={36} color="white" />
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
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
            {loadingCreate ? (
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
            <Button mode="text" onPress={() => setModalVisible(false)} style={styles.cancelButton}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
  scrollView: { flex: 1 },
  snapCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#4c669f',
    borderRadius: 0,
    paddingHorizontal: 20,
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
  actions: {
    justifyContent: 'flex-start',
    padding: 15,
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
});