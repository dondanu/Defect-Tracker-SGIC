import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface LogoProps {
  size?: number;
  showText?: boolean;
  showSubtitle?: boolean;
}

const Logo: React.FC<LogoProps> = ({
  size = 150,
  showText = true,
  showSubtitle = true
}) => {

  const renderLogoIcon = () => {
    return (
      <View style={[styles.logoContainer, { width: size, height: size }]}>
        <Image
          source={require('../../assets/images/log2.png')}
          style={[styles.logoImage, { width: size, height: size }]}
          resizeMode="contain"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderLogoIcon()}
      {showText && (
        <>
          <Text style={styles.appTitle}>DefectTracker Pro</Text>
          {showSubtitle && <Text style={styles.appSubtitle}>Professional Bug Management</Text>}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  logoImage: {
    // Image will be sized by the width/height props
  },

  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});

export default Logo;
