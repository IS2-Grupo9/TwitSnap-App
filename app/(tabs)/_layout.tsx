import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './home';
import ExploreScreen from './explore';
import ChatListScreen from './chat-list';
import TopBar from '@/components/TopBar';
import { StyleSheet, View } from 'react-native';
import { Chat, User } from '@/components/types/models';
import { useFirebase } from '@/components/contexts/FirebaseContext';

const Tab = createBottomTabNavigator();

interface TabLayoutProps {
  showSnackbar: (message: string, type: string) => void;
}

export default function TabLayout({ showSnackbar }: TabLayoutProps) {
  const colorScheme = useColorScheme();
  const { unread } = useFirebase().firebaseState;

  return (
    <>
      <TopBar showSnackbar={showSnackbar} type="default" showNotifications={true} />
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
          {() => <ExploreScreen showSnackbar={showSnackbar} />}
        </Tab.Screen>
        <Tab.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} color={color} size={30} />
            ),
          }}>
          {() => <HomeScreen showSnackbar={showSnackbar} />}
        </Tab.Screen>
        <Tab.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <View>
              {unread && <View style={styles.unreadDot} />}
              <Ionicons name={focused ? 'chatbubble' : 'chatbubble-outline'} color={color} size={30} />
            </View>
          ),
        }}>
          {() => <ChatListScreen showSnackbar={showSnackbar} />}
        </Tab.Screen>
      </Tab.Navigator>
    </>
  );
}

const styles = StyleSheet.create({
  unreadDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#30AE30',
    zIndex: 1,
  },
});

  