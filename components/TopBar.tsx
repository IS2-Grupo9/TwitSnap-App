import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StatusBar, StyleSheet } from 'react-native';
import { Appbar, Avatar, Menu, Divider } from 'react-native-paper';
import { useAuth } from './contexts/AuthContext';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useFirebase } from './contexts/FirebaseContext';

type TopBarType = 'default' | 'back';

interface TopBarProps {
  type: TopBarType;
  showNotifications: boolean;
};

export default function TopBar({ type, showNotifications }: TopBarProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const { notifications } = useFirebase().firebaseState;
  const { logout } = useAuth();
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  const navigation = useNavigation();

  const unReadNotifications = notifications.filter(notification => !notification.read);

  const handleProfile = () => {
    const state = navigation.getState();
    if (state && !state.routes.find(route => route.name === 'screens/my-profile')){
      router.push('/screens/my-profile');
    }
    closeMenu();
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <>
      <StatusBar backgroundColor={'#65558F'} />
      <Appbar.Header style={styles.header}>
        <View style={styles.leftContainer}>
          {type === 'back' ? (
            <Appbar.BackAction onPress={() => router.back()} color='white' />
          ) : (
            <TouchableOpacity onPress={handleProfile}>
              <Avatar.Image size={40} source={require('../assets/images/avatar.png')} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.centerContainer}>
          <Image source={require('../assets/images/logo-twitsnap.png')} style={styles.logo} resizeMode='contain' />
        </View>

        <View style={styles.rightContainer}>
          {showNotifications && (
            <TouchableOpacity onPress={() => router.push('/screens/notifications')}>
              <View>
                {unReadNotifications.length > 0 && <View style={styles.unreadDot} />}
                <Appbar.Action icon='bell' color='white' />
              </View>
            </TouchableOpacity>
          )}
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={<Appbar.Action icon='dots-vertical' onPress={openMenu} color='white' />}
            anchorPosition='bottom'
            contentStyle={styles.menuContent}
          >
            <Menu.Item
              onPress={handleProfile}
              title='Profile'
              titleStyle={styles.menuTitle}
            />
            <Divider style={styles.divider} />
            <Menu.Item
              onPress={handleLogout}
              title='Logout'
              titleStyle={styles.menuTitle}
            />
          </Menu>
        </View>
      </Appbar.Header>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#65558F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flex: 1,
    paddingLeft: 10,
  },
  centerContainer: {
    flex: 2,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 40,
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 10,
  },
  unreadDot: {
    position: 'absolute',
    right: 15,
    top: 15,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#30AE30',
    zIndex: 1,
  },
  menuContent: {
    backgroundColor: 'white',
    borderColor: '#65558F',
    borderWidth: 1,
    borderRadius: 5,
  },
  menuTitle: {
    color: '#65558F',
  },
  divider: {
    backgroundColor: '#65558F',
  },
});
