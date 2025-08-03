import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { attendanceService } from '../../services/attendanceService';

interface AttendanceData {
  name: string;
  value: number;
}

const AttendanceChart: React.FC = () => {
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const data = await attendanceService.getAll();

        const attendanceMap: Record<string, { present: number; total: number }> = {};

        data.forEach((record: any) => {
          const key = record.subject || 'Unknown';
          if (!attendanceMap[key]) {
            attendanceMap[key] = { present: 0, total: 0 };
          }
          attendanceMap[key].total += 1;
          if (record.status.toLowerCase() === 'present') {
            attendanceMap[key].present += 1;
          }
        });

        const aggregatedData = Object.entries(attendanceMap).map(([name, counts]) => ({
          name,
          value: counts.total > 0 ? Math.round((counts.present / counts.total) * 100) : 0,
        }));

        setAttendanceData(aggregatedData);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  if (loading) return (
    <View style={styles.center}>
      <Text>Loading attendance data...</Text>
    </View>
  );
  if (error) return (
    <View style={styles.center}>
      <Text>Error: {error}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {attendanceData.map((item) => (
        <View key={item.name} style={styles.item}>
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.value}>{item.value}%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${item.value}%` }]} />
          </View>
        </View>
      ))}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Last updated: just now</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    paddingVertical: 8,
  },
  item: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  name: {
    fontWeight: '600',
    fontSize: 14,
  },
  value: {
    color: '#6B7280', // Tailwind gray-500
    fontSize: 14,
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#E5E7EB', // Tailwind gray-200
    borderRadius: 5,
  },
  progressBarFill: {
    height: 10,
    backgroundColor: '#2563EB', // Tailwind blue-600
    borderRadius: 5,
  },
  footer: {
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280', // Tailwind gray-500
  },
});

export default AttendanceChart;
