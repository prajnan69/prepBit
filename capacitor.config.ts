import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.prepbit.app',
  appName: 'PrepBit',
  webDir: 'dist',
  plugins: {
    Browser: {
      "enabled": true
    }
  }
};

export default config;
