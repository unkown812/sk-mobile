import supabase from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Student = Database['public']['Tables']['students']['Row'];

export const studentService = {
  async getAll(): Promise<Student[]> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('name');

      if (error) {
        throw new Error(`Error fetching students: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in studentService.getAll:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Student | null> {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(`Error fetching student: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in studentService.getById:', error);
      throw error;
    }
  },

  async create(student: Database['public']['Tables']['students']['Insert']): Promise<Student> {
    try {
      const { data, error } = await supabase
        .from('students')
        .insert(student)
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating student: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in studentService.create:', error);
      throw error;
    }
  },

  async update(id: string, student: Database['public']['Tables']['students']['Update']): Promise<Student> {
    try {
      const { data, error } = await supabase
        .from('students')
        .update(student)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating student: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in studentService.update:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error deleting student: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in studentService.delete:', error);
      throw error;
    }
  }
};
