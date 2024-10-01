import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Image } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

interface Post {
  ID: number;
  message: string;
  userId: number;
  user: string;
  createdAt: string;
  updatedAt: string;
  liked: boolean;
}

// Placeholder users data
const users = [
  { id: 1, username: 'Juan' },
  { id: 2, username: 'Pepe' },
  { id: 3, username: 'Carlos' },
];

// Placeholder posts
const placeholderPosts = [
  { ID: 4, userId: 1, createdAt: '2024-09-29T15:45:33', updatedAt: '2024-09-29T15:45:33', message: 'Fourth post!' },
  { ID: 3, userId: 1, createdAt: '2024-09-29T15:40:21', updatedAt: '2024-09-29T15:40:21', message: 'Third post!' },
  { ID: 2, userId: 2, createdAt: '2024-09-28T14:22:10', updatedAt: '2024-09-28T14:22:10', message: 'Second post!' },
  { ID: 1, userId: 3, createdAt: '2024-09-27T13:12:05', updatedAt: '2024-09-27T13:12:05', message: 'First!' },
];

export default function HomeScreen() {
  const [posts, setPosts] = useState<Post[]>([]);

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
    return users.find(user => user.id === userId)?.username || 'Unknown';
  };

  const fetchPosts = () => {
    const completePosts = placeholderPosts.map(post => {
      return {
        ...post,
        user: fetchUserById(post.userId),
        liked: false,
      };
    });
    setPosts(completePosts);
  };
  
  const handleLikePost = (postId: number) => {
    // TODO: Like post through interactions API
    const updatedPosts = posts.map(post => {
      if (post.ID === postId) {
        return { ...post, liked: !post.liked };
      }
      return post;
    });
    setPosts(updatedPosts);
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {posts.map(post => (
        <Card key={post.ID} style={styles.postCard}>
          <Card.Title
            title={post.user}
            subtitle={formatDate(post.createdAt)}
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
            <Text style={styles.message}>{post.message}</Text>
          </Card.Content>
          <Card.Actions style={styles.actions}>
            <Ionicons
              name={post.liked ? 'heart' : 'heart-outline'}
              size={24}
              color="#65558F"
              style={styles.iconButton}
              onPress={() => handleLikePost(post.ID)}
            />
            <Text style={styles.interactionCount}>3</Text>
            <Ionicons
              name="arrow-redo-outline"
              size={24}
              color="#65558F"
              style={styles.iconButton}
              onPress={() => console.log('Comment on post')}
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
  postCard: {
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