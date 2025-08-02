import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { supabase } from '@/utils/supabase';

interface Student {
  id: number;
  name: string;
  category: string;
  course: string;
  year: number;
  semester?: number | null;
  email: string;
  phone?: string;
  fee_status?: string;
  total_fee?: number;
  paid_fee?: number;
  due_amount?: number;
  last_payment?: string;
  birthday?: string;
  installment_amt?: number[];
  installments?: number | null;
  installment_dates?: string[];
  installment_descriptions?: string[];
  enrollment_year?: number[];
  subjects_enrolled?: string[];
  due_dates?: string[];
}

interface FeeSummary {
  id: number;
  name: string;
  category: string;
  course: string;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
  payment_date?: string;
  payment_method?: string;
  description?: string;
}

interface Payment {
  id: number;
  student_id: number;
  student_name: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  description: string;
  status: string;
}

const statusOptions = ['All', 'Paid', 'Partial', 'Unpaid'];

const Fees = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [feeSummary, setFeeSummary] = useState<FeeSummary[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState<string>('cash');
  const [paymentDetails, setPaymentDetails] = useState<string>('');
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showFeeModal, setShowFeeModal] = useState<boolean>(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [showFeeDueReminder, setShowFeeDueReminder] = useState<boolean>(false);
  const [receiptStudent, setReceiptStudent] = useState<Student | null>(null);

  useEffect(() => {
    fetchData();
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase.from<Payment>('payments').select('*');
      if (error) throw error;
      setPayments(data || []);
    } catch (err: unknown) {
      console.error('Error fetching payments:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: studentsData, error: studentsError } = await supabase.from<Student>('students').select('*');
      if (studentsError) throw studentsError;
      setStudents(studentsData || []);
      const summary = (studentsData || []).map((student) => {
        const totalAmount = student.total_fee || 0;
        const amountPaid = student.paid_fee || 0;
        const amountDue = totalAmount - amountPaid;
        let actualStatus: 'Paid' | 'Partial' | 'Unpaid';
        if (amountDue === totalAmount) {
          actualStatus = 'Unpaid';
        } else if (amountPaid === totalAmount) {
          actualStatus = 'Paid';
        } else if (amountDue > 0 && amountDue < totalAmount) {
          actualStatus = 'Partial';
        } else {
          actualStatus = 'Unpaid';
        }
        return {
          id: student.id!,
          name: student.name,
          category: student.category,
          course: student.course,
          totalAmount,
          amountPaid,
          amountDue,
          status: actualStatus,
          payment_date: '',
          payment_method: '',
          description: '',
        };
      });
      setFeeSummary(summary);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Error fetching data');
    }
    setLoading(false);
  };

  const filteredFeeSummary = useMemo(() => {
    return feeSummary.filter((student) => {
      const matchesSearch =
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id.toString().includes(searchTerm) ||
        student.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [feeSummary, searchTerm, statusFilter]);

  const totalFees = filteredFeeSummary.reduce((sum, fee) => sum + fee.totalAmount, 0);
  const totalCollected = filteredFeeSummary.reduce((sum, fee) => sum + fee.amountPaid, 0);
  const totalPending = filteredFeeSummary.reduce((sum, fee) => sum + fee.amountDue, 0);

  const openPaymentModal = (studentId: number) => {
    setSelectedStudentId(studentId);
    setPaymentAmount('');
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setPaymentMethod('cash');
    setPaymentDetails('');
    setSubmitError(null);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const handlePaymentSubmit = async () => {
    if (!selectedStudentId) {
      setSubmitError('Please select a student.');
      return;
    }
    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setSubmitError('Please enter a valid payment amount.');
      return;
    }
    setSubmitLoading(true);
    try {
      const { data: studentData, error: studentError } = await supabase
        .from<Student>('students')
        .select('paid_fee, last_payment, name')
        .eq('id', selectedStudentId)
        .single();
      if (studentError) throw studentError;
      const newPaidFee = (studentData?.paid_fee || 0) + amountNum;
      const { error: updateError } = await supabase
        .from('students')
        .update({
          paid_fee: newPaidFee,
          last_payment: paymentDate,
        })
        .eq('id', selectedStudentId);
      if (updateError) throw updateError;
      const { error: insertError } = await supabase.from('payments').insert([
        {
          student_id: selectedStudentId,
          student_name: studentData?.name,
          amount: amountNum,
          payment_date: paymentDate,
          payment_method: paymentMethod,
          description: paymentDetails,
          status: 'Paid',
        },
      ]);
      if (insertError) throw insertError;
      await fetchData();
      setShowPaymentModal(false);
    } catch (err: unknown) {
      if (err instanceof Error) setSubmitError(err.message);
      else setSubmitError('Error recording payment');
    }
    setSubmitLoading(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Fee Management</Text>
      <Text style={styles.subtitle}>Track and manage fee payments for all students</Text>

      <View style={styles.filters}>
        <TextInput
          style={styles.input}
          placeholder="Search by student name, ID, or category..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {statusOptions.map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterButton, statusFilter === status && styles.filterButtonActive]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={styles.filterButtonText}>{status}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Fees</Text>
              <Text style={styles.summaryValue}>₹{totalFees.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Collected</Text>
              <Text style={styles.summaryValue}>₹{totalCollected.toLocaleString()}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Pending</Text>
              <Text style={styles.summaryValue}>₹{totalPending.toLocaleString()}</Text>
            </View>
          </View>

          <FlatList
            data={filteredFeeSummary}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.feeItem} onPress={() => openPaymentModal(item.id)}>
                <View style={styles.feeRow}>
                  <Text style={styles.feeName}>{item.name}</Text>
                  <Text style={styles.feeCategory}>{item.category}</Text>
                  <Text style={styles.feeAmount}>₹{item.totalAmount.toLocaleString()}</Text>
                  <Text style={styles.feePaid}>₹{item.amountPaid.toLocaleString()}</Text>
                  <Text style={styles.feeDue}>₹{item.amountDue.toLocaleString()}</Text>
                  <Text style={styles.feeStatus}>{item.status}</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.listContent}
          />
        </>
      )}

      {/* Payment Modal */}
      <Modal visible={showPaymentModal} animationType="slide" onRequestClose={closePaymentModal}>
        <ScrollView style={styles.modalContainer} contentContainerStyle={styles.modalContent}>
          <Text style={styles.modalTitle}>Record New Payment</Text>
          {submitError && <Text style={styles.errorText}>{submitError}</Text>}

          <Text style={styles.label}>Payment Amount</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={paymentAmount}
            onChangeText={setPaymentAmount}
            placeholder="Enter amount"
          />

          <Text style={styles.label}>Payment Date</Text>
          <TextInput
            style={styles.input}
            value={paymentDate}
            onChangeText={setPaymentDate}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>Payment Method</Text>
          <TextInput
            style={styles.input}
            value={paymentMethod}
            onChangeText={setPaymentMethod}
            placeholder="e.g. cash, card, cheque, upi"
          />

          <Text style={styles.label}>Payment Details</Text>
          <TextInput
            style={styles.input}
            value={paymentDetails}
            onChangeText={setPaymentDetails}
            placeholder="Additional details"
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.buttonCancel} onPress={closePaymentModal}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.buttonSave} onPress={handlePaymentSubmit} disabled={submitLoading}>
              <Text style={styles.buttonText}>{submitLoading ? 'Recording...' : 'Record Payment'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
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
  filters: {
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 8,
  },
  summaryContainer: {
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    fontWeight: '600',
  },
  summaryValue: {
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 100,
  },
  feeItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feeName: {
    flex: 2,
    fontWeight: '600',
  },
  feeCategory: {
    flex: 1,
    textAlign: 'center',
  },
  feeAmount: {
    flex: 1,
    textAlign: 'center',
  },
  feePaid: {
    flex: 1,
    textAlign: 'center',
    color: 'green',
  },
  feeDue: {
    flex: 1,
    textAlign: 'center',
    color: 'red',
  },
  feeStatus: {
    flex: 1,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  modalContent: {
    flexGrow: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  buttonCancel: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  buttonSave: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
});

export default Fees;
