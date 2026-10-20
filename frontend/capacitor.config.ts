import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.moodly.app',
  appName: 'Moodly',
  webDir: 'dist',
  // LOCAL DEMO ONLY: lets the Android app call the API over plain HTTP on the
  // local network (http://192.168.x.x:3000). Without it, Android blocks the calls
  // (cleartext traffic / mixed content). Remove this block once the API is served over HTTPS.
  server: {
    androidScheme: 'http',
    cleartext: true,
  },
}

export default config
