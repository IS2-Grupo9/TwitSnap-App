import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/contexts/AuthContext';
import { ExtendedSnap, User } from '@/components/types/models';
import SnapsView from '@/components/SnapsView';

interface HomeScreenProps {
  showSnackbar: (message: string, type: string) => void;
}

export default function HomeScreen({ showSnackbar }: HomeScreenProps) {
  return (
    <SnapsView
      showSnackbar={showSnackbar}
      feed={true}
    />    
  );
}
