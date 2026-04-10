import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.scriptpanel.app',
  appName: '脚本面板',
  webDir: 'dist/public',
  server: {
    // 允许加载外部URL（面板服务器API）
    allowNavigation: ['*'],
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'ScriptPanel',
    backgroundColor: '#1A1D23',
  },
  plugins: {
    StatusBar: {
      style: 'LIGHT',
      backgroundColor: '#1A1D23',
    },
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 1500,
      backgroundColor: '#1A1D23',
      showSpinner: false,
    },
  },
};

export default config;
