import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { User } from './types/models';
import { useAuth } from './contexts/AuthContext';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator, Card, TouchableRipple } from 'react-native-paper';

interface UsersViewProps {
  users: User[];
  loading: boolean;
  setSelectedUser: (user: string) => void;
  search?: boolean;
  searchMade?: boolean;
}

export default function UsersView({
  users,
  loading,
  setSelectedUser,
  search,
  searchMade,
}: UsersViewProps) {
  const { auth } = useAuth();
  const navigation = useNavigation();

  const handleSelectUser = (user: User) => {
    if (search) {
      goToProfile(user.id.toString());
    } else {
      setSelectedUser(user.username);
    }
  };

  const goToProfile = (userId: string) => {
    const state = navigation.getState();
    if (userId === String(auth.user?.id)) {
      if (state && !state.routes.find(route => route.name === 'screens/my-profile')) {
        router.push('/screens/my-profile');
      }
    } else {
      setSelectedUser(userId);
      if (state && !state.routes.find(route => route.name === 'screens/user-profile')) {
        router.push('/screens/user-profile');
      }
    }
  };

  useEffect(() => {}, [users]);

  return (
    <View style={search ? styles.scrollContainer : styles.smallScrollContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#65558F" />
      ) : (
        // TODO: ScrollView might not be necessary here, take it out of the component
        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          {users.map((user) => (
            <Card key={user.id}>
              <TouchableRipple
                onPress={() => handleSelectUser(user)}
                rippleColor={'rgba(0, 0, 0, .10)'}
                style={search ? styles.userCard : styles.smallUserCard}
              >
                <Card.Title
                  title={<Text style={search ? styles.title : styles.smallTitle}>{user.username}</Text>}
                  left={() => (
                    <Image
                      style={search ? styles.avatar : styles.smallAvatar}
                      source={require('@/assets/images/avatar.png')}
                    />
                  )}
                />
              </TouchableRipple>
            </Card>
          ))}
          {users.length === 0 && searchMade ?
          <View style={{ height: 100 }}>
            <Text style={{ textAlign: 'center', color: '#65558F', marginTop: 20 }}>
              No users found
            </Text>
          </View>
          : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  userCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#4c669f',
    borderRadius: 0,
    paddingRight: 20,
    paddingLeft: 10,
    paddingVertical: 10,
  },
  smallUserCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#4c669f',
  },
  title: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  smallTitle: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 20,
  },
  smallAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  scrollContainer: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 20,
  },
  smallScrollContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
