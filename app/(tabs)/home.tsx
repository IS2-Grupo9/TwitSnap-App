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

  return (
    <SnapsView
      showSnackbar={showSnackbar}
      targetUser={targetUser}
      setTargetUser={setTargetUser}
      feed={true}
    />    
  );
}
