import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/components/contexts/AuthContext';
import { ExtendedSnap, Snap, User } from '@/components/types/models';
import SnapsView from '@/components/SnapsView';
import UsersView from '@/components/UsersView';

const Tab = createMaterialTopTabNavigator();

interface SearchUsersProps {
  showSnackbar: (message: string, type: string) => void;
  targetUser: string;
  setTargetUser: (user: string) => void;
}

function SearchUsers({ showSnackbar, targetUser, setTargetUser }: SearchUsersProps) {
  const { auth, logout } = useAuth();
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [searchMade, setSearchMade] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      if (!searchQuery.trim()) {
        showSnackbar('Please enter a search query.', 'error');
        return;
      }

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
      } else if (response.status === 401) {
        showSnackbar('Session expired. Please log in again.', 'error');
        logout();
      } else {
        const error = await response.json();
        showSnackbar('Error searching users.', 'error');
        setUsers([]);
        setSearchMade(true);
      }
    }
    catch (error: any) {
      showSnackbar('Error searching users.', 'error');
      console.error('Error searching users:', error.message);
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
        onSubmitEditing={handleSearch}
      />
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {loading ? (
          <ActivityIndicator size="large" color="#65558F" />
        ) : (
          <ScrollView
            style={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <UsersView
              users={users}
              setSelectedUser={setTargetUser}
              redirect={true}
              small={false}
              searchMade={searchMade}
            />
          </ScrollView>
        )}
      </View>
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
        options={{ tabBarIcon: () => <Ionicons name="person-outline" size={20} /> }} 
      >
        {() => <SearchUsers
          showSnackbar={showSnackbar}
          targetUser={targetUser}
          setTargetUser={setTargetUser}
        />}
      </Tab.Screen>
      <Tab.Screen 
        name="Snaps" 
        options={{ tabBarIcon: () => <Ionicons name="document-text-outline" size={20} /> }} 
      >
        {() => <SnapsView
          showSnackbar={showSnackbar}
          targetUser={targetUser}
          setTargetUser={setTargetUser}
          feed={false}
          searchType='text'
        />}
      </Tab.Screen>
      <Tab.Screen 
        name="Hashtags" 
        options={{ tabBarIcon: () => <Text style={styles.icon}>#</Text> }}
      >
        {() => <SnapsView
          showSnackbar={showSnackbar}
          targetUser={targetUser}
          setTargetUser={setTargetUser}
          feed={false}
          searchType='hashtag'
        />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, backgroundColor: '#f0f0f0' },
  title: { fontSize: 32, fontWeight: 'bold', lineHeight: 32, color: '#65558F' },
  subtitle: { fontSize: 20, fontWeight: 'bold', color: '#65558F', marginBottom: 20 },
  tabContainer: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white' },
  icon: { fontSize: 20, alignSelf: 'center', lineHeight: 25 },
  input: { marginVertical: 10, backgroundColor: 'transparent' },
  scrollContainer: { flex: 1, backgroundColor: 'white' },
});
