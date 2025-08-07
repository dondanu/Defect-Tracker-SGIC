import React, { useState, useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';
import DashboardScreen from './components/DashboardScreen';
import Profile from './components/Profile';

type Screen = 'dashboard' | 'profile';

// Global navigation state
let globalSetCurrentScreen: ((screen: Screen) => void) | null = null;

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');

  // Set global navigation function
  globalSetCurrentScreen = setCurrentScreen;

  // Listen for navigation events
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('NAVIGATE_TO_PROFILE', () => {
      console.log('EVENT RECEIVED: NAVIGATE_TO_PROFILE');
      setCurrentScreen('profile');
    });

    return () => subscription.remove();
  }, []);

  if (currentScreen === 'profile') {
    return (
      <Profile
        onDashboardPress={() => setCurrentScreen('dashboard')}
        onLogoutPress={() => setCurrentScreen('dashboard')}
        onProfilePress={() => setCurrentScreen('profile')}
      />
    );
  }

  const profileFunction = () => {
    console.log('PROFILE FUNCTION CALLED - NAVIGATING NOW!');
    setCurrentScreen('profile');
  };

  console.log('App: Passing profileFunction to DashboardScreen:', typeof profileFunction);

  return (
    <DashboardScreen
      onProfilePress={profileFunction}
      onLogoutPress={() => setCurrentScreen('dashboard')}
    />
  );
};

export default App;

// Export direct navigation function
export const forceNavigateToProfile = () => {
  console.log('NAVIGATING TO PROFILE NOW!');
  console.log('globalSetCurrentScreen exists:', !!globalSetCurrentScreen);
  if (globalSetCurrentScreen) {
    console.log('CALLING globalSetCurrentScreen with profile');
    globalSetCurrentScreen('profile');
    console.log('CALLED globalSetCurrentScreen');
  } else {
    console.log('ERROR: globalSetCurrentScreen is null!');
  }
};
