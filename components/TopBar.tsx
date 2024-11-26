import React, { useState } from 'react';
import { View, Image, TouchableOpacity, StatusBar, StyleSheet, Modal } from 'react-native';
import { Appbar, Avatar, Menu, Divider, TextInput, Text, ActivityIndicator, Button } from 'react-native-paper';
import { useAuth } from './contexts/AuthContext';
import { router } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { useFirebase } from './contexts/FirebaseContext';

type TopBarType = 'default' | 'back';

interface TopBarProps {
  showSnackbar: (message: string, type: string) => void;
  type: TopBarType;
  showNotifications: boolean;
};

export default function TopBar({ showSnackbar, type, showNotifications }: TopBarProps) {
  const [ menuVisible, setMenuVisible ] = useState(false);
  const { notifications } = useFirebase().firebaseState;
  const { auth, logout } = useAuth();
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  const navigation = useNavigation();

  const [isChangePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const unReadNotifications = notifications.filter(notification => !notification.read);

  const apiUrl = process.env.EXPO_PUBLIC_GATEWAY_URL;

  const handleChangePassword = async () => {
    setLoadingEdit(true);
    try {
      if (!password || !confirmPassword) {
        showSnackbar('All fields are required.', 'error');
        return;
      }
      
      if (password !== confirmPassword) {
        showSnackbar('Passwords do not match.', 'error');
        return;
      }  
      
      const response = await fetch(`${apiUrl}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          password: password,
        }),
      });

      if (response.ok) {
        showSnackbar('Password changed successfully.', 'success');
      } else if (response.status === 400) {
        const message = await response.text();
        showSnackbar(JSON.parse(message).error || 'Invalid input.', 'error');
      } else if (response.status === 401) {
        showSnackbar('Session expired. Please log in again.', 'error');
        logout();
      } else {
        showSnackbar('Failed to change password. Please try again.', 'error');
      }
    } catch (error) {
      showSnackbar('An error occurred. Please try again later.', 'error');
    } finally {
      setLoadingEdit(false);
      setChangePasswordModalVisible(false);
    }
  };

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
              onPress={() => setChangePasswordModalVisible(true)}
              title='Change Password'
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
      <Modal 
        transparent={true} 
        visible={isChangePasswordModalVisible}
        animationType="fade"
        onRequestClose={() => setChangePasswordModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              mode="flat"
              right={
                <TextInput.Icon
                  icon={hidePassword ? 'eye' : 'eye-off'}
                  color='black'
                  onPress={() => setHidePassword(!hidePassword)}
                />
              }
              style={styles.input}
              label={"New password"}
              value={password}
              underlineColor='black'
              activeUnderlineColor='black'
              textColor='black'
              placeholderTextColor='black'
              theme={{
                colors: {
                  onSurfaceVariant: 'rgba(0, 0, 0, 0.5)',
                },
              }}
              onChangeText={setPassword}
              secureTextEntry={hidePassword}
            />
            <TextInput
              mode="flat"
              right={
                confirmPassword !== '' && password === confirmPassword ? (
                  <TextInput.Icon
                    icon='check'
                    color='#2E8F00'
                    onPress={() => {}}
                  />
                ) : null
              }
              style={styles.input}
              label={"Confirm new password"}
              value={confirmPassword}
              underlineColor='black'
              activeUnderlineColor='black'
              textColor='black'
              placeholderTextColor='black'
              theme={{
                colors: {
                  onSurfaceVariant: 'rgba(0, 0, 0, 0.5)',
                },
              }}
              onChangeText={setConfirmPassword}
              secureTextEntry={hidePassword}
            />
            
            {loadingEdit ? (
              <ActivityIndicator size="large" color="#65558F" />
            ) : (
              <Button
                mode="contained"
                onPress={handleChangePassword}
                buttonColor="#65558F"
                textColor="#FFFFFF"
                style={styles.modalButton}
              >
                Change Password
              </Button>
            )}
            <Button mode="text" onPress={() => setChangePasswordModalVisible(false)} style={styles.cancelButton}>
              Cancel
            </Button>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: { backgroundColor: '#65558F', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  leftContainer: { flex: 1, paddingLeft: 10 },
  centerContainer: { flex: 2, alignItems: 'center' },
  logo: { width: 120, height: 40 },
  rightContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10 },
  unreadDot: { position: 'absolute', right: 15, top: 15, width: 10, height: 10, borderRadius: 5, backgroundColor: '#30AE30', zIndex: 1 },
  menuContent: { backgroundColor: 'white', borderColor: '#65558F', borderWidth: 1, borderRadius: 5, justifyContent: 'center'},
  menuTitle: { color: '#65558F', fontSize: 12, marginRight: 4 },
  divider: { backgroundColor: '#65558F' },
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { width: 300, padding: 20, backgroundColor: '#ffffff', borderRadius: 10, alignItems: 'center' },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#65558F' },
  input: { width: '100%', marginVertical: 20, borderColor: '#cccccc', backgroundColor: 'transparent' },
  inputLabel: { alignSelf: 'flex-start', marginBottom: 5, marginTop: 2, fontWeight: 'bold'},
  modalButton: { marginTop: 20, paddingHorizontal: 20 },
  cancelButton: { marginTop: 10 },
  
});
