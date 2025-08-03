import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { performanceService } from '../../services/performanceService';
import type { Database } from '../../lib/database.types';

type Performance = Database['public']['Tables']['performance']['Row'];

interface StudentPerformanceProps {
  studentId: string;
}

const StudentPerformance: React.FC<StudentPerformanceProps> = ({ studentId }) => {
  const [selectedExamType, setSelectedExamType] = useState('All');
  const [performance, setPerformance] = useState<Performance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setLoading(true);
        const data: Performance[] = await performanceService.getByStudentId(studentId);
        setPerformance(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to fetch performance data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [studentId]);

  const filteredPerformance = performance.filter(
    item => selectedExamType === 'All' || item.exam_name.includes(selectedExamType)
  );

  // Calculate average performance
  const avgPerformance = filteredPerformance.length > 0
    ? Math.round(filteredPerformance.reduce((sum, item) => sum + item.percentage, 0) / filteredPerformance.length)
    : 0;

  // Find highest and lowest performances
  const highestPerformance = filteredPerformance.length > 0
    ? Math.max(...filteredPerformance.map(item => item.percentage))
    : 0;

  const lowestPerformance = filteredPerformance.length > 0
    ? Math.min(...filteredPerformance.map(item => item.percentage))
    : 0;

  // Get exam types for filter
  const examTypes = ['All', 'Monthly Test', 'Quarterly Exam', 'Mock Test'];

  // Get performance trend data
  const performanceTrend = [...filteredPerformance].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.loadingText}>Loading performance data...</Text>
    </View>
  );
  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>Error: {error}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Performance summary */}
      <View style={styles.summaryContainer}>
        <View style={[styles.card, styles.blueCard]}>
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="trending-up" size={24} color="#2563EB" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardLabel}>Average Score</Text>
              <Text style={styles.cardValue}>{avgPerformance}%</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.greenCard]}>
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="emoji-events" size={24} color="#16A34A" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardLabel}>Highest Score</Text>
              <Text style={[styles.cardValue, styles.greenText]}>{highestPerformance}%</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.redCard]}>
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="menu-book" size={24} color="#DC2626" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardLabel}>Lowest Score</Text>
              <Text style={[styles.cardValue, styles.redText]}>{lowestPerformance}%</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <Text style={styles.sectionTitle}>Performance Details</Text>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedExamType}
            onValueChange={(value: string) => setSelectedExamType(value)}
            style={styles.picker}
          >
            {examTypes.map(type => (
              <Picker.Item key={type} label={type} value={type} />
            ))}
          </Picker>
          <MaterialIcons name="filter-list" size={16} color="#9CA3AF" style={styles.pickerIcon} />
        </View>
      </View>

      {/* Performance chart */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Performance Trend</Text>

        {performanceTrend.length > 0 ? (
          <View style={styles.chartContainer}>
            {performanceTrend.map((item, index) => (
              <View key={index} style={styles.chartItem}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: `${item.percentage * 2}%`,
                      backgroundColor: item.percentage >= 80 ? '#16A34A' : 
                                     item.percentage >= 60 ? '#EAB308' : '#DC2626'
                    }
                  ]}
                />
                <Text style={styles.chartLabel}>
                  {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
                <Text style={styles.chartValue}>{item.percentage}%</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No performance data available</Text>
          </View>
        )}
      </View>

      {/* Performance details table */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, styles.tableCell]}>Exam Name</Text>
          <Text style={[styles.tableHeaderText, styles.tableCell]}>Date</Text>
          <Text style={[styles.tableHeaderText, styles.tableCell]}>Percentage</Text>
        </View>
        {filteredPerformance.map((item) => (
          <View key={item.id} style={styles.tableRow}>
            <Text style={styles.tableCell}>{item.exam_name}</Text>
            <Text style={styles.tableCell}>{new Date(item.date).toLocaleDateString()}</Text>
            <View style={styles.tableCell}>
              <View style={[
                styles.badge,
                item.percentage >= 80 ? styles.badgeGreen : 
                item.percentage >= 60 ? styles.badgeYellow : styles.badgeRed
              ]}>
                <Text style={styles.badgeText}>{item.percentage}%</Text>
              </View>
            </View>
          </View>
        ))}
        {filteredPerformance.length === 0 && (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.noRecordsText]}>
              No performance records found
            </Text>
          </View>
        )}
      </View>

      {/* Analysis and recommendations */}
      <View style={[styles.card, styles.analysisCard]}>
        <Text style={styles.sectionTitle}>Performance Analysis</Text>

        <View style={styles.analysisSection}>
          <Text style={styles.analysisHeading}>Strengths</Text>
          <Text style={styles.analysisText}>
            {avgPerformance >= 80 ?
              "Excellent overall performance. Consistently scoring high marks across subjects." :
              avgPerformance >= 70 ?
              "Good grasp of core concepts. Strong performance in most subjects with occasional excellence." :
              "Shows potential in specific exams. Can build on successful study techniques."
            }
          </Text>
        </View>

        <View style={styles.analysisSection}>
          <Text style={styles.analysisHeading}>Areas for Improvement</Text>
          <Text style={styles.analysisText}>
            {avgPerformance >= 80 ?
              "Could focus on achieving greater consistency across all exam types." :
              avgPerformance >= 70 ?
              "Improvement needed in specific challenging areas. Consider more practice tests." :
              "Needs significant work on core concepts and test preparation strategies."
            }
          </Text>
        </View>

        <View style={styles.analysisSection}>
          <Text style={styles.analysisHeading}>Recommendations</Text>
          <View style={styles.recommendationsList}>
            <Text style={styles.recommendationItem}>
              {avgPerformance >= 80 ?
                "• Join advanced study groups for additional challenges" :
                avgPerformance >= 70 ?
                "• Schedule additional practice sessions for weaker areas" :
                "• Attend remedial sessions and increase study hours"
              }
            </Text>
            <Text style={styles.recommendationItem}>
              {avgPerformance >= 70 ?
                "• Consider participating in competitive exams" :
                "• Focus on foundational concepts before advancing"
              }
            </Text>
            <Text style={styles.recommendationItem}>• Regular mock tests to simulate exam conditions</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#374151', // Tailwind gray-700
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444', // Tailwind red-500
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    flex: 1,
    minWidth: 150,
  },
  blueCard: {
    backgroundColor: '#DBEAFE', // Tailwind blue-100
  },
  greenCard: {
    backgroundColor: '#DCFCE7', // Tailwind green-100
  },
  redCard: {
    backgroundColor: '#FEE2E2', // Tailwind red-100
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#BFDBFE', // Tailwind blue-200
    borderRadius: 999,
    padding: 8,
  },
  cardTextContainer: {
    marginLeft: 12,
  },
  cardLabel: {
    fontSize: 12,
    color: '#6B7280', // Tailwind gray-500
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827', // Tailwind gray-900
  },
  greenText: {
    color: '#166534', // Tailwind green-800
  },
  redText: {
    color: '#991B1B', // Tailwind red-800
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827', // Tailwind gray-900
  },
  pickerContainer: {
    position: 'relative',
    flex: 1,
    marginLeft: 16,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#D1D5DB', // Tailwind gray-300
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#111827', // Tailwind gray-900
  },
  pickerIcon: {
    position: 'absolute',
    right: 12,
    top: 16,
  },
  chartContainer: {
    height: 200,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  chartItem: {
    alignItems: 'center',
    flex: 1,
  },
  chartBar: {
    width: '80%',
    borderRadius: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: '#6B7280', // Tailwind gray-500
    marginTop: 8,
    textAlign: 'center',
  },
  chartValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827', // Tailwind gray-900
    marginTop: 4,
  },
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDataText: {
    fontSize: 14,
    color: '#6B7280', // Tailwind gray-500
  },
  table: {
    borderWidth: 1,
    borderColor: '#E5E7EB', // Tailwind gray-200
    borderRadius: 6,
    marginBottom: 24,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB', // Tailwind gray-50
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // Tailwind gray-200
  },
  tableHeaderText: {
    fontWeight: '600',
    fontSize: 12,
    color: '#374151', // Tailwind gray-700
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // Tailwind gray-200
    paddingVertical: 12,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: '#374151', // Tailwind gray-700
    textAlign: 'center',
  },
  noRecordsText: {
    textAlign: 'center',
    color: '#6B7280', // Tailwind gray-500
  },
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeGreen: {
    backgroundColor: '#BBF7D0', // Tailwind green-300
  },
  badgeYellow: {
    backgroundColor: '#FEF9C3', // Tailwind yellow-300
  },
  badgeRed: {
    backgroundColor: '#FECACA', // Tailwind red-300
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827', // Tailwind gray-900
  },
  analysisCard: {
    backgroundColor: '#DBEAFE', // Tailwind blue-100
    borderColor: '#93C5FD', // Tailwind blue-300
  },
  analysisSection: {
    marginBottom: 16,
  },
  analysisHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827', // Tailwind gray-900
    marginBottom: 8,
  },
  analysisText: {
    fontSize: 12,
    color: '#374151', // Tailwind gray-700
  },
  recommendationsList: {
    gap: 4,
  },
  recommendationItem: {
    fontSize: 12,
    color: '#374151', // Tailwind gray-700
  },
});

export default StudentPerformance;

