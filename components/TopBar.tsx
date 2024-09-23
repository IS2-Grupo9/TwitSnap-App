import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StatusBar } from 'react-native';
import { Appbar, Avatar, Menu, Divider } from 'react-native-paper';
import { useAuth } from './contexts/AuthContext';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

export type TopBarProps = {
  type: 'default' | 'back';
};

export function TopBar(
  props: TopBarProps
) {
  const [menuVisible, setMenuVisible] = useState(false)
  const { logout } = useAuth();
  const openMenu = () => setMenuVisible(true)
  const closeMenu = () => setMenuVisible(false)
  const navigation = useNavigation();

  const handleProfile = () => {
    const state = navigation.getState();
    if (state && !state.routes.find(route => route.name === 'screens/profile')){
      router.push('/screens/profile');
    }
    closeMenu();
  };

  const handleLogout = () => {
    logout();
    closeMenu();
  }

  return (
    <>
      <StatusBar backgroundColor={'#65558F'} />
      <Appbar.Header style={{ backgroundColor: '#65558F' }}>
        {props.type === 'back' ? (<Appbar.BackAction onPress={() => navigation.goBack()} />)
        : (
          <TouchableOpacity onPress={handleProfile} style={{ marginLeft: 10 }}>
            <Avatar.Image size={40} source={require('../assets/images/avatar.png')} />
          </TouchableOpacity>
        )}                
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Image source={require('../assets/images/logo-twitsnap.png')} style={{ width: 120, height: 40 }} resizeMode='contain' />
        </View>
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={<Appbar.Action icon='dots-vertical' onPress={openMenu} />}
          anchorPosition='bottom'
          contentStyle={{ backgroundColor: 'white', borderColor: '#65558F', borderWidth: 1, borderRadius: 5 }}
        >
          <Menu.Item
            onPress={handleProfile}
            title='Profile'
            titleStyle={{ color: '#65558F' }}
          />
          <Divider style={{ backgroundColor: '#65558F' }} />
          <Menu.Item
            onPress={handleLogout}
            title='Logout'
            titleStyle={{ color: '#65558F' }}
          />
        </Menu>
      </Appbar.Header>
    </>
  );
};