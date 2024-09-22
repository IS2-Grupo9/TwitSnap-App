import React, { useState } from 'react';
import { View, Image, TouchableOpacity } from 'react-native';
import { Appbar, Avatar, Menu, Divider } from 'react-native-paper';
import { useAuth } from './contexts/AuthContext';

export function TopBar(){
    const [menuVisible, setMenuVisible] = useState(false)
    const { logout } = useAuth();
    const openMenu = () => setMenuVisible(true)
    const closeMenu = () => setMenuVisible(false)

    const handleProfile = () => {
        console.log('Profile pressed')
    };

    const handleLogout = () => {
        logout();
      }

    return (
        <Appbar.Header>
            <TouchableOpacity onPress={handleProfile}>
                <Avatar.Image size={40} source={require('../assets/images/avatar.png')} />
            </TouchableOpacity>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={require('../assets/images/logo-twitsnap.png')} style={{ width: 120, height: 40 }} resizeMode='contain' />
            </View>
            <Menu
                visible={menuVisible}
                onDismiss={closeMenu}
                anchor={<Appbar.Action icon='dots-vertical' onPress={openMenu} />}
            >
                <Menu.Item onPress={() => handleProfile()} title='Profile' />
                <Divider />
                <Menu.Item onPress={() => handleLogout()} title='Logout' />
            </Menu>
        </Appbar.Header>
    );
};