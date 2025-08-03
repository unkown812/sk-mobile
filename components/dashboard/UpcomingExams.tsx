import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import supabase from '../../lib/supabase';

interface Exam {
  id: number;
  name: string;
  date: string;
  course?: string;
  category?: string;
  year?: number;
}

const UpcomingExams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [todayExam, setTodayExam] = useState<Exam | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data, error } = await supabase
          .from('exams')
          .select('id, name, category, course, year, date');
        if (error) {
          console.error('Error fetching exams:', error);
          return;
        }
        const examsData = data || [];
        setExams(examsData);

        // Check for exam scheduled today
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const examToday = examsData.find((exam) => exam.date === todayStr) || null;
        setTodayExam(examToday);

        // Show alert notification if exam today
        if (examToday) {
          Alert.alert(
            "Exam Reminder",
            `You have an exam scheduled today: ${examToday.name}`
          );
        }
      } catch (err) {
        console.error('Unexpected error fetching exams:', err);
      }
    };

    fetchExams();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {todayExam && (
        <View style={styles.reminderContainer}>
          <Text style={styles.reminderText}>
            Reminder: You have an exam scheduled today: {todayExam.name}
          </Text>
        </View>
      )}
      {exams.map((exam) => (
        <View key={exam.id} style={styles.examContainer}>
          <View style={styles.calendarContainer}>
            <MaterialIcons name="calendar-today" size={20} color="#2563EB" />
            <Text style={styles.calendarDate}>
              {new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
          <View style={styles.examDetails}>
            <Text style={styles.examName}>{exam.name}</Text>
            <View style={styles.tagsContainer}>
              {exam.course && <Text style={styles.courseTag}>{exam.course}</Text>}
              {exam.category && <Text style={styles.categoryTag}>{exam.category}</Text>}
              {exam.year !== undefined && <Text style={styles.yearTag}>{exam.year}th</Text>}
            </View>
          </View>
        </View>
      ))}
      <View style={styles.buttonContainer}>
        <Text style={styles.buttonText}>View all exams →</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  reminderContainer: {
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FACC15', // Tailwind yellow-400
    backgroundColor: '#FEFCE8', // Tailwind yellow-50
    borderRadius: 6,
  },
  reminderText: {
    color: '#854D0E', // Tailwind yellow-800
    fontWeight: '600',
    fontSize: 14,
  },
  examContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB', // Tailwind gray-200
    borderRadius: 8,
    marginBottom: 8,
  },
  calendarContainer: {
    backgroundColor: '#DBEAFE', // Tailwind blue-100
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginRight: 12,
  },
  calendarDate: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1E40AF', // Tailwind blue-800
    marginTop: 4,
  },
  examDetails: {
    flex: 1,
  },
  examName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#111827', // Tailwind gray-900
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  courseTag: {
    fontSize: 12,
    color: '#2563EB', // Tailwind blue-600
    marginRight: 8,
  },
  categoryTag: {
    fontSize: 12,
    color: '#047857', // Tailwind green-700
    marginRight: 8,
  },
  yearTag: {
    fontSize: 12,
    color: '#EA580C', // Tailwind orange-600
    marginRight: 8,
  },
  buttonContainer: {
    marginTop: 8,
    padding: 8,
  },
  buttonText: {
    fontSize: 12,
    color: '#2563EB', // Tailwind primary
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default UpcomingExams;
