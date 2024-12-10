import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/components/contexts/AuthContext';
import { ExtendedSnap, Snap, Trend, User } from '@/components/types/models';
import SnapsView from '@/components/SnapsView';
import UsersView from '@/components/UsersView';
import { NavigationProp, useNavigation } from '@react-navigation/native';

type ExploreTabParamList = {
  Users: undefined;
  Snaps: undefined;
  Hashtags: undefined;
  Trending: undefined;
};

const Tab = createMaterialTopTabNavigator<ExploreTabParamList>();

interface ExploreScreenProps {
  showSnackbar: (message: string, type: string) => void;
}

export default function ExploreScreen({ showSnackbar }: ExploreScreenProps) {
  const [trendSearch, setTrendSearch] = useState('');
  const navigation = useNavigation<NavigationProp<ExploreTabParamList>>();

  const handleTrendPress = (search: string) => {
    if (search.startsWith('#')) {
      setTrendSearch(search.substring(1));
      navigation.navigate('Hashtags');
    } else {
      setTrendSearch(search);
      navigation.navigate('Snaps');
    }
  }

  return (        
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: { fontSize: 12 },
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
        />}
      </Tab.Screen>
      <Tab.Screen 
        name="Snaps" 
        options={{ tabBarIcon: () => <Ionicons name="document-text-outline" size={20} /> }} 
      >
        {() => <SnapsView
          showSnackbar={showSnackbar}
          feed={false}
          searchType='text'
          externalSearchQuery={trendSearch}
        />}
      </Tab.Screen>
      <Tab.Screen 
        name="Hashtags" 
        options={{ tabBarIcon: () => <Text style={styles.icon}>#</Text> }}
      >
        {() => <SnapsView
          showSnackbar={showSnackbar}
          feed={false}
          searchType='hashtag'
          externalSearchQuery={trendSearch}
        />}
      </Tab.Screen>
      <Tab.Screen
        name="Trending"
        options={{ tabBarIcon: () => <Ionicons name="flame-outline" size={20} /> }}
      >
        {() => <TrendingSnaps showSnackbar={showSnackbar} handleTrendPress={handleTrendPress} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

interface SearchUsersProps {
  showSnackbar: (message: string, type: string) => void;
}

function SearchUsers({ showSnackbar }: SearchUsersProps) {
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
    <View style={styles.userTabContainer}>
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

interface TrendingSnapsProps {
  showSnackbar: (message: string, type: string) => void;
  handleTrendPress: (search: string) => void;
}

function TrendingSnaps({ showSnackbar, handleTrendPress }: TrendingSnapsProps) {
  const { auth, logout } = useAuth();
  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;
  const [trends, setTrends] = useState<Trend[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTrending = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/posts/trending`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setTrends(data.data);
      } else if (response.status === 401) {
        showSnackbar('Session expired. Please log in again.', 'error');
        logout();
      } else {
        const error = await response.json();
        showSnackbar('Error fetching trending snaps.', 'error');
        setTrends([]);
      }
    }
    catch (error: any) {
      showSnackbar('Error fetching trending snaps.', 'error');
      console.error('Error fetching trending snaps:', error.message);
    }
    finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTrending();
  }, []);

  return (
    <View style={styles.trendTabContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#65558F" />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchTrending}
              colors={['#65558F']}
            />
          }
        >
          {trends.map((trend, index) => (
            <TouchableOpacity
              key={index}
              style={styles.trendContainer}
              onPress={() => handleTrendPress(trend.word)}
            >
              <Text style={{ fontSize: 20, color: '#000', marginBottom: 10, fontWeight: 'bold' }}>
                {index + 1}-
              </Text>
              <View style={{ marginLeft: 15, marginTop: 10 }}>
                <Text style={styles.title}>
                  {trend.word}              
                </Text>
                <Text style={styles.subtitle}>
                  {trend.count} snap{trend.count === 1 ? '' : 's'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}            
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 30, backgroundColor: '#f0f0f0' },
  trendContainer: {backgroundColor: 'white', borderColor: '#65558F', borderWidth: 1, padding: 20, flexDirection: 'row', alignItems: 'center'},
  title: { fontSize: 24, fontWeight: 'bold', lineHeight: 32, color: '#65558F' },
  subtitle: { fontSize: 14, color: '#000', marginBottom: 20 },
  userTabContainer: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: 'white', alignContent: 'center', height: '100%' },
  trendTabContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'white', alignContent: 'center'},
  icon: { fontSize: 20, alignSelf: 'center', lineHeight: 25 },
  input: { marginVertical: 10, backgroundColor: 'transparent' },
  scrollContainer: { flex: 1, backgroundColor: 'white', alignContent: 'center' },
});
