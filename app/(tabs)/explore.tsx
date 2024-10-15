import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TextInput, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/components/contexts/AuthContext';

const Tab = createMaterialTopTabNavigator();

interface Snap {
  ID: number;
  message: string;
  user: string;
  created_at: string;
  updated_at: string;
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

function SearchUsers() {
  const { auth } = useAuth();
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [searchMade, setSearchMade] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/users/search?username=${searchQuery}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',          
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setSearchMade(true);
      } else {
        const status = await response.status;
        console.log('Error searching users:', status);
        setUsers([]);
        setSearchMade(true);
      }
    }
    catch (error) {
      console.error('Error searching users:', error);
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.tabContainer}>
      <TextInput
        style={styles.input}
        value={searchQuery}
        right={<TextInput.Icon icon="magnify" onPress={handleSearch} />}
        onChangeText={setSearchQuery}
        label="Search Users"
        mode="outlined"
        underlineColor='black'
        activeUnderlineColor='black'
        activeOutlineColor='#65558F'
        textColor='black'
        placeholderTextColor='black'
        theme={{
          colors: {
            background: 'white',
            onSurfaceVariant: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleSearch} colors={['#65558F']} />
        }
      >
        {users.map((user) => (
          <View key={user.id} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#65558F' }}>{user.username}</Text>
            <Text style={{ fontSize: 14, color: '#65558F' }}>{user.email}</Text>
          </View>
        ))}
        <View style={{ height: 100 }}>
          <Text style={{ textAlign: 'center', color: '#65558F', marginTop: 20 }}>
            {users.length === 0 && searchMade ? 'No users found' : ''}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SearchSnaps() {
  const { auth } = useAuth();
  const postsApiUrl = process.env.EXPO_PUBLIC_POSTS_URL;
  const [searchQuery, setSearchQuery] = useState('');
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [searchMade, setSearchMade] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${postsApiUrl}/search/text?text=${searchQuery}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSnaps(data?.data);
        setSearchMade(true);
      } else {
        const status = await response.status;
        console.log('Error searching snaps:', status);
        setSnaps([]);
        setSearchMade(true);
      }
    }
    catch (error) {
      console.error('Error searching snaps:', error);
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.tabContainer}>
      <TextInput
        style={styles.input}
        value={searchQuery}
        right={<TextInput.Icon icon="magnify" onPress={handleSearch} />}
        onChangeText={setSearchQuery}
        label="Search Snaps"
        mode="outlined"
        underlineColor='black'
        activeUnderlineColor='black'
        activeOutlineColor='#65558F'
        textColor='black'
        placeholderTextColor='black'
        theme={{
          colors: {
            background: 'white',
            onSurfaceVariant: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleSearch} colors={['#65558F']} />
        }
      >
        {snaps.map((snap) => (
          <View key={snap.ID} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#65558F' }}>{snap.message}</Text>
            <Text style={{ fontSize: 14, color: '#65558F' }}>{snap.user}</Text>
          </View>
        ))}
        <View style={{ height: 100 }}>
          <Text style={{ textAlign: 'center', color: '#65558F', marginTop: 20 }}>
            {snaps.length === 0 && searchMade ? 'No snaps found' : ''}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function SearchHashtag() {
  const { auth } = useAuth();
  const postsApiUrl = process.env.EXPO_PUBLIC_POSTS_URL;
  const [searchQuery, setSearchQuery] = useState('');
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [searchMade, setSearchMade] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${postsApiUrl}/search/hashtag?hashtag=${searchQuery}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSnaps(data?.data);
        setSearchMade(true);
      } else {
        const status = await response.status;
        console.log('Error searching snaps:', status);
        setSnaps([]);
        setSearchMade(true);
      }
    }
    catch (error) {
      console.error('Error searching snaps:', error);
    }
    finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.tabContainer}>
      <TextInput
        style={styles.input}
        value={searchQuery}
        right={<TextInput.Icon icon="magnify" onPress={handleSearch} />}
        onChangeText={setSearchQuery}
        label="Search Hashtag"
        mode="outlined"
        underlineColor='black'
        activeUnderlineColor='black'
        activeOutlineColor='#65558F'
        textColor='black'
        placeholderTextColor='black'
        theme={{
          colors: {
            background: 'white',
            onSurfaceVariant: 'rgba(0, 0, 0, 0.5)',
          },
        }}
      />
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleSearch} colors={['#65558F']} />
        }
      >
        {snaps.map((snap) => (
          <View key={snap.ID} style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#65558F' }}>{snap.message}</Text>
            <Text style={{ fontSize: 14, color: '#65558F' }}>{snap.user}</Text>
          </View>
        ))}
        <View style={{ height: 100 }}>
          <Text style={{ textAlign: 'center', color: '#65558F', marginTop: 20 }}>
            {snaps.length === 0 && searchMade ? 'No snaps found' : ''}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
 

interface ExploreScreenProps {
  showSnackbar: (message: string, type: string) => void;
  targetUser: string;
  setTargetUser: (targetUser: string) => void;
}

export default function ExploreScreen({ showSnackbar, targetUser, setTargetUser }: ExploreScreenProps) {
  return (        
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 14 },
        tabBarIndicatorStyle: { backgroundColor: '#65558F' },
        tabBarStyle: { backgroundColor: '#ffffff' },
        tabBarActiveTintColor: '#65558F',
        tabBarInactiveTintColor: '#000000',
      }}
    >
      <Tab.Screen 
        name="Users" 
        component={SearchUsers} 
        options={{ tabBarIcon: () => <Ionicons name="person-outline" size={20} /> }} 
      />
      <Tab.Screen 
        name="Snaps" 
        component={SearchSnaps} 
        options={{ tabBarIcon: () => <Ionicons name="document-text-outline" size={20} /> }} 
      />
      <Tab.Screen 
        name="Hashtags" 
        component={SearchHashtag} 
        options={{ tabBarIcon: () => <Text style={styles.icon}>#</Text> }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, backgroundColor: '#f0f0f0' },
  title: { fontSize: 32, fontWeight: 'bold', lineHeight: 32, color: '#65558F' },
  scrollView: { flex: 1 },
  subtitle: { fontSize: 20, fontWeight: 'bold', color: '#65558F', marginBottom: 20 },
  tabContainer: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white' },
  icon: { fontSize: 20, alignSelf: 'center', lineHeight: 25 },
  input: { marginVertical: 10, backgroundColor: 'transparent' },
});
