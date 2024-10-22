
import React, { useEffect } from 'react'
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native'
import { User } from './types/models'
import { useAuth } from './contexts/AuthContext'
import { router } from 'expo-router'
import { useNavigation } from '@react-navigation/native'
import { ActivityIndicator, Card, TouchableRipple } from 'react-native-paper'

interface UsersViewProps {
  users: User[]
  loading: boolean
  selectedUser: string
  setSelectedUser: (user: string) => void
  search?: boolean
  searchMade?: boolean
}

export default function UsersView({
  users,
  loading,
  selectedUser,
  setSelectedUser,
  search,
  searchMade,
}: UsersViewProps) {
  const { auth } = useAuth()
  const navigation = useNavigation()

  const handleSelectUser = (user: User) => {
    if (search) {
      goToProfile(user.id.toString())
    } else {
      setSelectedUser(user.id.toString())
    }
  }

  const goToProfile = (userId: string) => {
    const state = navigation.getState();
    if (userId === String(auth.user?.id)) {
      if (state && !state.routes.find(route => route.name === 'screens/my-profile')){
        router.push('/screens/my-profile');
      }
    }
    else {
      setSelectedUser(userId);
      if (state && !state.routes.find(route => route.name === 'screens/user-profile')){
        router.push('/screens/user-profile');
      }
    }
  }

  useEffect(() => {}, [users] )

  return (
    <View style={{ ...styles.scrollContainer, marginTop: search ? 20 : 0 }}>
      {loading ? ( 
        <ActivityIndicator size="large" color="#65558F" />
      ) : (
        <ScrollView
          style={styles.scrollView}
          keyboardShouldPersistTaps="handled"
        >
          {users.map((user) => (
            <Card key={user.id}>
              <TouchableRipple
                onPress={() => handleSelectUser(user)}
                rippleColor={'rgba(0, 0, 0, .10)'}
                style={styles.userCard}
              >
                <Card.Title
                  title={
                    <Text style={styles.title}>{user.username}</Text>
                  }
                  left={() => (
                    <Image style={styles.avatar} source={require('@/assets/images/avatar.png')} />
                  )}
                />
              </TouchableRipple>
            </Card>     
          ))}
          <View style={{ height: 100 }}>
            <Text style={{ textAlign: 'center', color: '#65558F', marginTop: 20 }}>
              {users.length === 0 && searchMade ? 'No users found' : ''}
            </Text>
          </View>
        </ScrollView>
      )}
      </View>
  )
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
  title: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 20,
  },
  scrollContainer: {
    flex: 1,
    justifyContent: 'center',
  },
})
