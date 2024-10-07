import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Image } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface Snap {
  ID: number;
  message: string;
  user: string;
  createdAt: string;
  updatedAt: string;
  liked: boolean;
}

// Placeholder snaps
const placeholderSnaps = [
  { ID: 4, user: 1, createdAt: '2024-09-29T15:45:33', updatedAt: '2024-09-29T15:45:33', message: 'Fourth post!' },
  { ID: 3, user: 1, createdAt: '2024-09-29T15:40:21', updatedAt: '2024-09-29T15:40:21', message: 'Third post!' },
  { ID: 2, user: 2, createdAt: '2024-09-28T14:22:10', updatedAt: '2024-09-28T14:22:10', message: 'Second post!' },
  { ID: 1, user: 3, createdAt: '2024-09-27T13:12:05', updatedAt: '2024-09-27T13:12:05', message: 'First!' },
];

export default function HomeScreen() {
  const [snaps, setSnaps] = useState<Snap[]>([]);

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
    // Fetch user by ID from the placeholder users data
  };

  const fetchSnaps = () => {
    const completeSnaps = placeholderSnaps.map(snap => {
      return {
        ...snap,
        liked: false,
      };
    });
    setSnaps(completeSnaps);
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
    <ScrollView style={styles.container}>
      {snaps.map(snap => (
        <Card key={snap.ID} style={styles.snapCard}>
          <Card.Title
            title={snap.user}
            subtitle={formatDate(snap.createdAt)}
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