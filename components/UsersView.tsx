import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { User } from './types/models';
import { useAuth } from './contexts/AuthContext';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator, Card, TouchableRipple } from 'react-native-paper';

interface UsersViewProps {
  users: User[];
  redirect: boolean | true;
  small: boolean | false;
  searchMade: boolean | false;
  setSelectedUser?: (user: User) => void | undefined;
  closeModal?: () => void | undefined;
}

export default function UsersView({
  users,
  redirect,
  small,
  searchMade,
  setSelectedUser,
  closeModal,
}: UsersViewProps) {
  const { auth } = useAuth();
  const navigation = useNavigation();

  const handleSelectUser = (user: User) => {
    if (redirect) {
      if (closeModal !== undefined) {
        closeModal();
      }
      goToProfile(user);
    } else {
      setSelectedUser && setSelectedUser(user);
    }
  };

  const goToProfile = (user: User) => {
    if (user?.id.toString() === auth.user?.id.toString()) {
      router.push('/screens/my-profile');
    } else {
      router.push({
        pathname: '/screens/user-profile',
        params: { userId: user.id },
      });
    }
  };

  useEffect(() => {}, [users]);

  return (
    <View style={small ? styles.smallContainer : styles.container}>
      {users.map((user) => (
        <Card key={user.id}>
          <TouchableRipple
            onPress={() => handleSelectUser(user)}
            rippleColor={'rgba(0, 0, 0, .10)'}
            style={small ? styles.smallUserCard : styles.userCard}
          >
            <Card.Title
              title={<Text style={small ? styles.smallTitle : styles.title}>{user.username}</Text>}
              left={() => (
                <Image
                  style={small ? styles.smallAvatar : styles.avatar}
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
    </View>
  );
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    justifyContent: 'center',
    marginTop: 20,
  },
  smallContainer: {
    flex: 1,
    justifyContent: 'center',
  },
});
