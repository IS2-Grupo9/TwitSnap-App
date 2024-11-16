import React, { useState, useEffect } from 'react';
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
