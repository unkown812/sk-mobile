import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { paymentService } from '../../services/paymentService';
import type { Database } from '../../lib/database.types';

type Payment = Database['public']['Tables']['payments']['Row'];

interface StudentFeeHistoryProps {
  studentId: string;
}

const StudentFeeHistory: React.FC<StudentFeeHistoryProps> = ({ studentId }) => {
  const [feeHistory, setFeeHistory] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeeHistory = async () => {
      try {
        setLoading(true);
        const data = await paymentService.getByStudentId(studentId);
        setFeeHistory(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch fee history');
      } finally {
        setLoading(false);
      }
    };
    fetchFeeHistory();
  }, [studentId]);

  // Calculate total paid and total due
  const totalAmount = feeHistory.reduce((sum, fee) => sum + fee.amount, 0);
  const totalPaid = feeHistory
    .filter(fee => fee.status === 'Paid')
    .reduce((sum, fee) => sum + fee.amount, 0);
  const totalDue = totalAmount - totalPaid;
  
  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.loadingText}>Loading fee history...</Text>
    </View>
  );
  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>Error: {error}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Fee summary */}
      <View style={styles.summaryContainer}>
        <View style={[styles.card, styles.blueCard]}>
          <View style={styles.cardContent}>
            <View>
              <Text style={styles.cardLabel}>Total Fee</Text>
              <Text style={styles.cardValue}>₹{totalAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.iconContainer}>
              <MaterialIcons name="credit-card" size={24} color="#2563EB" />
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.greenCard]}>
          <View style={styles.cardContent}>
            <View>
              <Text style={styles.cardLabel}>Amount Paid</Text>
              <Text style={[styles.cardValue, styles.greenText]}>₹{totalPaid.toLocaleString()}</Text>
            </View>
            <View style={styles.iconContainer}>
              <MaterialIcons name="description" size={24} color="#16A34A" />
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.redCard]}>
          <View style={styles.cardContent}>
            <View>
              <Text style={styles.cardLabel}>Amount Due</Text>
              <Text style={[styles.cardValue, styles.redText]}>₹{totalDue.toLocaleString()}</Text>
            </View>
            <View style={styles.iconContainer}>
              <MaterialIcons name="credit-card" size={24} color="#DC2626" />
            </View>
          </View>
        </View>
      </View>

      {/* Fee receipt list */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          <TouchableOpacity style={styles.printButton}>
            <MaterialIcons name="print" size={16} color="#374151" style={styles.printIcon} />
            <Text style={styles.printButtonText}>Print Statement</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.tableCell]}>Receipt No.</Text>
            <Text style={[styles.tableHeaderText, styles.tableCell]}>Date</Text>
            <Text style={[styles.tableHeaderText, styles.tableCell]}>Amount</Text>
            <Text style={[styles.tableHeaderText, styles.tableCell]}>Status</Text>
          </View>
          {feeHistory.map((fee) => (
            <View key={fee.id} style={styles.tableRow}>
              <Text style={styles.tableCell}>R-{fee.id.toString().padStart(4, '0')}</Text>
              <Text style={styles.tableCell}>{new Date(fee.payment_date).toLocaleDateString()}</Text>
              <Text style={styles.tableCell}>₹{fee.amount.toLocaleString()}</Text>
              <View style={styles.tableCell}>
                <View style={[
                  styles.badge,
                  fee.status === 'Paid' ? styles.badgeGreen : styles.badgeYellow
                ]}>
                  <Text style={styles.badgeText}>{fee.status}</Text>
                </View>
              </View>
              <View style={styles.tableCell}>
                <TouchableOpacity>
                  <Text style={styles.actionText}>View Receipt</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {feeHistory.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.noRecordsText]}>
                No fee history found
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Payment options (if there is due amount) */}
      {totalDue > 0 && (
        <View style={styles.paymentCard}>
          <Text style={styles.sectionTitle}>Make a Payment</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Payment Amount (₹)</Text>
            <View style={styles.input}>
              <Text style={styles.inputText}>{totalDue}</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.input}>
              <Text style={styles.inputText}>Cash</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Payment Date</Text>
            <View style={styles.input}>
              <Text style={styles.inputText}>{new Date().toISOString().split('T')[0]}</Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Notes</Text>
            <View style={[styles.input, styles.textArea]}>
              <Text style={styles.inputText}>Add any notes about this payment</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.processButton}>
              <Text style={styles.processButtonText}>Process Payment</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  iconContainer: {
    backgroundColor: '#BFDBFE', // Tailwind blue-200
    borderRadius: 999,
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827', // Tailwind gray-900
  },
  printButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E7EB', // Tailwind gray-200
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  printIcon: {
    marginRight: 8,
  },
  printButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151', // Tailwind gray-700
  },
  table: {
    borderWidth: 1,
    borderColor: '#E5E7EB', // Tailwind gray-200
    borderRadius: 6,
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
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827', // Tailwind gray-900
  },
  actionText: {
    fontSize: 12,
    color: '#2563EB', // Tailwind primary
    textDecorationLine: 'underline',
  },
  paymentCard: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#DBEAFE', // Tailwind blue-100
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#93C5FD', // Tailwind blue-300
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151', // Tailwind gray-700
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB', // Tailwind gray-300
    borderRadius: 6,
    padding: 12,
    backgroundColor: '#FFFFFF',
  },
  inputText: {
    fontSize: 14,
    color: '#111827', // Tailwind gray-900
  },
  textArea: {
    height: 60,
  },
  buttonContainer: {
    alignItems: 'flex-end',
  },
  processButton: {
    backgroundColor: '#2563EB', // Tailwind primary
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  processButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default StudentFeeHistory;
