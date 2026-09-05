import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rmvn.projectmonitoring',
  appName: 'Project Monitoring by RMVN: for clients',
  webDir: 'dist',
  server: {
    url: 'https://monitoring.upcnovamediateam.workers.dev/',
    cleartext: true,
    errorPath: 'index.html',
    allowNavigation: [
      'monitoring.upcnovamediateam.workers.dev',
      '*.upcnovamediateam.workers.dev',
      '*.workers.dev'
    ]
  }
};

export default config;
