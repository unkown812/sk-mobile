import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const PerformanceWidget: React.FC = () => {
  const performanceData = [
    { course: '10th Science', avgScore: 82, improvement: 5.2 },
    { course: '12th PCM', avgScore: 78, improvement: 3.4 },
    { course: 'JEE Foundation', avgScore: 75, improvement: 6.8 },
    { course: 'NEET Foundation', avgScore: 81, improvement: 4.7 }
  ];

  return (
    <View style={styles.container}>
      {performanceData.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          <View>
            <Text style={styles.courseName}>{item.course}</Text>
            <Text style={styles.avgScore}>Avg. Score: {item.avgScore}%</Text>
          </View>
          <Text style={styles.improvement}>+{item.improvement}% improvement</Text>
        </View>
      ))}
      <View style={styles.buttonContainer}>
        <TouchableOpacity>
          <Text style={styles.buttonText}>View detailed report →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Tailwind gray-200
    borderRadius: 8,
    marginBottom: 8,
  },
  courseName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#111827', // Tailwind gray-900
  },
  avgScore: {
    fontSize: 12,
    color: '#6B7280', // Tailwind gray-500
    marginTop: 4,
  },
  improvement: {
    fontSize: 12,
    color: '#16A34A', // Tailwind green-600
  },
  buttonContainer: {
    marginTop: 8,
  },
  buttonText: {
    fontSize: 12,
    color: '#2563EB', // Tailwind primary
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default PerformanceWidget;
