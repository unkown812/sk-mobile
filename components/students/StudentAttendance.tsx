import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialIcons } from '@expo/vector-icons';
import { attendanceService } from '../../services/attendanceService';
import type { Database } from '../../lib/database.types';

type Attendance = Database['public']['Tables']['attendance']['Row'];

interface StudentAttendanceProps {
  studentId: string;
}

interface SubjectAttendance {
  subject: string;
  present: number;
  total: number;
  percentage: number;
}

const StudentAttendance: React.FC<StudentAttendanceProps> = ({ studentId }) => {
  const [selectedMonth, setSelectedMonth] = useState('May');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const data = await attendanceService.getByStudentId(studentId);
        setAttendance(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [studentId]);

  const filteredAttendance = attendance.filter(
    item =>
      (selectedSubject === 'All' || item.subject === selectedSubject) &&
      (selectedMonth === 'All' || new Date(item.date).toLocaleString('default', { month: 'long' }) === selectedMonth)
  );

  const totalClasses = filteredAttendance.length;
  const presentClasses = filteredAttendance.filter(item => item.status.toLowerCase() === 'present').length;
  const absentClasses = totalClasses - presentClasses;
  const attendancePercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

  // Calculate subject-wise attendance
  const subjectWiseAttendance: SubjectAttendance[] = [];
  const subjectMap: Record<string, { present: number; total: number }> = {};

  filteredAttendance.forEach(item => {
    const subject = item.subject || 'Unknown';
    if (!subjectMap[subject]) {
      subjectMap[subject] = { present: 0, total: 0 };
    }
    subjectMap[subject].total += 1;
    if (item.status.toLowerCase() === 'present') {
      subjectMap[subject].present += 1;
    }
  });

  Object.entries(subjectMap).forEach(([subject, counts]) => {
    const percentage = counts.total > 0 ? (counts.present / counts.total) * 100 : 0;
    subjectWiseAttendance.push({
      subject,
      present: counts.present,
      total: counts.total,
      percentage,
    });
  });

  const subjects = ['All', ...Array.from(new Set(attendance.map(item => item.subject)))];

  // Months for picker
  const months = [
    'All', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#2563EB" />
      <Text style={styles.loadingText}>Loading attendance data...</Text>
    </View>
  );
  if (error) return (
    <View style={styles.center}>
      <Text style={styles.errorText}>Error: {error}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Attendance summary */}
      <View style={styles.summaryContainer}>
        <View style={[styles.card, styles.blueCard]}>
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="check-circle" size={24} color="#2563EB" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardLabel}>Attendance Rate</Text>
              <Text style={styles.cardValue}>{Math.round(attendancePercentage)}%</Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, styles.greenCard]}>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardLabel}>Present</Text>
            <Text style={[styles.cardValue, styles.greenText]}>{presentClasses}</Text>
            <Text style={styles.cardSubLabel}>out of {totalClasses} classes</Text>
          </View>
        </View>

        <View style={[styles.card, styles.redCard]}>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardLabel}>Absent</Text>
            <Text style={[styles.cardValue, styles.redText]}>{absentClasses}</Text>
            <Text style={styles.cardSubLabel}>out of {totalClasses} classes</Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardLabel}>Current Month</Text>
            <Text style={styles.cardValue}>{selectedMonth}</Text>
            <Text style={styles.cardSubLabel}>2025</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedMonth}
            onValueChange={(value: string) => setSelectedMonth(value)}
            style={styles.picker}
          >
            {months.map(month => (
              <Picker.Item key={month} label={month} value={month} />
            ))}
          </Picker>
          <MaterialIcons name="calendar-today" size={16} color="#9CA3AF" style={styles.pickerIcon} />
        </View>

        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedSubject}
            onValueChange={(value: string) => setSelectedSubject(value)}
            style={styles.picker}
          >
            {subjects.map(subject => (
              <Picker.Item key={subject} label={subject} value={subject} />
            ))}
          </Picker>
          <MaterialIcons name="filter-list" size={16} color="#9CA3AF" style={styles.pickerIcon} />
        </View>
      </View>

      {/* Subject-wise attendance */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Subject-wise Attendance</Text>

        <View style={styles.subjectAttendanceContainer}>
          {subjectWiseAttendance.map((item) => (
            <View key={item.subject} style={styles.subjectItem}>
              <View style={styles.subjectHeader}>
                <Text style={styles.subjectName}>{item.subject}</Text>
                <Text style={styles.subjectStats}>
                  {item.present}/{item.total} classes ({Math.round(item.percentage)}%)
                </Text>
              </View>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${item.percentage}%`,
                      backgroundColor: item.percentage >= 75 ? '#16A34A' : 
                                     item.percentage >= 60 ? '#EAB308' : '#DC2626'
                    }
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Attendance details table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Attendance Details</Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.tableCell]}>Date</Text>
            <Text style={[styles.tableHeaderText, styles.tableCell]}>Subject</Text>
            <Text style={[styles.tableHeaderText, styles.tableCell]}>Status</Text>
          </View>
          {filteredAttendance.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{new Date(item.date).toLocaleDateString()}</Text>
              <Text style={styles.tableCell}>{item.subject}</Text>
              <View style={styles.tableCell}>
                <View style={[
                  styles.badge,
                  item.status.toLowerCase() === 'present' ? styles.badgeGreen : styles.badgeRed
                ]}>
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>
              </View>
            </View>
          ))}
          {filteredAttendance.length === 0 && (
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.noRecordsText]}>
                No attendance records found
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#374151', // Tailwind gray-700
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444', // Tailwind red-500
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    flex: 1,
    minWidth: 150,
  },
  blueCard: {
    backgroundColor: '#DBEAFE', // Tailwind blue-100
  },
  greenCard: {
    backgroundColor: '#DCFCE7', // Tailwind green-100
  },
  redCard: {
    backgroundColor: '#FEE2E2', // Tailwind red-100
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#BFDBFE', // Tailwind blue-200
    borderRadius: 999,
    padding: 8,
  },
  cardTextContainer: {
    marginLeft: 12,
  },
  cardLabel: {
    fontSize: 12,
    color: '#6B7280', // Tailwind gray-500
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827', // Tailwind gray-900
  },
  greenText: {
    color: '#166534', // Tailwind green-800
  },
  redText: {
    color: '#991B1B', // Tailwind red-800
  },
  cardSubLabel: {
    fontSize: 12,
    color: '#6B7280', // Tailwind gray-500
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  pickerContainer: {
    flex: 1,
    position: 'relative',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#D1D5DB', // Tailwind gray-300
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#111827', // Tailwind gray-900
  },
  pickerIcon: {
    position: 'absolute',
    right: 12,
    top: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827', // Tailwind gray-900
    marginBottom: 16,
  },
  subjectAttendanceContainer: {
    gap: 16,
  },
  subjectItem: {
    gap: 8,
  },
  subjectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827', // Tailwind gray-900
  },
  subjectStats: {
    fontSize: 12,
    color: '#6B7280', // Tailwind gray-500
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#E5E7EB', // Tailwind gray-200
    borderRadius: 5,
  },
  progressBarFill: {
    height: 10,
    borderRadius: 5,
  },
  table: {
    borderWidth: 1,
    borderColor: '#E5E7EB', // Tailwind gray-200
    borderRadius: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB', // Tailwind gray-50
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // Tailwind gray-200
  },
  tableHeaderText: {
    fontWeight: '600',
    fontSize: 12,
    color: '#374151', // Tailwind gray-700
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // Tailwind gray-200
    paddingVertical: 12,
  },
  tableCell: {
    flex: 1,
    fontSize: 12,
    color: '#374151', // Tailwind gray-700
    textAlign: 'center',
  },
  noRecordsText: {
    textAlign: 'center',
    color: '#6B7280', // Tailwind gray-500
  },
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeGreen: {
    backgroundColor: '#BBF7D0', // Tailwind green-300
  },
  badgeRed: {
    backgroundColor: '#FECACA', // Tailwind red-300
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#111827', // Tailwind gray-900
  },
});

export default StudentAttendance;