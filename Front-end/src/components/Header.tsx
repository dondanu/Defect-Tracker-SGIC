import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';

interface HeaderProps {
  onLogoutPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoutPress }) => {

  const handleExitPress = () => {
    Alert.alert(
      'Logout Confirmation',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            if (onLogoutPress) {
              onLogoutPress();
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.titleContainer}>
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logoIcon}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>SGIG Defect Tracker</Text>
      </View>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleExitPress}
      >
        <Image
          source={require('../assets/images/exit.png')}
          style={styles.exitIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 2,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 56,
    height: 50,
    marginRight: 9,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#ffebee',
  },
  exitIcon: {
    width: 22,
    height: 22,
  },

});

export default Header;
