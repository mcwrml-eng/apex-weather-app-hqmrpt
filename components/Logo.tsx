
import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../styles/commonStyles';

interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'default' | 'white' | 'dark';
  showBackground?: boolean;
  style?: any;
}

export default function Logo({ 
  size = 'medium', 
  variant = 'default',
  showBackground = false,
  style 
}: LogoProps) {
  console.log('Logo: Rendering M9 logo with size:', size, 'variant:', variant);

  const handlePress = async () => {
    try {
      console.log('Logo: Opening M9 Facebook page');
      await Linking.openURL('https://www.facebook.com/metservices');
    } catch (error) {
      console.error('Logo: Failed to open Facebook URL:', error);
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 32, height: 32 };
      case 'medium':
        return { width: 48, height: 48 };
      case 'large':
        return { width: 64, height: 64 };
      case 'xlarge':
        return { width: 80, height: 80 };
      default:
        return { width: 48, height: 48 };
    }
  };

  const getContainerStyles = () => {
    if (!showBackground) return {};
    
    return {
      backgroundColor: variant === 'white' ? colors.background : colors.card,
      borderRadius: borderRadius.lg,
      padding: spacing.sm,
      borderWidth: 1,
      borderColor: colors.borderLight,
      boxShadow: shadows.sm,
    };
  };

  const sizeStyles = getSizeStyles();
  const containerStyles = getContainerStyles();

  return (
    <TouchableOpacity 
      style={[styles.container, containerStyles, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Image
        source={require('../assets/images/180143b8-013c-4452-8f96-c3647737b389.jpeg')}
        style={[styles.logo, sizeStyles]}
        resizeMode="contain"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    borderRadius: borderRadius.sm,
  },
});
