import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface Student {
  id?: number;
  name: string;
  category: string;
  course: string;
  year: number | null;
  phone: string;
  paid_fee: number | null;
  total_fee: number | null;
  due_amount: number | null;
  last_payment: string;
}

interface FeeDueReminderProps {
  showFeeDueReminder: boolean;
  dueStudents: Student[];
  onDismiss: () => void;
  onSendWhatsAppMessages: () => void;
}

const FeeDueReminder: React.FC<FeeDueReminderProps> = ({
  showFeeDueReminder,
  dueStudents,
  onDismiss,
  onSendWhatsAppMessages,
}) => {
  if (!showFeeDueReminder) return null;

  return (
    <View style={styles.container}>
      <ScrollView horizontal style={styles.content}>
        <Text style={styles.title}>Fee Due Reminder:</Text>
        {dueStudents.map(student => (
          <Text key={student.id} style={styles.studentItem}>
            {student.name} - Due: ₹{student.due_amount} - Contact: {student.phone}
          </Text>
        ))}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.sendButton}
          onPress={onSendWhatsAppMessages}
        >
          <Text style={styles.sendButtonText}>Send WhatsApp Messages</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={onDismiss}
        >
          <Text style={styles.dismissButtonText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FEF9C3', // Tailwind yellow-100
    borderColor: '#FACC15', // Tailwind yellow-400
    borderWidth: 1,
    padding: 16,
    zIndex: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    color: '#A16207', // Tailwind yellow-700
    fontSize: 14,
    marginBottom: 8,
  },
  studentItem: {
    color: '#A16207', // Tailwind yellow-700
    fontSize: 12,
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginLeft: 16,
  },
  sendButton: {
    backgroundColor: '#2563EB', // Tailwind primary
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  dismissButton: {
    backgroundColor: '#E5E7EB', // Tailwind gray-200
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dismissButtonText: {
    color: '#374151', // Tailwind gray-700
    fontSize: 12,
    fontWeight: '500',
  },
});

export default FeeDueReminder;
