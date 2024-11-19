import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useGlobalSearchParams } from 'expo-router';
import { DatePickerModal, enGB, registerTranslation } from 'react-native-paper-dates';
import TopBar from '@/components/TopBar';
import { CartesianChart, Line } from "victory-native";
import { SnapStats } from '@/components/types/models';
import { useFont } from "@shopify/react-native-skia";
import { get } from 'http';
registerTranslation('en-GB', enGB);


interface UserStatsProps {
  showSnackbar: (message: string, type: string) => void;
}

const getDefaultDate = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  if (days === 0) {
    date.setHours(23, 59, 59, 999);
  }
  return date;
};

export default function UserStatsScreen({ showSnackbar }: UserStatsProps) {
  const { userId } = useGlobalSearchParams<{ userId: string }>();
  const apiStatsUrl = process.env.EXPO_PUBLIC_STATISTICS_URL;

  const font = useFont(require('../../assets/fonts/SpaceMono-Regular.ttf'));

  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [snapsCount, setSnapsCount] = useState(0);

  const [snapsInfo, setSnapsInfo] = useState<SnapStats[]>([]);
  const [DATA, setDATA] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<{ startDate: Date; endDate: Date }>({ startDate: getDefaultDate(7), endDate: getDefaultDate(0) });
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
        setFollowingCount(data.data.followed_counter);
        setSnapsCount(data.data.snap_counter);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserSnapsStats = async () => {
    setLoading(true);
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
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
    fetchUserSnapsStats();
  }, [range]);

  useEffect(() => {
    setDATA(getTimelineData(snapsInfo));
  }, [snapsInfo, range]);

  const applyDefaultRange = (days: number) => {
    setRange({ startDate: getDefaultDate(days), endDate: getDefaultDate(0) });
  };

  const getTimelineData = (snapsInfo: SnapStats[]) => {
    if (!snapsInfo || snapsInfo.length === 0) {
      return [{
        date: new Date().getTime(),
        likes: 0,
        shares: 0,
      }];
    }
  
    const timelineData = snapsInfo.reduce((acc, snap) => {
      let date = new Date(new Date(snap.date).toISOString().split('T')[0]).getTime();
      if (!acc[date]) {
        acc[date] = { likes: 0, shares: 0 };
      }
      acc[date].likes += snap.like_counter;
      acc[date].shares += snap.share_counter;
      return acc;
    }, {} as { [key: number]: { likes: number; shares: number } });

    Object.keys(timelineData).forEach((key) => {
      // Fill previous and next days with 0 values if they don't exist
      const date = parseInt(key);
      const prevDay = date - 24 * 60 * 60 * 1000;
      const nextDay = date + 24 * 60 * 60 * 1000;
      if (!timelineData[prevDay]) {
        timelineData[prevDay] = { likes: 0, shares: 0 };
      }
      if (!timelineData[nextDay]) {
        timelineData[nextDay] = { likes: 0, shares: 0 };
      }
    });

    // Set 0 values for the first and last days of the range if they don't exist
    const firstDay = new Date(range.startDate).getTime();
    const lastDay = new Date(range.endDate).getTime();
    if (!timelineData[firstDay]) {
      timelineData[firstDay] = { likes: 0, shares: 0 };
    }
    if (!timelineData[lastDay]) {
      timelineData[lastDay] = { likes: 0, shares: 0 };
    }

    // Only keep the days within the range
    const filteredData = Object.keys(timelineData)
      .filter((key) => parseInt(key) >= firstDay && parseInt(key) <= lastDay)
      .map((key) => ({ date: parseInt(key), likes: timelineData[parseInt(key)].likes, shares: timelineData[parseInt(key)].shares }));

    return filteredData;
  };

  const formatLabel = () => {
    return (date: number) => {
      let options;
      if (range.endDate.getTime() - range.startDate.getTime() > 30 * 24 * 60 * 60 * 1000) {
        options = { 
          month: 'short' as const,
          year: '2-digit' as const,
        };
      } else {
        options = { 
          day: '2-digit' as const,
          month: '2-digit' as const,
        };
      }
      return new Date(date).toLocaleDateString('en-US', options);
    }
  };

  const formatRange = () => {
    const options = { 
      year: 'numeric' as const,
      month: 'short' as const,
      day: 'numeric' as const,
    };
    return `${range.startDate.toLocaleDateString('en-US', options)} - ${range.endDate.toLocaleDateString('en-US', options)}`;
  }

  return (
    <>
      <TopBar type="back" showNotifications={true} />
      <View style={styles.container}>
      {loading ? ( 
        <ActivityIndicator size="large" color="#65558F" />
      ) : (
        <ScrollView style={styles.scrollContainer}>
          <Text style={styles.userStatsTitle}>User Stats</Text>
          <View style={styles.userStatsContainer}>
            <Text style={styles.statText}>User ID: {userId}</Text>
            <View style={styles.statsContainer}>
              <Text style={styles.statText}>Followers: {followerCount}</Text>
              <Text style={styles.statText}>Following: {followingCount}</Text>
              <Text style={styles.statText}>Snaps: {snapsCount}</Text>
            </View>
          </View>

          <Text style={styles.snapStatsTitle}>Snap stats for</Text>
          <Text style={styles.rangeTitle}> 
            {formatRange()}
          </Text>
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
            <TouchableOpacity onPress={() => applyDefaultRange(7)} style={styles.defaultRangeButton}>
              <Text style={styles.defaultRangeText}>Last 7 days</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => applyDefaultRange(30)} style={styles.defaultRangeButton}>
              <Text style={styles.defaultRangeText}>Last 30 days</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => applyDefaultRange(365)} style={styles.defaultRangeButton}>
              <Text style={styles.defaultRangeText}>Last year</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsContainer}>
            <Text style={styles.statText}>Likes: {snapsInfo.reduce((acc, snap) => acc + snap.like_counter, 0)}</Text>
            <Text style={styles.statText}>Shares: {snapsInfo.reduce((acc, snap) => acc + snap.share_counter, 0)}</Text>
          </View>
          <View style={styles.graphContainer}>
            <Text style={styles.graphTitle}>Likes</Text>
            <CartesianChart
              data={DATA}
              xKey="date"
              yKeys={["likes"]}
              axisOptions={{ 
                font: font,
                tickCount: 3,
                formatXLabel: formatLabel(),
              }}
            >
              {({ points }) => (
                <>
                  <Line points={points.likes} color="red" strokeWidth={3} />
                </>
              )}
            </CartesianChart>
          </View>
          <View style={styles.graphContainer}>
            <Text style={styles.graphTitle}>Shares</Text>
            <CartesianChart
              data={DATA}
              xKey="date"
              yKeys={["shares"]}
              axisOptions={{ 
                font: font,
                tickCount: 3,
                formatXLabel: formatLabel(),
              }}
            >
              {({ points }) => (
                <>
                  <Line points={points.shares} color="blue" strokeWidth={3} />
                </>
              )}
            </CartesianChart>
          </View>
        </ScrollView>
      )}
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  userStatsContainer: {
    flexDirection: 'column',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    marginBottom: 20,
  },
  userStatsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#333333',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statText: {
    fontSize: 16,
    paddingVertical: 5,
    fontWeight: '600',
    color: '#555555',
    textAlign: 'center',
  },
  snapStatsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333333',
    textAlign: 'center',
  },
  rangeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#65558F',
    textAlign: 'center',
    marginBottom: 10,
  },
  dateFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  rangeButton: {
    backgroundColor: '#65558F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    width: '90%',
  },
  defaultRangeButton: {
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  rangeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  defaultRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  defaultRangeText: {
    color: '#65558F',
    fontSize: 14,
    fontWeight: 'bold',
  },
  graphContainer: {
    height: 300,
    margin: 10,
    padding: 10,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333333',
    textAlign: 'center',
  },
  primaryColor: {
    color: '#65558F',
  },
  secondaryColor: {
    color: '#6c757d',
  },
});
