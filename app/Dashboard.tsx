import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '@/utils/supabase';
import BirthdayReminder from '@/components/dashboard/BirthdayReminder';
import DueDateReminder from '@/components/dashboard/DueDateReminder';
import PerformanceWidget from '@/components/dashboard/PerformanceWidget';
import RecentFeePayments from '@/components/dashboard/RecentFeePayments';
import UpcomingExams from '@/components/dashboard/UpcomingExams';

const Dashboard = () => {
  const [totalStudents, setTotalStudents] = useState<number | null>(null);
  const [totalFeesCollected, setTotalFeesCollected] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: studentsData, error } = await supabase
          .from('students')
          .select('total_fee, paid_fee');
        if (error) throw error;
        if (studentsData) {
          setTotalStudents(studentsData.length);
          const totalFees = studentsData.reduce(
            (sum: number, student: any) => sum + (student.total_fee || 0),
            0
          );
          setTotalFeesCollected(totalFees);
        } else {
          setTotalStudents(0);
          setTotalFeesCollected(0);
        }
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('Unknown error');
      }
      setLoading(false);
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Overview of SK Tutorials management system</Text>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.blueCard]}>
          <Text style={styles.statTitle}>Total Students</Text>
          <Text style={styles.statValue}>{totalStudents}</Text>
        </View>
        <View style={[styles.statCard, styles.greenCard]}>
          <Text style={styles.statTitle}>Fee Collection</Text>
          <Text style={styles.statValue}>₹{totalFeesCollected?.toLocaleString()}</Text>
        </View>
      </View>

      {/* Dashboard Components */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Fee Payments</Text>
        <RecentFeePayments />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Exams</Text>
        <UpcomingExams />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Due Date Reminders</Text>
        <DueDateReminder />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Birthday Reminders</Text>
        <BirthdayReminder />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  blueCard: {
    backgroundColor: '#e0f2fe',
  },
  greenCard: {
    backgroundColor: '#d1fae5',
  },
  statTitle: {
    fontSize: 16,
    color: '#0284c7',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0369a1',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999',
  },
});

export default Dashboard;
