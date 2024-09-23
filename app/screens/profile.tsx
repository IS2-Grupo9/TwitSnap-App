import { View, Text, StyleSheet, Image } from 'react-native';
import { TopBar } from '@/components/TopBar';
import { useAuth } from '@/components/contexts/AuthContext';
import { LogoHeader } from '@/components/LogoHeader';

export default function ProfileScreen() {
  const { auth } = useAuth();

  const formatDate = (dateString : string | undefined) => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <>
      <TopBar type='back' />
      <View style={styles.container}>
        <Image style={styles.avatar} source={require('@/assets/images/avatar.png')} />
        <Text style={styles.title}>{auth?.user?.username}</Text>
        <Text style={styles.subtitle}>Join date: {formatDate(auth?.user?.createdAt)}</Text>

      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30, backgroundColor: '#f0f0f0' },
  avatar: { width: 200, height: 200, borderRadius: 50, marginBottom: 20 }, // Add styling for the avatar image
  title: { fontSize: 32, fontWeight: 'bold', lineHeight: 32, color: '#65558F', textAlign: 'center' },
  subtitle: { fontSize: 20, fontWeight: 'bold', color: '#65558F', textAlign: 'center', marginTop: 10 },
});
