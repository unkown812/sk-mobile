import supabase from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Performance = Database['public']['Tables']['performance']['Row'];

export const performanceService = {
  async getByStudentId(studentId: string): Promise<Performance[]> {
    try {
      const { data, error } = await supabase
        .from('performance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      if (error) {
        throw new Error(`Error fetching performance data: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in performanceService.getByStudentId:', error);
      throw error;
    }
  },

  async create(performance: Database['public']['Tables']['performance']['Insert']): Promise<Performance> {
    try {
      const { data, error } = await supabase
        .from('performance')
        .insert(performance)
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating performance record: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in performanceService.create:', error);
      throw error;
    }
  },

  async update(id: string, performance: Database['public']['Tables']['performance']['Update']): Promise<Performance> {
    try {
      const { data, error } = await supabase
        .from('performance')
        .update(performance)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating performance record: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in performanceService.update:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('performance')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error deleting performance record: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in performanceService.delete:', error);
      throw error;
    }
  }
};
