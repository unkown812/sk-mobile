import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

const MOCK_COURSES = [
  {
    id: 1,
    name: '10th Science',
    category: 'School (8-10th)',
    students: 42,
    subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics'],
    duration: '12 months',
    fee: 15000,
    teachers: ['Rajesh Kumar', 'Sneha Sharma'],
  },
  {
    id: 2,
    name: '9th Science',
    category: 'School (8-10th)',
    students: 38,
    subjects: ['Physics', 'Chemistry', 'Biology', 'Mathematics'],
    duration: '12 months',
    fee: 12000,
    teachers: ['Anita Desai', 'Prakash Verma'],
  },
  {
    id: 3,
    name: '12th PCM',
    category: 'Junior College (11-12th)',
    students: 35,
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    duration: '12 months',
    fee: 18000,
    teachers: ['Dr. Mohan Singh', 'Kavita Patel'],
  },
  {
    id: 4,
    name: '11th PCB',
    category: 'Junior College (11-12th)',
    students: 32,
    subjects: ['Physics', 'Chemistry', 'Biology'],
    duration: '12 months',
    fee: 18000,
    teachers: ['Dr. Shweta Iyer', 'Rahul Sharma'],
  },
  {
    id: 5,
    name: 'JEE Advanced',
    category: 'JEE',
    students: 28,
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    duration: '18 months',
    fee: 25000,
    teachers: ['Dr. Vijay Reddy', 'Pooja Mehta'],
  },
  {
    id: 6,
    name: 'NEET Preparation',
    category: 'NEET',
    students: 30,
    subjects: ['Physics', 'Chemistry', 'Biology'],
    duration: '18 months',
    fee: 25000,
    teachers: ['Dr. Arjun Singh', 'Dr. Meera Gupta'],
  },
  {
    id: 7,
    name: 'MHCET Engineering',
    category: 'MHCET',
    students: 25,
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    duration: '6 months',
    fee: 15000,
    teachers: ['Vikram Joshi', 'Neha Sharma'],
  },
  {
    id: 8,
    name: 'Diploma in Engineering',
    category: 'Diploma',
    students: 22,
    subjects: ['Engineering Mathematics', 'Engineering Physics', 'Computer Science'],
    duration: '24 months',
    fee: 20000,
    teachers: ['Prof. Deepak Kumar', 'Anjali Mishra'],
  },
  {
    id: 9,
    name: 'B.Sc. Physics',
    category: 'Degree',
    students: 18,
    subjects: ['Mechanics', 'Electromagnetism', 'Modern Physics', 'Mathematics'],
    duration: '36 months',
    fee: 22000,
    teachers: ['Dr. Sanjay Patel', 'Dr. Priya Nair'],
  },
];

const MOCK_BATCHES = [
  { id: 1, name: 'Morning Batch - 10th Science', course: '10th Science', timing: '7:00 AM - 9:00 AM', days: 'Mon, Wed, Fri', students: 22, teacher: 'Rajesh Kumar' },
  { id: 2, name: 'Evening Batch - 10th Science', course: '10th Science', timing: '5:00 PM - 7:00 PM', days: 'Mon, Wed, Fri', students: 20, teacher: 'Sneha Sharma' },
  { id: 3, name: 'Morning Batch - JEE Advanced', course: 'JEE Advanced', timing: '7:00 AM - 10:00 AM', days: 'Tue, Thu, Sat', students: 15, teacher: 'Dr. Vijay Reddy' },
  { id: 4, name: 'Weekend Batch - NEET', course: 'NEET Preparation', timing: '9:00 AM - 1:00 PM', days: 'Sat, Sun', students: 18, teacher: 'Dr. Arjun Singh' },
  { id: 5, name: 'Evening Batch - 12th PCM', course: '12th PCM', timing: '6:00 PM - 8:00 PM', days: 'Mon to Fri', students: 25, teacher: 'Dr. Mohan Singh' },
];

const categories = ['All', 'School (8-10th)', 'Junior College (11-12th)', 'Diploma', 'Degree', 'JEE', 'NEET', 'MHCET'];

const tabs = [
  { id: 'courses', label: 'Courses' },
  { id: 'batches', label: 'Batches' },
];

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('courses');

  const filteredCourses = useMemo(() => {
    return MOCK_COURSES.filter(course => {
      const matchesSearch =
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.id.toString().includes(searchTerm);
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const filteredBatches = useMemo(() => {
    return MOCK_BATCHES.filter(batch => {
      const matchesSearch =
        batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.teacher.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' ||
        MOCK_COURSES.find(course => course.name === batch.course)?.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  const renderCourseItem = ({ item }: { item: typeof MOCK_COURSES[0] }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.courseName}>{item.name}</Text>
          <Text style={styles.courseCategory}>{item.category}</Text>
        </View>
        <View style={styles.feeContainer}>
          <Text style={styles.feeText}>₹{item.fee.toLocaleString()}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardLabel}>Students: {item.students}</Text>
        <Text style={styles.cardLabel}>Subjects: {item.subjects.length}</Text>
        <Text style={styles.cardLabel}>Duration: {item.duration}</Text>
        <Text style={styles.cardLabel}>Faculty:</Text>
  {item.teachers.map((teacher: string, idx: number) => (
    <Text key={idx} style={styles.teacherName}>{teacher}</Text>
  ))}
      </View>
      <View style={styles.cardFooter}>
        <TouchableOpacity>
          <Text style={styles.actionText}>View Details</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.actionText}>Edit Course</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderBatchItem = ({ item }: { item: typeof MOCK_BATCHES[0] }) => (
    <View style={styles.batchRow}>
      <Text style={styles.batchName}>{item.name}</Text>
      <Text style={styles.batchCourse}>{item.course}</Text>
      <Text style={styles.batchSchedule}>{item.timing} ({item.days})</Text>
      <Text style={styles.batchTeacher}>{item.teacher}</Text>
      <Text style={styles.batchStudents}>{item.students}</Text>
      <View style={styles.batchActions}>
        <TouchableOpacity>
          <Text style={styles.actionText}>View</Text>
        </TouchableOpacity>
        <TouchableOpacity>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Courses Management</Text>
      <Text style={styles.subtitle}>Manage all courses and batches offered by SK Tutorials</Text>
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
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Search ${activeTab === 'courses' ? 'courses' : 'batches'}...`}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <View style={styles.categoryPicker}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map(category => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryButton, selectedCategory === category && styles.categoryButtonActive]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[styles.categoryButtonText, selectedCategory === category && styles.categoryButtonTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      {activeTab === 'courses' ? (
        <FlatList
          data={filteredCourses}
          keyExtractor={item => item.id.toString()}
          renderItem={renderCourseItem}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <FlatList
          data={filteredBatches}
          keyExtractor={item => item.id.toString()}
          renderItem={renderBatchItem}
          contentContainerStyle={styles.listContent}
        />
      )}
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
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
  searchContainer: {
    marginBottom: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  categoryPicker: {
    marginTop: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#eee',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
  },
  categoryButtonText: {
    color: '#333',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  courseName: {
    fontSize: 18,
    fontWeight: '600',
  },
  courseCategory: {
    fontSize: 14,
    color: '#666',
  },
  feeContainer: {
    backgroundColor: '#e0f2fe',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  feeText: {
    color: '#0284c7',
    fontWeight: '600',
  },
  cardBody: {
    marginTop: 8,
  },
  cardLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  teacherName: {
    fontSize: 14,
    color: '#4b5563',
  },
  cardFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  batchRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'space-between',
  },
  batchName: {
    flex: 2,
    fontWeight: '600',
  },
  batchCourse: {
    flex: 1,
    textAlign: 'center',
  },
  batchSchedule: {
    flex: 2,
    textAlign: 'center',
  },
  batchTeacher: {
    flex: 1,
    textAlign: 'center',
  },
  batchStudents: {
    flex: 1,
    textAlign: 'center',
  },
  batchActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
  },
});

export default Courses;
