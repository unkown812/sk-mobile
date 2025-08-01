import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { supabase } from '@/utils/supabase';

interface Student {
  id: number;
  name: string;
  category: string;
  course: string;
  year: number;
  email: string;
  phone?: string;
  fee_status?: string;
  total_fee?: number;
  paid_fee?: number;
  due_amount?: number;
  installments?: number;
  enrollment_date?: string;
  semester?: number | null;
  subjects_enrolled?: string[];
  due_dates?: string[];
  installment_amt?: number[];
  installment_dates?: string[];
  installment_descriptions?: string[];
}

const studentCategories = [
  'School',
  'Junior College',
  'Diploma',
  'Entrance Exams',
];

const schoolCourses = ['SSC', 'CBSE', 'ICSE', 'Others'];
const juniorCollegeCourses = ['Science', 'Commerce', 'Arts'];
const diplomaCourses = ['Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Other'];
const entranceExamCourses = ['NEET', 'JEE', 'MHTCET', 'Boards'];

const feeStatuses = ['Paid', 'Partial', 'Unpaid'];

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [studentCourses, setStudentCourses] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [adding, setAdding] = useState<boolean>(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState<Student>({
    id: 0,
    name: '',
    category: '',
    course: '',
    year: 0,
    email: '',
    phone: '',
    fee_status: 'Unpaid',
    total_fee: 0,
    paid_fee: 0,
    due_amount: 0,
    installments: 1,
    enrollment_date: new Date().toISOString().split('T')[0],
    semester: null,
    subjects_enrolled: [],
    due_dates: [],
    installment_amt: [],
    installment_dates: [],
    installment_descriptions: [],
  });

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
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.from('students').select('*');
      if (error) throw error;
      const studentsWithDue = (data || []).map((student) => ({
        ...student,
        due_amount: (student.total_fee || 0) - (student.paid_fee || 0),
      }));
      setStudents(studentsWithDue);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError('Unknown error');
    }
    setLoading(false);
  };

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

  const openEditModal = (student: Student) => {
    setEditStudent(student);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setEditStudent(null);
    setShowEditModal(false);
  };

  const handleEditChange = (field: keyof Student, value: any) => {
    if (!editStudent) return;
    setEditStudent({ ...editStudent, [field]: value });
  };

  const saveStudentChanges = async () => {
    if (!editStudent) return;
    setAdding(true);
    setAddError(null);
    try {
      const { error } = await supabase
        .from('students')
        .update(editStudent)
        .eq('id', editStudent.id);
      if (error) {
        setAddError(error.message);
      } else {
        Alert.alert('Success', 'Student updated successfully');
        closeEditModal();
        fetchStudents();
      }
    } catch (err: unknown) {
      if (err instanceof Error) setAddError(err.message);
      else setAddError('Unknown error');
    }
    setAdding(false);
  };

  const handleInputChange = (field: keyof Student, value: any) => {
    setNewStudent(prev => ({ ...prev, [field]: value }));
  };

  const handleAddStudentSubmit = async () => {
    setAdding(true);
    setAddError(null);
    try {
      if (!newStudent.name || !newStudent.course || !newStudent.category) {
        setAddError('Please fill in all required fields.');
        setAdding(false);
        return;
      }
      const { error } = await supabase
        .from('students')
        .insert([newStudent]);
      if (error) {
        setAddError(error.message);
      } else {
        Alert.alert('Success', 'Student added successfully');
        setNewStudent({
          id: 0,
          name: '',
          category: '',
          course: '',
          year: 0,
          email: '',
          phone: '',
          fee_status: 'Unpaid',
          total_fee: 0,
          paid_fee: 0,
          due_amount: 0,
          installments: 1,
          enrollment_date: new Date().toISOString().split('T')[0],
          semester: null,
          subjects_enrolled: [],
          due_dates: [],
          installment_amt: [],
          installment_dates: [],
          installment_descriptions: [],
        });
        fetchStudents();
      }
    } catch (err: unknown) {
      if (err instanceof Error) setAddError(err.message);
      else setAddError('Unknown error');
    }
    setAdding(false);
  };

  const renderStudentItem = ({ item }: { item: Student }) => (
    <TouchableOpacity style={styles.studentItem} onPress={() => openEditModal(item)}>
      <View style={styles.studentRow}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentInfo}>{item.category}</Text>
        <Text style={styles.studentInfo}>{item.course}</Text>
        <Text style={styles.studentInfo}>{item.year}</Text>
        <Text style={styles.studentInfo}>{item.email}</Text>
        <Text style={styles.studentInfo}>{item.due_amount?.toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Students</Text>
      <View style={styles.filters}>
        <TextInput
          style={styles.input}
          placeholder="Search by name, id, or email"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterButton, selectedCategory === 'All' && styles.filterButtonActive]}
            onPress={() => setSelectedCategory('All')}
          >
            <Text style={styles.filterButtonText}>All</Text>
          </TouchableOpacity>
          {studentCategories.map(category => (
            <TouchableOpacity
              key={category}
              style={[styles.filterButton, selectedCategory === category && styles.filterButtonActive]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={styles.filterButtonText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterButton, selectedCourse === 'All' && styles.filterButtonActive]}
            onPress={() => setSelectedCourse('All')}
          >
            <Text style={styles.filterButtonText}>All</Text>
          </TouchableOpacity>
          {studentCourses.map(course => (
            <TouchableOpacity
              key={course}
              style={[styles.filterButton, selectedCourse === course && styles.filterButtonActive]}
              onPress={() => setSelectedCourse(course)}
            >
              <Text style={styles.filterButtonText}>{course}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterButton, selectedYear === 0 && styles.filterButtonActive]}
            onPress={() => setSelectedYear(0)}
          >
            <Text style={styles.filterButtonText}>All</Text>
          </TouchableOpacity>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(year => (
            <TouchableOpacity
              key={year}
              style={[styles.filterButton, selectedYear === year && styles.filterButtonActive]}
              onPress={() => setSelectedYear(year)}
            >
              <Text style={styles.filterButtonText}>{year}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderStudentItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Edit Student Modal */}
      <Modal visible={showEditModal} animationType="slide" onRequestClose={closeEditModal}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Edit Student</Text>
          {editStudent && (
            <ScrollView style={styles.modalContent}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={editStudent.name}
                onChangeText={(text) => handleEditChange('name', text)}
              />
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                value={editStudent.category}
                onChangeText={(text) => handleEditChange('category', text)}
              />
              <Text style={styles.label}>Course</Text>
              <TextInput
                style={styles.input}
                value={editStudent.course}
                onChangeText={(text) => handleEditChange('course', text)}
              />
              <Text style={styles.label}>Year</Text>
              <TextInput
                style={styles.input}
                value={editStudent.year.toString()}
                keyboardType="numeric"
                onChangeText={(text) => handleEditChange('year', Number(text))}
              />
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={editStudent.email}
                onChangeText={(text) => handleEditChange('email', text)}
                keyboardType="email-address"
              />
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={editStudent.phone || ''}
                onChangeText={(text) => handleEditChange('phone', text)}
                keyboardType="phone-pad"
              />
              <Text style={styles.label}>Fee Status</Text>
              <TextInput
                style={styles.input}
                value={editStudent.fee_status || ''}
                onChangeText={(text) => handleEditChange('fee_status', text)}
              />
              <Text style={styles.label}>Total Fee</Text>
              <TextInput
                style={styles.input}
                value={editStudent.total_fee ? editStudent.total_fee.toString() : ''}
                keyboardType="numeric"
                onChangeText={(text) => handleEditChange('total_fee', Number(text))}
              />
              <Text style={styles.label}>Paid Fee</Text>
              <TextInput
                style={styles.input}
                value={editStudent.paid_fee ? editStudent.paid_fee.toString() : ''}
                keyboardType="numeric"
                onChangeText={(text) => handleEditChange('paid_fee', Number(text))}
              />
              <Text style={styles.label}>Due Amount</Text>
              <TextInput
                style={styles.input}
                value={editStudent.due_amount ? editStudent.due_amount.toString() : ''}
                keyboardType="numeric"
                editable={false}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.buttonCancel} onPress={closeEditModal}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonSave} onPress={saveStudentChanges} disabled={adding}>
                  <Text style={styles.buttonText}>{adding ? 'Saving...' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
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
  filters: {
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 100,
  },
  studentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  studentName: {
    flex: 2,
    fontWeight: '600',
  },
  studentInfo: {
    flex: 1,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalContent: {
    flex: 1,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  buttonCancel: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  buttonSave: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default Students;
