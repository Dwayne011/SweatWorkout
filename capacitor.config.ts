import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.projectpb.workouts',
  appName: 'Project PB',
  webDir: 'dist',
  plugins: {
    // Native Google sign-in. skipNativeAuth keeps the Firebase JS SDK as the
    // source of truth — the plugin runs the native Google flow and returns the
    // credential, then App.tsx signs the JS SDK in with it (see handleGoogleLogin
    // + NATIVE_GOOGLE_SIGNIN.md).
    FirebaseAuthentication: {
      skipNativeAuth: true,
      providers: ['google.com'],
    },
  },
};

export default config;
