import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import { ExtendedSnap } from '@/components/types/models';
import SnapsView from '@/components/SnapsView';

interface HomeScreenProps {
  showSnackbar: (message: string, type: string) => void;
  targetUser: string;
  setTargetUser: (user: string) => void;
}

export default function HomeScreen({ showSnackbar, targetUser, setTargetUser }: HomeScreenProps) {
  const { auth } = useAuth();
  const [trigger, setTrigger] = useState(false);
  const postsApiUrl = process.env.EXPO_PUBLIC_POSTS_URL;

  const fetchSnaps = async () => {
    try {
      const response = await fetch(`${postsApiUrl}/snaps`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        showSnackbar('Failed to fetch snaps.', 'error');
        return [];
      }
      const snaps = await response.json();
      const completedSnaps = snaps.data?.map((snap: any) => ({
        ...snap,
        liked: false,
        editable: snap.user === String(auth.user?.id),
        username: 'Unknown',
      }));
      completedSnaps.sort((a: ExtendedSnap, b: ExtendedSnap) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      return completedSnaps;
    } catch (error) {
      showSnackbar('Failed to fetch snaps.', 'error');
      return [];
    }
  };

  return (
    <SnapsView
      showSnackbar={showSnackbar}
      targetUser={targetUser}
      setTargetUser={setTargetUser}
      fetchSnaps={fetchSnaps}
      trigger={trigger}
      setTrigger={setTrigger}
      feed={true}
    />    
  );
}
