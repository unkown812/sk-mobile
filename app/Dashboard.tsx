import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
// Placeholder icons - replace with react-native-vector-icons or similar if available
const UsersIcon = () => <Text style={styles.iconPlaceholder}>👥</Text>;
const CreditCardIcon = () => <Text style={styles.iconPlaceholder}>💳</Text>;

// Placeholder components for dashboard widgets
const StatCard = ({ title, value, icon, color, bgcolor }: { title: string; value: string | number; icon: React.ReactNode; color: string; bgcolor: string }) => {
  return (
    <View style={[styles.statCard, { backgroundColor: bgcolor }]}>
      <View style={styles.statIcon}>{icon}</View>
      <Text style={[styles.statTitle, { color }]}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
};

const RecentFeePayments = () => {
  // Placeholder data and UI for recent fee payments
  const payments = [
    { id: 1, studentName: 'John Doe', amount: 5000, date: '2024-06-01' },
    { id: 2, studentName: 'Jane Smith', amount: 4500, date: '2024-06-03' },
    { id: 3, studentName: 'Alice Johnson', amount: 6000, date: '2024-06-05' },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.widgetTitle}>Recent Fee Payments</Text>
      {payments.map(payment => (
        <View key={payment.id} style={styles.listItem}>
          <Text>{payment.studentName}</Text>
          <Text>₹{payment.amount.toLocaleString()}</Text>
          <Text>{payment.date}</Text>
        </View>
      ))}
    </View>
  );
};

const UpcomingExams = () => {
  // Placeholder data and UI for upcoming exams
  const exams = [
    { id: 1, subject: 'Math', date: '2024-06-10' },
    { id: 2, subject: 'Physics', date: '2024-06-12' },
    { id: 3, subject: 'Chemistry', date: '2024-06-15' },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.widgetTitle}>Upcoming Exams</Text>
      {exams.map(exam => (
        <View key={exam.id} style={styles.listItem}>
          <Text>{exam.subject}</Text>
          <Text>{exam.date}</Text>
        </View>
      ))}
    </View>
  );
};

const DueDateReminder = () => {
  // Placeholder data and UI for due date reminders
  const reminders = [
    { id: 1, title: 'Fee Due for John Doe', dueDate: '2024-06-20' },
    { id: 2, title: 'Library Book Return', dueDate: '2024-06-22' },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.widgetTitle}>Due Date Reminders</Text>
      {reminders.map(reminder => (
        <View key={reminder.id} style={styles.listItem}>
          <Text>{reminder.title}</Text>
          <Text>{reminder.dueDate}</Text>
        </View>
      ))}
    </View>
  );
};

const BirthdayReminder = () => {
  // Placeholder data and UI for birthday reminders
  const birthdays = [
    { id: 1, name: 'John Doe', birthday: '2024-06-25' },
    { id: 2, name: 'Jane Smith', birthday: '2024-06-28' },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.widgetTitle}>Birthday Reminders</Text>
      {birthdays.map(birthday => (
        <View key={birthday.id} style={styles.listItem}>
          <Text>{birthday.name}</Text>
          <Text>{birthday.birthday}</Text>
        </View>
      ))}
    </View>
  );
};

const Dashboard = () => {
  const [totalStudents, setTotalStudents] = useState<number | null>(null);
  const [totalFeesCollected, setTotalFeesCollected] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Replace with your supabase and studentService fetch logic compatible with React Native
        // Placeholder data:
        const studentsCount = 100; // example
        const feesCollected = 500000; // example

        setTotalStudents(studentsCount);
        setTotalFeesCollected(feesCollected);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Overview of SK Tutorials management system</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Total Students"
          value={totalStudents ?? 0}
          icon={<UsersIcon />}
          color="#1E40AF" // blue-800
          bgcolor="#DBEAFE" // blue-50
        />
        <StatCard
          title="Fee Collection"
          value={totalFeesCollected !== null ? `₹${totalFeesCollected.toLocaleString()}` : '₹0'}
          icon={<CreditCardIcon />}
          color="#166534" // green-800
          bgcolor="#DCFCE7" // green-50
        />
      </View>

      {/* Placeholder for charts and widgets */}
      <View style={styles.widgetsGrid}>
        {/* Uncomment and implement when ready */}
        {/* <AttendanceChart /> */}
        {/* <PerformanceWidget /> */}
      </View>

      <View style={styles.tablesGrid}>
        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Recent Fee Payments</Text>
          <RecentFeePayments />
        </View>

        <View style={styles.cardContainer}>
          <Text style={styles.cardTitle}>Upcoming Exams</Text>
          <UpcomingExams />
        </View>
      </View>

      <View style={styles.singleCardContainer}>
        <Text style={styles.cardTitle}>Due Date Reminders</Text>
        <DueDateReminder />
      </View>

      <View style={styles.singleCardContainer}>
        <Text style={styles.cardTitle}>Birthday Reminders</Text>
        <BirthdayReminder />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827', // gray-900
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: '#6B7280', // gray-500
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  iconPlaceholder: {
    fontSize: 40,
  },
  widgetsGrid: {
    // Placeholder styles for future charts/widgets
    marginBottom: 24,
  },
  tablesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  cardContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  singleCardContainer: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  card: {
    padding: 16,
    backgroundColor: '#F9FAFB', // gray-50
    borderRadius: 8,
  },
  widgetTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#111827',
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // gray-200
  },
});

export default Dashboard;
