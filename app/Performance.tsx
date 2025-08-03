import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { supabase } from '@/utils/supabase';
import StudentPerformance from '@/components/students/StudentPerformance';

interface Student {
  id: number;
  name: string;
  category: string;
  course: string;
}

const Performance = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  
  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    const filtered = students.filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toString().includes(searchTerm)
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase.from('students').select('id, name, category, course');
      if (error) throw error;
      setStudents(data || []);
      setFilteredStudents(data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const renderStudentItem = ({ item }: { item: Student }) => (
    <TouchableOpacity 
      style={styles.studentItem}
      onPress={() => setSelectedStudentId(item.id.toString())}
    >
      <Text style={styles.studentName}>{item.name}</Text>
      <Text style={styles.studentInfo}>{item.category} - {item.course}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Performance</Text>
      
      {selectedStudentId ? (
        <StudentPerformance studentId={selectedStudentId} />
      ) : (
        <View>
          <TextInput
            style={styles.searchInput}
            placeholder="Search students by name or ID"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <FlatList
            data={filteredStudents}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderStudentItem}
            ListEmptyComponent={<Text style={styles.emptyText}>No students found</Text>}
          />
        </View>
      )}
    </View>
  );
};

export default Performance;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 16,
  },
  studentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
  },
  studentInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});
