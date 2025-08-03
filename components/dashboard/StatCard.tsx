import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  color: string;
  bgcolor: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, bgcolor }) => {
  // Since we don't have the change prop in the interface but it's used in the commented code,
  // we'll add it to the interface and component props
  const isPositive = true; // Placeholder since we don't have change prop
  
  return (
    <View style={[styles.card, { backgroundColor: bgcolor }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: color }]}>
          {icon}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.valueContainer}>
            <Text style={styles.value}>{value}</Text>
            {/* <View style={[styles.changeContainer, { color: isPositive ? '#16A34A' : '#DC2626' }]}>
              {isPositive ? (
                <MaterialIcons name="trending-up" size={12} color="#16A34A" />
              ) : (
                <MaterialIcons name="trending-down" size={12} color="#DC2626" />
              )}
              <Text style={styles.changeText}>{Math.abs(0)}%</Text>
            </View> */}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    margin: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    padding: 12,
    borderRadius: 999,
  },
  textContainer: {
    marginLeft: 20,
  },
  title: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280', // Tailwind gray-500
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827', // Tailwind gray-900
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default StatCard;
