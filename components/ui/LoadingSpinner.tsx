import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
}

const sizeMap = {
  small: 16,
  medium: 32,
  large: 48,
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'medium' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={sizeMap[size]} color="#2563EB" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingSpinner;
