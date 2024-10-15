import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TextInput, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const Tab = createMaterialTopTabNavigator();

const SearchUsers = () => (
  <View style={styles.tabContainer}>
    <TextInput
      style={styles.input}
      right={<TextInput.Icon icon="magnify" />}
      label="Search Users"
      mode="outlined"
    />
  </View>
);

const SearchPosts = () => (
  <View style={styles.tabContainer}>
    <TextInput
      style={styles.input}
      right={<TextInput.Icon icon="magnify" />}
      label="Search Posts"
      mode="outlined"
    />
  </View>
);

const SearchHashtags = () => (
  <View style={styles.tabContainer}>
    <TextInput
      style={styles.input}
      right={<TextInput.Icon icon="magnify" />}
      label="Search Hashtags"
      mode="outlined"
      underlineColor='black'
      activeUnderlineColor='black'
      textColor='black'
      placeholderTextColor='black'
      theme={{
        colors: {
          onSurfaceVariant: 'rgba(0, 0, 0, 0.5)',
        },
      }}
    />
  </View>
);

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
        name="Posts" 
        component={SearchPosts} 
        options={{ tabBarIcon: () => <Ionicons name="document-text-outline" size={20} /> }} 
      />
      <Tab.Screen 
        name="Hashtags" 
        component={SearchHashtags} 
        options={{ tabBarIcon: () => <Text style={styles.icon}>#</Text> }}
      />
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
});
