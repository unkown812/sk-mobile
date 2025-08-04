import supabase from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Attendance = Database['public']['Tables']['attendance']['Row'];

export const attendanceService = {
  async getByStudentId(studentId: string): Promise<Attendance[]> {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', studentId)
        .order('date', { ascending: false });

      if (error) {
        throw new Error(`Error fetching attendance: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in attendanceService.getByStudentId:', error);
      throw error;
    }
  },

  async getAll(): Promise<Attendance[]> {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        throw new Error(`Error fetching attendance: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in attendanceService.getAll:', error);
      throw error;
    }
  },

  async create(attendance: Database['public']['Tables']['attendance']['Insert']): Promise<Attendance> {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .insert(attendance)
        .select()
        .single();

      if (error) {
        throw new Error(`Error creating attendance record: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in attendanceService.create:', error);
      throw error;
    }
  },

  async update(id: string, attendance: Database['public']['Tables']['attendance']['Update']): Promise<Attendance> {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .update(attendance)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Error updating attendance record: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error in attendanceService.update:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error deleting attendance record: ${error.message}`);
      }
    } catch (error) {
      console.error('Error in attendanceService.delete:', error);
      throw error;
    }
  }
};
