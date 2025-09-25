import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.1d7eed2e21874433b2b6ee190ff849fc',
  appName: 'modbus-buddy-farm',
  webDir: 'dist',
  server: {
    url: 'https://1d7eed2e-2187-4433-b2b6-ee190ff849fc.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  bundledWebRuntime: false
};

export default config;