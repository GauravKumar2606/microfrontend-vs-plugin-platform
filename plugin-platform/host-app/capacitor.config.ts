import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourbank.bankingplatform',
  appName: 'Banking Platform',
  webDir: 'dist/host-app/browser',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#003087'
    }
  }
};

export default config;
