import React, { useState, useEffect } from 'react';
import SnapsView from '@/components/SnapsView';
import TopBar from '@/components/TopBar';
import { useGlobalSearchParams } from 'expo-router';

interface ProfileFeedProps {
  showSnackbar: (message: string, type: string) => void;
}

export default function ProfileFeedScreen({ showSnackbar }: ProfileFeedProps) {
  const { userId, favFeed } = useGlobalSearchParams<{ userId: string, favFeed: string }>();

  return (
    <>
        <TopBar showSnackbar={showSnackbar} type='back' showNotifications={true} />
        <SnapsView
          showSnackbar={showSnackbar}
          feed={true}
          userFeed={true}
          favFeed={favFeed === 'true' ? true : false}
          userId={userId}
        />
    </> 
  );
}