import supabase from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Payment = Database['public']['Tables']['payments']['Row'];

export const paymentService = {
  async getByStudentId(studentId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('student_id', studentId)
        .order('payment_date', { ascending: false });

      if (error) {
        throw new Error(`Error fetching payment data: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in paymentService.getByStudentId:', error);
      throw error;
    }
  },

  async create(payment: Database['public']['Tables']['payments']['Insert']): Promise<Payment> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating payment record: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in paymentService.create:', error);
      throw error;
    }
  },

  async update(id: string, payment: Database['public']['Tables']['payments']['Update']): Promise<Payment> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update(payment)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating payment record: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in paymentService.update:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error deleting payment record: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in paymentService.delete:', error);
      throw error;
    }
  },

  async getAll(): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (error) {
        throw new Error(`Error fetching payments: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in paymentService.getAll:', error);
      throw error;
    }
  }
};
