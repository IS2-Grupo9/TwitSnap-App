import React, { useState, useEffect } from 'react';
import SnapsView from '@/components/SnapsView';
import TopBar from '@/components/TopBar';
import { useGlobalSearchParams } from 'expo-router';

interface ProfileFeedProps {
  showSnackbar: (message: string, type: string) => void;
}

export default function ProfileFeedScreen({ showSnackbar }: ProfileFeedProps) {
  const { userId } = useGlobalSearchParams<{ userId: string }>();

  return (
    <>
        <TopBar type='back' showNotifications={true} />
        <SnapsView
          showSnackbar={showSnackbar}
          feed={true}
          userFeed={true}
          userId={userId}
        />
    </> 
  );
}