import { Capacitor } from '@capacitor/core';
import { useState, useEffect } from 'react';

type Platform = 'web' | 'ios' | 'android';

export const useDeviceType = () => {
  const [platform, setPlatform] = useState<Platform>('web');

  useEffect(() => {
    const platform = Capacitor.getPlatform() as Platform;
    setPlatform(platform);
  }, []);

  return platform;
};
