import React, { useState } from 'react';
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
    <div>
      <h2>Student Fees Management</h2>

      {/* Student ID Input */}
      <input
        type="text"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        placeholder="Enter Student ID"
      />

      {/* Fetch Fees Button */}
      <button onClick={fetchStudentFees}>
        Fetch Student Fees
      </button>

      {/* Add Installment Section */}
      <div>
        <input
          type="number"
          value={installmentAmount}
          onChange={(e) => setInstallmentAmount(e.target.value)}
          placeholder="Installment Amount"
        />
        <button onClick={addInstallment}>
          Add Installment
        </button>
      </div>

      {/* Display Fees */}
      {studentFees && (
        <div>
          <h3>Student Fees Details</h3>
          <p>Total Fee: {studentFees.total_fee}</p>
          <p>Paid Fee: {studentFees.paid_fee}</p>
          <p>Installments: {studentFees.installment_amt?.join(', ')}</p>
        </div>
      )}

      {/* Error Handling */}
      {error && (
        <div style={{ color: 'red' }}>
          Error: {error}
        </div>
      )}
    </div>
  );
}

export default StudentFeesComponent;
