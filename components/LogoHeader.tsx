import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

export function LogoHeader(
  { small = false }: { small?: boolean }
) {
  return (
    <View style={styles.container}>
      <Image
        style={small ? styles.logoSmall : styles.logo}
        source={require('../assets/images/logo-twitsnap.png')}
      />
      <Text style={small ? styles.titleSmall : styles.title}>TwitSnap</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  logo: { width: 100, height: 100 },
  logoSmall: { width: 50, height: 50 },
  title: { fontSize: 24, marginTop: 16 },
  titleSmall: { fontSize: 18 },
});