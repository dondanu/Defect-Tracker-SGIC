import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import Header from './Header';
import Footer from './Footer';

interface ProfileProps {
  onDashboardPress?: () => void;
  onLogoutPress?: () => void;
  onProfilePress?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onDashboardPress, onLogoutPress, onProfilePress }) => {

  const handleLogoutPress = () => {
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
    <SafeAreaView style={styles.container}>
      <Header onLogoutPress={onLogoutPress} />

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>My Profile</Text>

          {/* Profile Photo */}
          <View style={styles.profilePhotoContainer}>
            <View style={styles.profilePhotoWrapper}>
              <Image
                source={require('../../assets/images/mg.jpg')}
                style={styles.profilePhoto}
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.editPhotoButton}>
                <Text style={styles.editPhotoText}>📷</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Form */}
          <View style={styles.formContainer}>

            {/* Name Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <View style={styles.fieldValue}>
                <Text style={styles.fieldText}>Danusan Kuganesan</Text>
              </View>
            </View>

            {/* User ID Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>User ID</Text>
              <View style={styles.fieldValue}>
                <Text style={styles.fieldText}>USR001</Text>
              </View>
            </View>

            {/* Email Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={styles.fieldValue}>
                <Text style={styles.fieldText}>danu@gmail.com</Text>
              </View>
            </View>

            {/* Designation Field */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Designation</Text>
              <View style={styles.fieldValue}>
                <Text style={styles.fieldText}>Senior Developer</Text>
              </View>
            </View>

          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogoutPress}>
            <Text style={styles.logoutButtonText}>🚪 Logout</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      <Footer
        activeTab="profile"
        onDashboardPress={onDashboardPress}
        onProfilePress={onProfilePress}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 30,
  },
  profilePhotoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profilePhotoWrapper: {
    position: 'relative',
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#3b82f6',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  editPhotoText: {
    fontSize: 16,
  },
  formContainer: {
    marginBottom: 40,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  fieldValue: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  fieldText: {
    fontSize: 16,
    color: '#495057',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Profile;
