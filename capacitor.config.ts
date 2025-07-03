import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.prepbit.app',
  appName: 'PrepBit',
  webDir: 'dist',
  server: {
    hostname: 'app.prepbit.com',
    androidScheme: 'https',
    cleartext: true
  }
};

export default config;
