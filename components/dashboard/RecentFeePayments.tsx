import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { paymentService } from '../../services/paymentService';
import type { Database } from '../../lib/database.types';

type Payment = Database['public']['Tables']['payments']['Row'];

const RecentFeePayments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const data = await paymentService.getAll();
        setPayments(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.loadingText}>Loading recent fee payments...</Text>
    </View>
  );
  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>Error: {error}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, styles.studentHeader]}>Student</Text>
        <Text style={[styles.headerText, styles.amountHeader]}>Amount</Text>
        <Text style={[styles.headerText, styles.methodHeader]}>Method</Text>
        <Text style={[styles.headerText, styles.dateHeader]}>Date</Text>
        <Text style={[styles.headerText, styles.descriptionHeader]}>Description</Text>
      </View>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.cell}>{item.student_name}</Text>
            <Text style={styles.cell}>₹{item.amount}</Text>
            <Text style={styles.cell}>{item.payment_method}</Text>
            <Text style={styles.cell}>{new Date(item.payment_date).toLocaleDateString()}</Text>
            <Text style={styles.cell}>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // Tailwind gray-200
    paddingVertical: 8,
    backgroundColor: '#F9FAFB', // Tailwind gray-50
  },
  headerText: {
    fontWeight: '600',
    fontSize: 12,
    color: '#374151', // Tailwind gray-700
  },
  studentHeader: {
    flex: 2,
  },
  amountHeader: {
    flex: 1,
  },
  methodHeader: {
    flex: 1,
  },
  dateHeader: {
    flex: 1,
  },
  descriptionHeader: {
    flex: 2,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // Tailwind gray-200
  },
  cell: {
    fontSize: 12,
    color: '#374151', // Tailwind gray-700
    flex: 1,
  },
});

export default RecentFeePayments;
