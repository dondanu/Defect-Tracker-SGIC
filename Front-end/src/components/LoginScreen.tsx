import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native';
import TouchID from 'react-native-touch-id';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from './Logo';
import { loginUser } from '../api/auth';

const { height: screenHeight } = Dimensions.get('window');

interface LoginProps {
  onLogin: (username: string, password: string) => void;
}

const LoginScreen: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Determine screen size categories
  const isVerySmallScreen = screenHeight < 600;
  const isSmallScreen = screenHeight < 700;
  const logoSize = isVerySmallScreen ? 80 : isSmallScreen ? 100 : 120;

  useEffect(() => {
    checkBiometricSupport();
    // Don't load saved credentials - always start with empty fields
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const biometryType = await TouchID.isSupported();
      console.log('Biometric support detected:', biometryType);
      setIsBiometricSupported(true);
    } catch (error) {
      console.log('Biometric support error:', error);
      setIsBiometricSupported(false);
    }
  };

  const loadSavedCredentials = async () => {
    try {
      const savedUsername = await AsyncStorage.getItem('savedUsername');
      const savedPassword = await AsyncStorage.getItem('savedPassword');

      if (savedUsername) {
        setUsername(savedUsername);
      }
      if (savedPassword) {
        setPassword(savedPassword);
      }

      // Log for debugging on physical device
      console.log('Loaded saved credentials:', {
        hasUsername: !!savedUsername,
        hasPassword: !!savedPassword
      });
    } catch (error) {
      console.log('Error loading saved credentials:', error);
    }
  };

  const clearInputFields = () => {
    setUsername('');
    setPassword('');
    setFullName('');
    setConfirmPassword('');
  };

  const clearSavedCredentials = async () => {
    try {
      await AsyncStorage.removeItem('savedUsername');
      await AsyncStorage.removeItem('savedPassword');
      clearInputFields();
      Alert.alert('Success', 'Saved credentials cleared!');
    } catch (error) {
      console.log('Error clearing saved credentials:', error);
    }
  };

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser({ username, password });
      console.log('LOGIN DEBUG: full response =', response);

      if (response.success) {
        // Save token if provided (API returns token as response.data, which should be a string)
        if (typeof response.data === 'string') {
          await AsyncStorage.setItem('authToken', response.data);
          const checkToken = await AsyncStorage.getItem('authToken');
          console.log('LOGIN DEBUG: authToken saved =', checkToken);
        } else {
          console.log('LOGIN DEBUG: Unexpected token type:', typeof response.data, response.data);
        }

        // Save credentials for biometric login
        await AsyncStorage.setItem('savedUsername', username);
        await AsyncStorage.setItem('savedPassword', password);
        console.log('LOGIN DEBUG: saved credentials for biometric login');

        // Call the onLogin callback
        onLogin(username, password);
      } else {
        Alert.alert('Login Failed', response.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Login Failed', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!fullName || !username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    // Don't save credentials - always start fresh

    Alert.alert('Success', 'Account created successfully!', [
      { text: 'OK', onPress: () => setIsSignUp(false) }
    ]);
  };

  const handleForgotPassword = () => {
    if (!username) {
      Alert.alert('Enter Username', 'Please enter your username first');
      return;
    }

    Alert.alert(
      'Reset Password',
      `Password reset instructions have been sent to the user: ${username}`,
      [{ text: 'OK' }]
    );
  };

  const handleBiometricLogin = async () => {
    try {
      // Check if biometrics are supported
      const biometryType = await TouchID.isSupported();
      console.log('Attempting biometric login, type:', biometryType);

      if (biometryType) {
        const result = await TouchID.authenticate('Use your fingerprint to login to SGIG Defect Tracker', {
          title: 'Biometric Authentication',
          fallbackLabel: 'Use Password',
        });

        if (result) {
          // For biometric login, try to get saved credentials only
          try {
            const savedUsername = await AsyncStorage.getItem('savedUsername');
            const savedPassword = await AsyncStorage.getItem('savedPassword');

            if (savedUsername && savedPassword) {
              setIsLoading(true);
              const response = await loginUser({ username: savedUsername, password: savedPassword });

              if (response.success) {
                if (typeof response.data === 'string') {
                  await AsyncStorage.setItem('authToken', response.data);
                  const checkToken = await AsyncStorage.getItem('authToken');
                  console.log('LOGIN DEBUG: authToken saved (biometric) =', checkToken);
                } else {
                  console.log('LOGIN DEBUG: Unexpected token type (biometric):', typeof response.data, response.data);
                }
                onLogin(savedUsername, savedPassword);
              } else {
                Alert.alert('Login Failed', 'Saved credentials are invalid. Please login manually.');
              }
              setIsLoading(false);
            } else {
              Alert.alert('No Saved Credentials', 'No saved credentials found. Please login manually first.');
            }
          } catch (error) {
            console.error('Biometric login error:', error);
            Alert.alert('Login Failed', 'Biometric login failed. Please try manual login.');
            setIsLoading(false);
          }
        }
      } else {
        Alert.alert('Biometric Not Available', 'Biometric authentication is not available on this device.');
      }
    } catch (error) {
      console.log('Biometric error:', error);
      Alert.alert('Authentication Failed', 'Biometric authentication failed. Please try again or use username/password.');
    }
  };

  const renderFormContent = () => (
    <>
      <Text style={styles.title}>
        {isSignUp ? 'Create Account' : 'Welcome Back'}
      </Text>
      <Text style={styles.subtitle}>
        {isSignUp
          ? 'Sign up to start tracking defects'
          : 'Sign in to your account'
        }
      </Text>

      {/* Sign Up Fields */}
      {isSignUp && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>👤</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#999"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
        </View>
      )}

      {/* Username Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputIcon}>👤</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="#999"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
      </View>

      {/* Password Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.inputIcon}>🔒</Text>
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.eyeIconText}>
            {showPassword ? "👁️" : "👁️"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Confirm Password Field (Sign Up) */}
      {isSignUp && (
        <View style={styles.inputContainer}>
          <Text style={styles.inputIcon}>🔒</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Text style={styles.eyeIconText}>
              {showConfirmPassword ? "👁️" : "👁️"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Forgot Password Link (Login only) */}
      {!isSignUp && (
        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={handleForgotPassword}
          onLongPress={clearSavedCredentials}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      )}

      {/* Main Action Button */}
      <TouchableOpacity
        style={[styles.primaryButton, isLoading && styles.disabledButton]}
        onPress={isSignUp ? handleSignUp : handleLogin}
        disabled={isLoading}
      >
        <LinearGradient
          colors={['#1a237e', '#3949ab']}
          style={styles.buttonGradient}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Biometric Login (Login only) */}
      {!isSignUp && (
        <TouchableOpacity
          style={styles.biometricButton}
          onPress={handleBiometricLogin}
        >
          <Text style={styles.biometricIcon}></Text>
          {!isSmallScreen && <Text style={styles.biometricButtonText}>Login with Fingerprint</Text>}
          {isSmallScreen && <Text style={styles.biometricButtonText}>Fingerprint</Text>}
        </TouchableOpacity>
      )}

      {/* Divider */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Toggle Sign Up/Login */}
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => {
          setIsSignUp(!isSignUp);
          setFullName('');
          setConfirmPassword('');
        }}
      >
        <Text style={styles.toggleButtonText}>
          {isSignUp
            ? 'Already have an account? Sign In'
            : "Don't have an account? Sign Up"
          }
        </Text>
      </TouchableOpacity>
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      <LinearGradient
        colors={['#1a237e', '#3949ab', '#5c6bc0']}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.mainContainer}>
            {/* Logo Section - Flexible */}
            <View style={[styles.logoContainer, isSmallScreen && styles.logoContainerSmall]}>
              <Logo
                size={logoSize}
                showText={!isVerySmallScreen}
                showSubtitle={false}
              />
            </View>

            {/* Form Container */}
            <View style={[styles.formContainer, isSmallScreen && styles.formContainerSmall]}>
              <View style={styles.formContent}>
                {renderFormContent()}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logoContainer: {
    alignItems: 'center',
    flex: 0.25,
    justifyContent: 'center',
    minHeight: 10,
  },
  logoContainerSmall: {
    flex: 0.12,
    minHeight: 45,
  },
  formContainer: {
    flex: 0.7,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 25,
    paddingVertical: 0,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    justifyContent: 'center',
  },
  formContainerSmall: {
    flex: 0.75,
    paddingHorizontal: 20,
    paddingVertical: 0,
    borderRadius: 15,
  },
  formContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 0,
    marginVertical: 0,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
    marginTop: -15,
    paddingTop: 0,
    color: '#1a237e',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    marginTop: 0,
    color: '#666',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: 5,
  },
  eyeIconText: {
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 12,
    marginTop: -2,
  },
  forgotPasswordText: {
    color: '#1a237e',
    fontSize: 13,
    fontWeight: '500',
  },
  primaryButton: {
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#1a237e',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(26, 35, 126, 0.1)',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 5,
    marginTop: 0,
    borderWidth: 1,
    borderColor: 'rgba(26, 35, 126, 0.2)',
  },
  biometricIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  biometricButtonText: {
    color: '#1a237e',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: 0,
    marginBottom: 0,
    marginTop: 0,
    paddingBottom: 0,
  },
  toggleButtonText: {
    color: '#1a237e',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;