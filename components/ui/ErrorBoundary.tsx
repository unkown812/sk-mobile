import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <MaterialIcons name="error-outline" size={48} color="#EF4444" />
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            An error occurred while rendering this component.
            Please try refreshing the page.
          </Text>
          <TouchableOpacity
            onPress={() => {
              // Reload the app - in React Native, this can be done via DevSettings or other means
              // For now, just log or handle accordingly
              console.log('Refresh requested');
            }}
            style={styles.button}
          >
            <Text style={styles.buttonText}>Refresh Page</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  title: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827', // Tailwind gray-900
  },
  message: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280', // Tailwind gray-500
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#2563EB', // Tailwind primary
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ErrorBoundary;
