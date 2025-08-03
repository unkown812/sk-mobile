import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {icon ? (
          icon
        ) : (
          <MaterialIcons name="error-outline" size={48} color="#9CA3AF" />
        )}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    textAlign: 'center',
  },
  iconContainer: {
    backgroundColor: '#F3F4F6', // Tailwind gray-100
    borderRadius: 9999,
    padding: 12,
  },
  title: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827', // Tailwind gray-900
  },
  message: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280', // Tailwind gray-500
  },
});

export default EmptyState;
