import React from 'react';
import { View, Image, Text, StyleSheet, ViewProps } from 'react-native';

export type LogoHeaderProps = ViewProps & {
  small?: boolean;
};

export function LogoHeader(
  { small = false,
    style,
  }: LogoHeaderProps
) {
  return (
    <View style={[small ? styles.containerSmall : styles.container, style]}>
      <Image
        style={small ? styles.logoSmall : styles.logo}
        source={require('../assets/images/logo-twitsnap.png')}
      />
      <Text style={small ? styles.titleSmall : styles.title}>TwitSnap</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 10 },
  containerSmall: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 10 },
  logo: { width: 200, height: 200, marginBottom: -30 },
  logoSmall: { width: 80, height: 80, marginRight: 10 },
  title: { fontSize: 48, marginTop: 16, fontWeight: 'bold' , color: 'white'},
  titleSmall: { fontSize: 40 , fontWeight: 'bold' , color: 'white'},
});