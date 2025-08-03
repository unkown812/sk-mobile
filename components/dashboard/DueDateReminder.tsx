import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import supabase from '../../lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';

interface Student {
  id?: number;
  name: string;
  due_dates?: string[];
  phone?: number;
}

const DueDateReminder: React.FC = () => {
  const [dueTodayStudents, setDueTodayStudents] = useState<{student: Student, dueDates: string[]}[]>([]);
  const [showReminder, setShowReminder] = useState(true);

  useEffect(() => {
    const fetchStudentsWithDueToday = async () => {
      try {
        const todayDate = new Date();
        const todayStr = todayDate.toISOString().split('T')[0]; 

        const { data, error } = await supabase
          .from('students')
          .select('id, name, due_dates,phone');

        if (error) {
          console.error('Error fetching students:', error);
          return;
        }

        if (data && data.length > 0) {
        const studentsDueToday = data
          .map((student: any) => {
            const dueDatesToday = (student.due_dates || []).filter((dateStr: string) => dateStr === todayStr);
            if (dueDatesToday.length > 0) {
              return { student, dueDates: dueDatesToday };
            }
            return null;
          })
          .filter((item): item is {student: Student, dueDates: string[]} => item !== null);

          if (studentsDueToday.length > 0) {
            setDueTodayStudents(studentsDueToday);
            setShowReminder(true);

            // Show alert notification
            Alert.alert(
              'Installment Due Date Reminder',
              `You have ${studentsDueToday.length} student(s) with installment due today.`
            );
          } else {
            setDueTodayStudents([]);
            setShowReminder(false);
          }
        } else {
          setDueTodayStudents([]);
          setShowReminder(false);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchStudentsWithDueToday();
  }, []);

  if (!showReminder || dueTodayStudents.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} role="alert">
      <Text style={styles.title}>Installment Due Date Reminder!</Text>
      {dueTodayStudents.map(({student}) => (
        <View key={student.id} style={styles.studentItem}>
          <Text style={styles.studentName}>{student.name} - </Text>
          <TouchableOpacity onPress={() => Linking.openURL(`tel:+${student.phone}`)}>
            <Text style={styles.phoneLink}>{student.phone}</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity
        onPress={() => setShowReminder(false)}
        style={styles.closeButton}
        accessibilityLabel="Close"
      >
        <MaterialIcons name="close" size={24} color="#CA8A04" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEF9C3', // Tailwind yellow-100
    borderColor: '#FACC15', // Tailwind yellow-400
    borderWidth: 1,
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },
  title: {
    fontWeight: 'bold',
    color: '#A16207', // Tailwind yellow-700
    fontSize: 16,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  studentName: {
    color: '#A16207', // Tailwind yellow-700
    fontSize: 14,
  },
  phoneLink: {
    color: '#3B82F6', // A blue color for links
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 16,
  },
});

export default DueDateReminder;
