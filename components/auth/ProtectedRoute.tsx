import React, { ReactNode } from 'react';
import { useUser } from '../../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { ReactElement, useEffect } from 'react';

interface ProtectedRouteProps {
  children: ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useUser();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate('Login' as never);
    }
  }, [isAuthenticated, navigation]);

  if (!isAuthenticated) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
