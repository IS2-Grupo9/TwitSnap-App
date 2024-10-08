import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Image, RefreshControl } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface Snap {
  ID: number;
  message: string;
  user: string;
  created_at: string;
  updated_at: string;
  liked: boolean;
}

interface HomeScreenProps {
  showSnackbar: (message: string, type: string) => void;
}

export default function HomeScreen({ showSnackbar }: HomeScreenProps) {
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [loading, setLoading] = useState(false);
  const apiUrl = process.env.EXPO_PUBLIC_POSTS_URL;

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

  const fetchUserById = (userId: number) => {
    
  };

  const fetchSnaps = async () => {
    // TODO: Change to gateway API with authentication
    setLoading(true);
    const response = await fetch(`${apiUrl}/snaps`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (!response.ok) {
      showSnackbar('Failed to fetch snaps.', 'error');
      setLoading(false);
      return;
    }
    const snaps = await response.json();
    const completedSnaps = snaps.data?.map((snap: any) => ({
      ...snap,
      liked: false,
    }));
    // Sort by most recent
    completedSnaps.sort((a: Snap, b: Snap) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    setSnaps(completedSnaps);    
    setLoading(false);
  };
  
  const handleLikeSnap = (snapId: number) => {
    // TODO: Like snap through interactions API
    const updatedSnaps = snaps.map(snap => {
      if (snap.ID === snapId) {
        return { ...snap, liked: !snap.liked };
      }
      return snap;
    });
    setSnaps(updatedSnaps);
  }

  useEffect(() => {
    fetchSnaps();
  }, []);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={loading}
          onRefresh={fetchSnaps}
          colors={['#65558F']}
        />
      }>
      {snaps.map(snap => (
        <Card key={snap.ID} style={styles.snapCard}>
          <Card.Title
            title={snap.user}
            subtitle={formatDate(snap.created_at)}
            titleStyle={styles.titleStyle}
            subtitleStyle={styles.subtitleStyle}
            left={() => (
              <Image
                style={styles.avatar}
                source={require('@/assets/images/avatar.png')}
              />
            )}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },
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
});