import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useGlobalSearchParams } from 'expo-router';
import { DatePickerModal, enGB, registerTranslation } from 'react-native-paper-dates';
import TopBar from '@/components/TopBar';
import { CartesianChart, Line } from "victory-native";
import { SnapStats } from '@/components/types/models';
registerTranslation('en-GB', enGB);

interface UserStatsProps {
  showSnackbar: (message: string, type: string) => void;
}

const getDefaultDate = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export default function UserStatsScreen({ showSnackbar }: UserStatsProps) {
  const { userId } = useGlobalSearchParams<{ userId: string }>();
  const apiStatsUrl = process.env.EXPO_PUBLIC_STATISTICS_URL;

  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [snapsCount, setSnapsCount] = useState(0);

  const [snapsInfo, setSnapsInfo] = useState<SnapStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<{ startDate: Date; endDate: Date }>({ startDate: getDefaultDate(7), endDate: new Date() });
  const [open, setOpen] = useState(false);

  const onDismiss = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirm = useCallback(
    ({ startDate, endDate }: { startDate: any; endDate: any }) => {
      setOpen(false);
      setRange({ startDate, endDate });
    },
    [setOpen, setRange]
  );

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
        setFollowerCount(data.data.follower_counter);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserSnapsStats = async () => {
    const dateRange = range.startDate && range.endDate &&
      `?from=${range.startDate.toISOString().split('T')[0]}&to=${range.endDate.toISOString().split('T')[0]}` || '';
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
        console.log(data.data);
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
  }, [range]);

  const applyDefaultRange = (days: number) => {
    setRange({ startDate: getDefaultDate(days), endDate: new Date() });
  };

  const DATA = Array.from({ length: 31 }, (_, i) => ({
    day: i,
    highTmp: 40 + 30 * Math.random(),
  }));

  return (
    <>
      <TopBar type="back" showNotifications={true} />
      <ScrollView style={styles.container}>
        <View style={styles.statsContainer}>
          <Text style={styles.statText}>Followers: {followerCount}</Text>
          <Text style={styles.statText}>Following: {followingCount}</Text>
          <Text style={styles.statText}>Snaps: {snapsCount}</Text>
        </View>

        <View style={styles.dateFilterContainer}>
          <TouchableOpacity onPress={() => setOpen(true)} style={styles.rangeButton}>
            <Text style={styles.rangeButtonText}>Pick range</Text>
          </TouchableOpacity>
          <DatePickerModal
            locale="en-GB"
            mode="range"
            visible={open}
            onDismiss={onDismiss}
            startDate={range.startDate}
            endDate={range.endDate}
            onConfirm={onConfirm}
          />
        </View>

        <View style={styles.defaultRangeContainer}>
          <TouchableOpacity onPress={() => applyDefaultRange(7)} style={styles.rangeButton}>
            <Text style={styles.rangeButtonText}>Last 7 days</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => applyDefaultRange(30)} style={styles.rangeButton}>
            <Text style={styles.rangeButtonText}>Last 30 days</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => applyDefaultRange(365)} style={styles.rangeButton}>
            <Text style={styles.rangeButtonText}>Last year</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.graphContainer}>
          <Text style={styles.graphTitle}>Timeline of Likes</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : (
            <CartesianChart
              data={DATA}
              xKey="day"
              yKeys={['highTmp']}
            >
              {({ points }) => (
                <Line
                  points={points.highTmp}
                  color="#4CAF50"
                  strokeWidth={3}
                />
              )}
            </CartesianChart>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7f7f7',
  },
  statsContainer: {
    marginBottom: 20,
  },
  statText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dateFilterContainer: {
    marginBottom: 20,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
  },
  rangeButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  rangeButtonText: {
    color: 'white',
    textAlign: 'center',
  },
  defaultRangeContainer: {
    marginBottom: 20,
  },
  graphContainer: {
    marginBottom: 20,
  },
  graphTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  primaryColor: {
    color: '#65558F',
  },
  secondaryColor: {
    color: '#6c757d',
  },
});
