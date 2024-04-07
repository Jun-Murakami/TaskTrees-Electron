import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.electron.tasktrees',
  appName: 'TaskTrees',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
