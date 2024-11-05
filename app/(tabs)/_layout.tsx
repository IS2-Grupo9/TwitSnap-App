import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './home';
import ExploreScreen from './explore';
import ChatListScreen from './chat-list';
import { TopBar } from '@/components/TopBar';
import { StyleSheet } from 'react-native';

const Tab = createBottomTabNavigator();

interface TabLayoutProps {
  showSnackbar: (message: string, type: string) => void;
  targetUser: string;
  setTargetUser: (user: string) => void;
}

export default function TabLayout({ showSnackbar, targetUser, setTargetUser }: TabLayoutProps) {
  const colorScheme = useColorScheme();

  return (
    <>
      <TopBar type="default" />
      <Tab.Navigator
        initialRouteName="home"
        backBehavior='history'
        screenOptions={{
          tabBarStyle: {
            backgroundColor: '#65558F',
            paddingTop: 5,
            paddingBottom: 5,
            height: 60,
          },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#fff',
          headerShown: false,
        }}>
        <Tab.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'search' : 'search-outline'} color={color} size={30} />
            ),
          }}>
          {() => <ExploreScreen showSnackbar={showSnackbar} targetUser={targetUser} setTargetUser={setTargetUser} />}
        </Tab.Screen>
        <Tab.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={30} />
            ),
          }}>
          {() => <HomeScreen showSnackbar={showSnackbar} targetUser={targetUser} setTargetUser={setTargetUser} />}
        </Tab.Screen>
        <Tab.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubble' : 'chatbubble-outline'} color={color} size={30} />
          ),
        }}>
          {() => <ChatListScreen showSnackbar={showSnackbar} />}
        </Tab.Screen>
      </Tab.Navigator>
    </>
  );
}

  