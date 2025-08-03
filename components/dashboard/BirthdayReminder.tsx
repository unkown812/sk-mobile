import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import supabase from '../../lib/supabase';
import { MaterialIcons } from '@expo/vector-icons';

interface Student {
  id?: number;
  name: string;
  birthday: string; // stored as YYYY-MM-DD
}

const BirthdayReminder: React.FC = () => {
  const [birthdayTodayStudents, setBirthdayTodayStudents] = useState<Student[]>([]);
  const [showReminder, setShowReminder] = useState(true);

  useEffect(() => {
    const fetchStudentsWithBirthdayToday = async () => {
      try {
        const today = new Date();
        const monthDay = today.toISOString().slice(5, 10); // MM-DD

        const { data, error } = await supabase
          .from('students')
          .select('id, name, birthday');

        if (error) {
          console.error('Error fetching students for birthday reminder:', error);
          return;
        }

        if (data && data.length > 0) {
          // Filter students whose birthday matches today's month and day
          const birthdayStudents = data.filter(student => {
            if (!student.birthday) return false;
            return student.birthday.slice(5, 10) === monthDay;
          });

          if (birthdayStudents.length > 0) {
            setBirthdayTodayStudents(birthdayStudents);
            setShowReminder(true);
            // Show alert notification
            Alert.alert(
              'Birthday Reminder',
              `You have ${birthdayStudents.length} student(s) with birthday today.`
            );
          } else {
            setBirthdayTodayStudents([]);
            setShowReminder(false);
          }
        } else {
          setBirthdayTodayStudents([]);
          setShowReminder(false);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    fetchStudentsWithBirthdayToday();
  }, []);

  if (!showReminder || birthdayTodayStudents.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} role="alert">
      <Text style={styles.title}>Birthday Reminder!</Text>
      <Text style={styles.message}>
        The following students have birthday today ({new Date().toLocaleDateString()}):
      </Text>
      {birthdayTodayStudents.map(student => (
        <Text key={student.id} style={styles.studentName}>
          • {student.name}
        </Text>
      ))}
      <TouchableOpacity
        onPress={() => setShowReminder(false)}
        style={styles.closeButton}
        accessibilityLabel="Close"
      >
        <MaterialIcons name="close" size={24} color="#2563EB" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#DBEAFE', // Tailwind blue-100
    borderColor: '#60A5FA', // Tailwind blue-400
    borderWidth: 1,
    borderRadius: 6,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },
  title: {
    fontWeight: 'bold',
    color: '#1D4ED8', // Tailwind blue-700
    fontSize: 16,
  },
  message: {
    color: '#1D4ED8', // Tailwind blue-700
    fontSize: 14,
    marginTop: 4,
  },
  studentName: {
    color: '#1D4ED8', // Tailwind blue-700
    fontSize: 14,
    marginTop: 8,
    marginLeft: 16,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 16,
  },
});

export default BirthdayReminder;
