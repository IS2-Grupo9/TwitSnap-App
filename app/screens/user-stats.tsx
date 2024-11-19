import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TextInput, Button, ScrollView, TouchableOpacity } from 'react-native';
import { useGlobalSearchParams } from 'expo-router';
import { LineChart } from 'react-native-chart-kit';
import { SnapStats } from '@/components/types/models';
import TopBar from '@/components/TopBar';

interface UserStatsProps {
  showSnackbar: (message: string, type: string) => void;
}

const getDefaultDate = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

export default function UserStatsScreen({ showSnackbar }: UserStatsProps) {
  const { userId } = useGlobalSearchParams<{ userId: string }>();
  const apiStatsUrl = process.env.EXPO_PUBLIC_STATISTICS_URL;

  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  const [snapsInfo, setSnapsInfo] = useState<SnapStats[]>([]);
  const [loading, setLoading] = useState(true);

  const [dateFilterFrom, setDateFilterFrom] = useState('');
  const [dateFilterTo, setDateFilterTo] = useState('');

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`${apiStatsUrl}/statistics/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setFollowerCount(data.follower_counter);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserSnapsStats = async () => {
    const dateRange = dateFilterFrom && dateFilterTo ? `?from=${dateFilterFrom}&to=${dateFilterTo}` : '';
    try {
      const response = await fetch(`${apiStatsUrl}/statistics/user/${userId}/posts${dateRange}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSnapsInfo(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchUserStats();
    fetchUserSnapsStats();
    setLoading(false);
  }, [dateFilterFrom, dateFilterTo]);

  const timelineData = (key: 'like_counter' | 'share_counter') =>
    snapsInfo.map((snap) => ({
      x: new Date(snap.date).toISOString().split('T')[0],
      y: snap[key],
    }));

  const applyDefaultRange = (days: number) => {
    setDateFilterFrom(getDefaultDate(days));
    setDateFilterTo(new Date().toISOString().split('T')[0]);
  };

  return (
    <ScrollView style={styles.container}>
      <TopBar type="back" showNotifications={true} />

      {loading ? (
        <ActivityIndicator size="large" color={styles.primaryColor.color} />
      ) : (
        <>
          <View style={styles.statsContainer}>
            <Text style={styles.statText}>Followers: {followerCount}</Text>
            <Text style={styles.statText}>Following: {followingCount}</Text>
            <Text style={styles.statText}>Snaps: {snapCount}</Text>
          </View>

          <View style={styles.dateFilterContainer}>
            <TextInput
              style={styles.dateInput}
              placeholder="From (YYYY-MM-DD)"
              value={dateFilterFrom}
              onChangeText={setDateFilterFrom}
            />
            <TextInput
              style={styles.dateInput}
              placeholder="To (YYYY-MM-DD)"
              value={dateFilterTo}
              onChangeText={setDateFilterTo}
            />
            <Button title="Apply Filter" onPress={fetchUserSnapsStats} />
          </View>

          <View style={styles.defaultRangeContainer}>
            <TouchableOpacity
              style={styles.rangeButton}
              onPress={() => applyDefaultRange(7)}
            >
              <Text style={styles.rangeButtonText}>Last 7 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rangeButton}
              onPress={() => applyDefaultRange(30)}
            >
              <Text style={styles.rangeButtonText}>Last Month</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rangeButton}
              onPress={() => applyDefaultRange(365)}
            >
              <Text style={styles.rangeButtonText}>Last Year</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.graphContainer}>
            <Text style={styles.graphTitle}>Timeline of Likes</Text>
            <LineChart
              data={{
                labels: timelineData('like_counter').map((data) => data.x),
                datasets: [
                  {
                    data: timelineData('like_counter').map((data) => data.y),
                  },
                ],
              }}
              width={350}
              height={220}
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#f7f7f7',
                backgroundGradientTo: '#f7f7f7',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(51, 102, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
            />
          </View>

          <View style={styles.graphContainer}>
            <Text style={styles.graphTitle}>Timeline of Shares</Text>
            <LineChart
              data={{
                labels: timelineData('share_counter').map((data) => data.x),
                datasets: [
                  {
                    data: timelineData('share_counter').map((data) => data.y),
                  },
                ],
              }}
              width={350}
              height={220}
              chartConfig={{
                backgroundColor: '#FFFFFF',
                backgroundGradientFrom: '#f7f7f7',
                backgroundGradientTo: '#f7f7f7',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
              }}
              bezier
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  statsContainer: {
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    margin: 16,
  },
  statText: {
    fontSize: 16,
    color: '#65558F',
    marginVertical: 4,
  },
  dateFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  dateInput: {
    borderColor: '#6c757d',
    borderWidth: 1,
    padding: 8,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  defaultRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  rangeButton: {
    backgroundColor: '#65558F',
    padding: 10,
    borderRadius: 8,
  },
  rangeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  graphContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#65558F',
    marginBottom: 8,
  },
  primaryColor: {
    color: '#65558F',
  },
  secondaryColor: {
    color: '#6c757d',
  },
});
