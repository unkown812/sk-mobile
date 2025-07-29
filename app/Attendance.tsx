import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';

interface Student {
  id: number;
  name: string;
  category: string;
  course: string;
  year: number;
  email: string;
}

interface AttendanceRecord {
  student_id: number;
  date: string;
  status: string;
}

const studentCategories = [
  'School',
  'Junior College',
  'Diploma',
  'Entrance Exams',
];

const schoolCourses = ['SSC', 'CBSE', 'ICSE', 'Others'];

const juniorCollegeCourses = ['Science', 'Commerce', 'Arts'];

const diplomaCourses = ['Computer Science', 'Mechanical', 'Electrical', 'Civil'];

const entranceExamCourses = ['NEET', 'JEE', 'MHTCET', 'Boards'];

const years = [0, 1, 2, 3, 4]; // 0 means All

const tabs = [
  { id: 'mark', label: 'Mark Attendance' },
  { id: 'summary', label: 'Summary' },
];

const Attendance = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [studentCourses, setStudentCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('mark');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceMap, setAttendanceMap] = useState<Record<number, Record<number, string>>>({});
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().slice(0, 7); // YYYY-MM
  });
  const [daysInMonth, setDaysInMonth] = useState<number>(
    new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  );

  useEffect(() => {
    switch (selectedCategory) {
      case 'School':
        setStudentCourses(schoolCourses);
        break;
      case 'Junior College':
        setStudentCourses(juniorCollegeCourses);
        break;
      case 'Diploma':
        setStudentCourses(diplomaCourses);
        break;
      case 'Entrance Exams':
        setStudentCourses(entranceExamCourses);
        break;
      default:
        setStudentCourses([]);
    }
    setSelectedCourse('All');
    setSelectedYear(0);
  }, [selectedCategory]);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with your supabase client fetch logic compatible with React Native
        // Placeholder fetch simulation:
        const studentsData: Student[] = [];
        setStudents(studentsData);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('Unknown error');
      }
      setLoading(false);
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        // TODO: Replace with your supabase client fetch logic compatible with React Native
        // Placeholder fetch simulation:
        const attendanceData: AttendanceRecord[] = [];
        const map: Record<number, Record<number, string>> = {};
        attendanceData.forEach((record: AttendanceRecord) => {
          const day = new Date(record.date).getDate();
          if (!map[record.student_id]) map[record.student_id] = {};
          map[record.student_id][day] = record.status;
        });
        setAttendanceMap(map);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError('Unknown error');
      }
      setLoading(false);
    };
    fetchAttendance();
  }, [selectedMonth]);

  const filteredStudents = useMemo(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    return students.filter(student => {
      const matchesSearch =
        student.name.toLowerCase().includes(lowerSearchTerm) ||
        (student.id && student.id.toString().includes(lowerSearchTerm)) ||
        student.email.toLowerCase().includes(lowerSearchTerm);

      const matchesCategory =
        selectedCategory === 'All' || student.category === selectedCategory;

      const matchesCourse =
        selectedCourse === 'All' || student.course === selectedCourse;

      const matchesYear =
        selectedYear === 0 || student.year === selectedYear;

      return matchesSearch && matchesCategory && matchesCourse && matchesYear;
    });
  }, [students, searchTerm, selectedCategory, selectedCourse, selectedYear]);

  const groupedStudents = useMemo(() => {
    const groups: Record<string, Record<string, Record<string, Student[]>>> = {};
    filteredStudents.forEach(student => {
      if (!groups[student.category]) groups[student.category] = {};
      if (!groups[student.category][student.course]) groups[student.category][student.course] = {};
      if (!groups[student.category][student.course][student.year]) groups[student.category][student.course][student.year] = [];
      groups[student.category][student.course][student.year].push(student);
    });
    return groups;
  }, [filteredStudents]);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const sortedGroupedStudents = useMemo(() => {
    if (!sortConfig) return groupedStudents;

    const sortedGroups: Record<string, Record<string, Record<string, Student[]>>> = {};

    const categories = Object.keys(groupedStudents).sort((a, b) => {
      if (sortConfig.key === 'category') {
        return sortConfig.direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
      }
      return 0;
    });

    categories.forEach(category => {
      sortedGroups[category] = {};
      const courses = Object.keys(groupedStudents[category]).sort((a, b) => {
        if (sortConfig.key === 'course') {
          return sortConfig.direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
        }
        return 0;
      });
      courses.forEach(course => {
        sortedGroups[category][course] = {};
        const years = Object.keys(groupedStudents[category][course]).sort((a, b) => {
          if (sortConfig.key === 'year') {
            return sortConfig.direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
          }
          return 0;
        });
        years.forEach(year => {
          let studentsList = groupedStudents[category][course][year];
          if (sortConfig.key === 'name') {
            studentsList = [...studentsList].sort((a, b) => {
              return sortConfig.direction === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
            });
          }
          sortedGroups[category][course][year] = studentsList;
        });
      });
    });

    return sortedGroups;
  }, [groupedStudents, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleStatusChange = (studentId: number, day: number, status: string) => {
    setAttendanceMap(prev => {
      const newMap = { ...prev };
      if (!newMap[studentId]) newMap[studentId] = {};
      newMap[studentId][day] = status;
      return newMap;
    });
  };

  const handleSaveAttendance = async () => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Replace with your supabase client upsert logic compatible with React Native
      Alert.alert('Success', 'Attendance saved successfully.');
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Unknown error');
      Alert.alert('Error', 'Failed to save attendance');
    }
    setLoading(false);
  };

  // Summary data for summary tab
  const summaryData = useMemo(() => {
    const summaryGroups: Record<string, { studentCount: number; presentCount: number }> = {};
    students.forEach(student => {
      if (selectedCategory !== 'All' && student.category !== selectedCategory) return;
      if (!summaryGroups[student.category]) {
        summaryGroups[student.category] = { studentCount: 0, presentCount: 0 };
      }
      summaryGroups[student.category].studentCount += 1;
      const attendanceDays = attendanceMap[student.id] || {};
      const presentDays = Object.values(attendanceDays).filter(status => status === 'Present').length;
      summaryGroups[student.category].presentCount += presentDays;
    });
    return summaryGroups;
  }, [students, attendanceMap, selectedCategory]);

  // Render functions

  const renderTab = () => {
    return (
      <View style={styles.tabContainer}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabButton, activeTab === tab.id && styles.activeTabButton]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={[styles.tabButtonText, activeTab === tab.id && styles.activeTabButtonText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderFilters = () => {
    return (
      <View style={styles.filtersContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Search by name, id, email, course, category, or year"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Category:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
            {['All', ...studentCategories].map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.pickerItem,
                  selectedCategory === cat && styles.pickerItemSelected,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedCategory === cat && styles.pickerItemTextSelected,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Course:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
            {['All', ...studentCourses].map(course => (
              <TouchableOpacity
                key={course}
                style={[
                  styles.pickerItem,
                  selectedCourse === course && styles.pickerItemSelected,
                ]}
                onPress={() => setSelectedCourse(course)}
              >
                <Text
                  style={[
                    styles.pickerItemText,
                    selectedCourse === course && styles.pickerItemTextSelected,
                  ]}
                >
                  {course}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Year:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
          {['All', ...years.slice(1)].map(year => (
            <TouchableOpacity
              key={year}
              style={[
                styles.pickerItem,
                selectedYear === year && styles.pickerItemSelected,
              ]}
              onPress={() => setSelectedYear(typeof year === 'string' && year === 'All' ? 0 : year)}
            >
              <Text
                style={[
                  styles.pickerItemText,
                  selectedYear === year && styles.pickerItemTextSelected,
                ]}
              >
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        </View>
        <Text style={styles.label}>Select Month (YYYY-MM):</Text>
        <TextInput
          style={styles.textInput}
          value={selectedMonth}
          onChangeText={setSelectedMonth}
          placeholder="YYYY-MM"
        />
      </View>
    );
  };

  const renderMarkAttendance = () => {
    // Flatten sortedGroupedStudents to an array of students with category, course, year info
    const studentRows: {
      student: Student;
      category: string;
      course: string;
      year: string;
    }[] = [];

    Object.entries(sortedGroupedStudents).forEach(([category, courses]) => {
      Object.entries(courses).forEach(([course, years]) => {
        Object.entries(years).forEach(([year, studentsList]) => {
          studentsList.forEach(student => {
            studentRows.push({ student, category, course, year });
          });
        });
      });
    });

    const renderItem = ({ item }: { item: typeof studentRows[0] }) => {
      const { student, category, course, year } = item;
      return (
        <View style={styles.studentRow}>
          <Text style={styles.cell}>{category}</Text>
          <Text style={styles.cell}>{course}</Text>
          <Text style={styles.cell}>{year}</Text>
          <Text style={[styles.cell, styles.nameCell]}>{student.name}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.attendanceScroll}>
            {[...Array(daysInMonth)].map((_, dayIndex) => {
              const day = dayIndex + 1;
              const status = attendanceMap[student.id]?.[day] || 'Absent';
              const isPresent = status === 'Present';
              return (
                <View key={day} style={styles.attendanceCell}>
                  <Switch
                    value={isPresent}
                    onValueChange={value => handleStatusChange(student.id, day, value ? 'Present' : 'Absent')}
                  />
                  <Text style={styles.dayLabel}>{day}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      );
    };

    return (
      <View style={styles.markAttendanceContainer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSaveAttendance}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>Save Attendance</Text>
        </TouchableOpacity>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <FlatList
            data={studentRows}
            keyExtractor={item => item.student.id.toString()}
            renderItem={renderItem}
            ListEmptyComponent={<Text style={styles.emptyText}>No students found</Text>}
            horizontal={false}
            showsVerticalScrollIndicator={true}
            style={styles.studentList}
          />
        )}
      </View>
    );
  };

  const renderSummary = () => {
    const summaryEntries = Object.entries(summaryData);

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Monthly Attendance Summary - {selectedMonth}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={[styles.summaryRow, styles.summaryHeader]}>
              <Text style={[styles.summaryCell, styles.categoryCell]}>Category</Text>
              <Text style={styles.summaryCell}>Total Students</Text>
              <Text style={styles.summaryCell}>Total Present Days</Text>
              <Text style={styles.summaryCell}>Average Attendance (%)</Text>
            </View>
            {summaryEntries.length === 0 ? (
              <Text style={styles.emptyText}>No data available</Text>
            ) : (
              summaryEntries.map(([category, data]) => {
                const totalPossibleDays = data.studentCount * daysInMonth;
                const averageAttendance =
                  totalPossibleDays > 0 ? ((data.presentCount / totalPossibleDays) * 100).toFixed(2) : '0.00';
                return (
                  <View key={category} style={styles.summaryRow}>
                    <Text style={[styles.summaryCell, styles.categoryCell]}>{category}</Text>
                    <Text style={styles.summaryCell}>{data.studentCount}</Text>
                    <Text style={styles.summaryCell}>{data.presentCount}</Text>
                    <Text style={styles.summaryCell}>{averageAttendance}%</Text>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Attendance</Text>
      {renderTab()}
      {renderFilters()}
      {activeTab === 'mark' ? renderMarkAttendance() : renderSummary()}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#eee',
    alignItems: 'center',
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeTabButton: {
    backgroundColor: '#007AFF',
  },
  tabButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  filtersContainer: {
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 8,
  },
  pickerContainer: {
    marginBottom: 8,
  },
  pickerLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  pickerScroll: {
    flexDirection: 'row',
  },
  pickerItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 8,
  },
  pickerItemSelected: {
    backgroundColor: '#007AFF',
  },
  pickerItemText: {
    color: '#333',
  },
  pickerItemTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  markAttendanceContainer: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    borderRadius: 4,
    marginBottom: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#a0a0a0',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  studentList: {
    flex: 1,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 6,
  },
  cell: {
    width: 80,
    paddingHorizontal: 4,
  },
  nameCell: {
    flex: 1,
  },
  attendanceScroll: {
    flexDirection: 'row',
  },
  attendanceCell: {
    width: 50,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 10,
  },
  summaryContainer: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  summaryHeader: {
    backgroundColor: '#eee',
  },
  summaryCell: {
    width: 120,
    paddingHorizontal: 4,
  },
  categoryCell: {
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  errorText: {
    color: 'red',
    marginTop: 8,
  },
});

export default Attendance;
