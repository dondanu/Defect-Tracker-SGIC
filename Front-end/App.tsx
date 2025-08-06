import React, { useState, useEffect } from 'react';
import DashboardScreen from './src/components/DashboardScreen';
import Profile from './src/components/Profile';
import LoginScreen from './src/components/LoginScreen';
import ProjectDetailScreen from './src/components/ProjectDetailScreen';

// Suppress React Native error screens for API errors
import { LogBox } from 'react-native';

type Screen = 'dashboard' | 'profile' | 'project';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [selectedProject, setSelectedProject] = useState<{id: number, name: string} | null>(null);

  // Suppress specific error warnings in development
  useEffect(() => {
    // Ignore specific warnings that we handle gracefully
    LogBox.ignoreLogs([
      'Error fetching Remark Ratio',
      'Error fetching Defects by Module',
      'AxiosError: Request failed with status code 404',
      'AxiosError: Request failed with status code 400',
      'Network Error',
      'timeout'
    ]);
  }, []);

  // Handle login
  const handleLogin = (email: string, password: string) => {
    setUserEmail(email);
    setIsLoggedIn(true);
    setCurrentScreen('dashboard');
  };

  // Handle logout (from anywhere)
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail('');
    setCurrentScreen('dashboard');
    setSelectedProject(null);
  };

  // Handle project selection
  const handleProjectPress = (projectId: number, projectName: string) => {
    setSelectedProject({ id: projectId, name: projectName });
    setCurrentScreen('project');
  };

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (currentScreen === 'profile') {
    return (
      <Profile
        userEmail={userEmail}
        onDashboardPress={() => setCurrentScreen('dashboard')}
        onLogoutPress={handleLogout}
        onProfilePress={() => setCurrentScreen('profile')}
      />
    );
  }

  if (currentScreen === 'project' && selectedProject) {
    return (
      <ProjectDetailScreen
        projectId={selectedProject.id}
        projectName={selectedProject.name}
        onDashboardPress={() => setCurrentScreen('dashboard')}
        onProfilePress={() => setCurrentScreen('profile')}
        onLogoutPress={handleLogout}
      />
    );
  }

  const profileFunction = () => {
    setCurrentScreen('profile');
  };

  return (
    <DashboardScreen
      onProfilePress={profileFunction}
      onLogoutPress={handleLogout}
      onProjectPress={handleProjectPress}
    />
  );
};

export default App;