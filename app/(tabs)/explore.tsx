import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ExploreScreen() {

  return (
    <View style={styles.container}>
      <Text>Explore</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 30 },
});
