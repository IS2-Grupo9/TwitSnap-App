import { View, Text, StyleSheet } from 'react-native';
import { TopBar } from '@/components/TopBar';

export default function ProfileScreen() {
  
    return (
      <>
        <TopBar type='back' />
        <View style={styles.container}>
          <Text style={styles.title}>Profile</Text>
          <Text style={styles.subtitle}>This is the profile screen</Text>
        </View>
      </>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30 },
  title: { fontSize: 32, fontWeight: 'bold', lineHeight: 32, color: 'black' },
  subtitle: { fontSize: 20, fontWeight: 'bold', color: 'black' },
});