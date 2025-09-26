import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.modbusbud',
  appName: 'modbus-buddy-farm',
  webDir: 'dist',
  server: {
    url: 'https://1d7eed2e-2187-4433-b2b6-ee190ff849fc.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;