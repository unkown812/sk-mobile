import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client (typically in a separate file like supabaseClient.ts)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

interface StudentFees {
  total_fee?: number;
  paid_fee?: number;
  installment_amt?: number[];
}

function StudentFeesComponent() {
  const [studentId, setStudentId] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [studentFees, setStudentFees] = useState<StudentFees | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch Student Fees
  const fetchStudentFees = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('student-fees', {
        body: JSON.stringify({
          method: 'GET',
          studentId: studentId
        })
      });

      if (error) throw error;
      setStudentFees(data);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
      setStudentFees(null);
    }
  };

  // Add Installment
  const addInstallment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('student-fees', {
        body: JSON.stringify({
          method: 'POST',
          studentId: studentId,
          installmentAmount: parseFloat(installmentAmount)
        })
      });

      if (error) throw error;
      setStudentFees(data);
      setInstallmentAmount('');
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  // Update Total Fees
  const updateTotalFees = async (newTotalFees: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('student-fees', {
        body: JSON.stringify({
          method: 'PUT',
          studentId: studentId,
          total_fee: newTotalFees
        })
      });

      if (error) throw error;
      setStudentFees(data);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Student Fees Management</Text>

      {/* Student ID Input */}
      <TextInput
        style={styles.input}
        value={studentId}
        onChangeText={setStudentId}
        placeholder="Enter Student ID"
        placeholderTextColor="#9CA3AF"
      />

      {/* Fetch Fees Button */}
      <TouchableOpacity style={styles.button} onPress={fetchStudentFees}>
        <Text style={styles.buttonText}>Fetch Student Fees</Text>
      </TouchableOpacity>

      {/* Add Installment Section */}
      <View style={styles.installmentContainer}>
        <TextInput
          style={styles.input}
          value={installmentAmount}
          onChangeText={setInstallmentAmount}
          placeholder="Installment Amount"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={addInstallment}>
          <Text style={styles.buttonText}>Add Installment</Text>
        </TouchableOpacity>
      </View>

      {/* Display Fees */}
      {studentFees && (
        <View style={styles.feesContainer}>
          <Text style={styles.sectionTitle}>Student Fees Details</Text>
          <Text style={styles.feeText}>Total Fee: {studentFees.total_fee}</Text>
          <Text style={styles.feeText}>Paid Fee: {studentFees.paid_fee}</Text>
          <Text style={styles.feeText}>Installments: {studentFees.installment_amt?.join(', ')}</Text>
        </View>
      )}

      {/* Error Handling */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827', // Tailwind gray-900
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB', // Tailwind gray-300
    borderRadius: 6,
    padding: 12,
    fontSize: 16,
    color: '#111827', // Tailwind gray-900
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2563EB', // Tailwind primary
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  installmentContainer: {
    marginBottom: 24,
  },
  feesContainer: {
    padding: 16,
    backgroundColor: '#F9FAFB', // Tailwind gray-50
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Tailwind gray-200
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827', // Tailwind gray-900
    marginBottom: 16,
  },
  feeText: {
    fontSize: 16,
    color: '#374151', // Tailwind gray-700
    marginBottom: 8,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FEF2F2', // Tailwind red-50
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FECACA', // Tailwind red-300
  },
  errorText: {
    color: '#EF4444', // Tailwind red-500
    fontSize: 16,
  },
});

export default StudentFeesComponent;
