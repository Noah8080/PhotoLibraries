import MediaContextProvider from '~/providers/mediaProviders';
import AuththenticationContextProvider from '~/providers/authenticationProvider';
import '../global.css';

import { Stack } from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <AuththenticationContextProvider>
      <MediaContextProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        </Stack>
      </MediaContextProvider>
    </AuththenticationContextProvider>
  );
}
