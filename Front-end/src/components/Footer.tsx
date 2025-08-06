import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface FooterProps {
  onDashboardPress?: () => void;
  onProjectsPress?: () => void;
  onAnalyticsPress?: () => void;
  onProfilePress?: () => void;
  activeTab?: 'dashboard' | 'projects' | 'analytics' | 'profile';
}

const Footer: React.FC<FooterProps> = ({
  onDashboardPress,
  onProjectsPress,
  onAnalyticsPress,
  onProfilePress,
  activeTab = 'dashboard'
}) => {
  return (
    <View style={styles.footerContainer}>
      {/* Dashboard Tab */}
      <TouchableOpacity
        style={[
          styles.footerButton,
          activeTab === 'dashboard' && styles.activeButton
        ]}
        onPress={() => {
          onDashboardPress?.();
        }}
      >
        <Image
          source={require('../assets/images/dash.png')}
          style={styles.iconImage}
        />
        <Text style={[
          styles.tabLabel,
          { color: activeTab === 'dashboard' ? '#3b82f6' : '#666' }
        ]}>
          Dashboard
        </Text>
      </TouchableOpacity>

      {/* Projects Tab */}
      <TouchableOpacity
        style={[
          styles.footerButton,
          activeTab === 'projects' && styles.activeButton
        ]}
        onPress={() => {
          onProjectsPress?.();
        }}
      >
        <Image
          source={require('../assets/images/project.png')}
          style={styles.iconImage}
        />
        <Text style={[
          styles.tabLabel,
          { color: activeTab === 'projects' ? '#3b82f6' : '#666' }
        ]}>
          Projects
        </Text>
      </TouchableOpacity>

      {/* Analytics Tab */}
      <TouchableOpacity
        style={[
          styles.footerButton,
          activeTab === 'analytics' && styles.activeButton
        ]}
        onPress={() => {
          onAnalyticsPress?.();
        }}
      >
        <Image
          source={require('../assets/images/analytics.png')}
          style={styles.iconImage}
        />
        <Text style={[
          styles.tabLabel,
          { color: activeTab === 'analytics' ? '#3b82f6' : '#666' }
        ]}>
          Analytics
        </Text>
      </TouchableOpacity>

      {/* Profile Tab */}
      <TouchableOpacity
        style={[
          styles.footerButton,
          activeTab === 'profile' && styles.activeButton
        ]}
        onPress={() => {
          onProfilePress?.();
        }}
      >
        <Image
          source={require('../assets/images/profile.png')}
          style={styles.iconImage}
        />
        <Text style={[
          styles.tabLabel,
          { color: activeTab === 'profile' ? '#3b82f6' : '#666' }
        ]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#3a31b8ff',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  footerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: -2,
    paddingHorizontal: 4,
    borderRadius: 12,
    backgroundColor: 'transparent',
    minWidth: 20,
  },
  activeButton: {
    backgroundColor: '#e6f2ff',
  },
  iconText: {
    fontSize: 20,
    marginBottom: 2,
  },
  iconImage: {
    width: 38,
    height: 38,
    marginBottom: -2,
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default Footer;
