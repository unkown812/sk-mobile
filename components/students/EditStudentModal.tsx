import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from "react-native";
import { Student } from "../../lib/database.types";

interface EditStudentModalProps {
  editStudent: Student;
  setEditStudent: React.Dispatch<React.SetStateAction<Student | null>>;
  onClose: () => void;
  onSave: () => void;
  onInputChange: (name: string, value: string) => void;
  addError: string | null;
  adding: boolean;
  enrollmentYearStart: number | "";
  enrollmentYearEnd: number | "";
  setEnrollmentYearStart: React.Dispatch<React.SetStateAction<number | "">>;
  setEnrollmentYearEnd: React.Dispatch<React.SetStateAction<number | "">>;
}

const EditStudentModal: React.FC<EditStudentModalProps> = ({
  editStudent,
  setEditStudent,
  onClose,
  onSave,
  onInputChange,
  addError,
  adding,
  enrollmentYearStart,
  enrollmentYearEnd,
  setEnrollmentYearStart,
  setEnrollmentYearEnd,
}) => {
  const handleEnrollmentYearStartChange = (value: string) => {
    const val = value === "" ? "" : Number(value);
    setEnrollmentYearStart(val);
  };

  const handleEnrollmentYearEndChange = (value: string) => {
    const val = value === "" ? "" : Number(value);
    setEnrollmentYearEnd(val);
  };

  const handleSubjectsChange = (value: string) => {
    const subjects = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setEditStudent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        subjects_enrolled: subjects,
      } as Student;
    });
  };

  const handleInstallmentDateChange = (index: number, value: string) => {
    const newDates = editStudent?.installment_dates
      ? [...editStudent.installment_dates]
      : [];
    newDates[index] = value;
    setEditStudent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        installment_dates: newDates,
      } as Student;
    });
  };

  const handleDueDateChange = (index: number, value: string) => {
    const newDueDates = editStudent?.due_dates
      ? [...editStudent.due_dates]
      : [];
    newDueDates[index] = value;
    setEditStudent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        due_dates: newDueDates,
      } as Student;
    });
  };

  const handleInstallmentAmtChange = (index: number, value: string) => {
    const newAmts = editStudent?.installment_amt
      ? [...editStudent.installment_amt]
      : [];
    newAmts[index] = Number(value);
    setEditStudent((prev) => {
      if (!prev) return prev;
      return { ...prev, installment_amt: newAmts } as Student;
    });
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Edit Student Details</Text>
          <TouchableOpacity
            onPress={onClose}
            accessibilityLabel="Close modal"
          >
            <Text style={styles.closeButton}>×</Text>
          </TouchableOpacity>
        </View>
        {addError && (
          <Text style={styles.errorText}>{addError}</Text>
        )}
        <ScrollView style={styles.formContainer}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={editStudent.name || ""}
              onChangeText={(value) => onInputChange("name", value)}
              placeholder="Name"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={editStudent.category || ""}
              onChangeText={(value) => onInputChange("category", value)}
              placeholder="Category"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Course</Text>
            <TextInput
              style={styles.input}
              value={editStudent.course || ""}
              onChangeText={(value) => onInputChange("course", value)}
              placeholder="Course"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Year</Text>
            <TextInput
              style={styles.input}
              value={editStudent.year?.toString() || ""}
              onChangeText={(value) => onInputChange("year", value)}
              placeholder="Year"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Semester</Text>
            <TextInput
              style={styles.input}
              value={editStudent.semester?.toString() || ""}
              onChangeText={(value) => onInputChange("semester", value)}
              placeholder="Semester"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={editStudent.email || ""}
              onChangeText={(value) => onInputChange("email", value)}
              placeholder="Email"
              keyboardType="email-address"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={editStudent.phone?.toString() || ""}
              onChangeText={(value) => onInputChange("phone", value)}
              placeholder="Phone"
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Enrollment Year Start</Text>
            <TextInput
              style={styles.input}
              value={enrollmentYearStart.toString()}
              onChangeText={handleEnrollmentYearStartChange}
              placeholder="Enrollment Year Start"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Enrollment Year End</Text>
            <TextInput
              style={styles.input}
              value={enrollmentYearEnd.toString()}
              onChangeText={handleEnrollmentYearEndChange}
              placeholder="Enrollment Year End"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Total Fee</Text>
            <TextInput
              style={styles.input}
              value={editStudent.total_fee?.toString() || ""}
              onChangeText={(value) => onInputChange("total_fee", value)}
              placeholder="Total Fee"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Installments</Text>
            <TextInput
              style={styles.input}
              value={editStudent.installments?.toString() || ""}
              onChangeText={(value) => onInputChange("installments", value)}
              placeholder="Installments"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Fee Status</Text>
            <TextInput
              style={styles.input}
              value={editStudent.fee_status || ""}
              onChangeText={(value) => onInputChange("fee_status", value)}
              placeholder="Fee Status"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Subjects Enrolled</Text>
            <TextInput
              style={styles.input}
              value={
                Array.isArray(editStudent.subjects_enrolled)
                  ? editStudent.subjects_enrolled.join(", ")
                  : ""
              }
              onChangeText={handleSubjectsChange}
              placeholder="Enter subjects separated by commas"
            />
          </View>
          {editStudent.installments && editStudent.installments > 0 && (
            <View style={styles.installmentSection}>
              <Text style={styles.sectionTitle}>Installment Due Dates</Text>
              {[...Array(editStudent.installments)].map((_, index) => (
                <View key={index} style={styles.formGroup}>
                  <Text style={styles.label}>Installment {index + 1} Due Date</Text>
                  <TextInput
                    style={styles.input}
                    value={
                      editStudent.installment_dates &&
                      editStudent.installment_dates[index]
                        ? editStudent.installment_dates[index]
                        : ""
                    }
                    onChangeText={(value) => handleInstallmentDateChange(index, value)}
                    placeholder="Due Date"
                  />
                </View>
              ))}
              <Text style={styles.sectionTitle}>Due Dates</Text>
              {[...Array(editStudent.installments)].map((_, index) => (
                <View key={`due_date_${index}`} style={styles.formGroup}>
                  <Text style={styles.label}>Due Date {index + 1}</Text>
                  <TextInput
                    style={styles.input}
                    value={
                      editStudent.due_dates && editStudent.due_dates[index]
                        ? editStudent.due_dates[index]
                        : ""
                    }
                    onChangeText={(value) => handleDueDateChange(index, value)}
                    placeholder="Due Date"
                  />
                </View>
              ))}
            </View>
          )}
          {[...Array(editStudent.installments)].map((_, index) => (
            <View key={index} style={styles.formGroup}>
              <Text style={styles.label}>Installment {index + 1} amount</Text>
              <TextInput
                style={styles.input}
                value={
                  editStudent.installment_amt &&
                  editStudent.installment_amt[index]
                    ? editStudent.installment_amt[index].toString()
                    : ""
                }
                onChangeText={(value) => handleInstallmentAmtChange(index, value)}
                placeholder="Amount"
                keyboardType="numeric"
              />
            </View>
          ))}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={adding}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={onSave}
              disabled={adding}
            >
              <Text style={styles.saveButtonText}>
                {adding ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    width: '100%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827', // Tailwind gray-900
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280', // Tailwind gray-500
  },
  errorText: {
    color: '#EF4444', // Tailwind red-600
    fontWeight: '600',
    marginBottom: 16,
  },
  formContainer: {
    flex: 1,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151', // Tailwind gray-700
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB', // Tailwind gray-300
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    color: '#111827', // Tailwind gray-900
  },
  installmentSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827', // Tailwind gray-900
    marginBottom: 12,
    marginTop: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelButton: {
    backgroundColor: '#E5E7EB', // Tailwind gray-200
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151', // Tailwind gray-700
  },
  saveButton: {
    backgroundColor: '#2563EB', // Tailwind primary
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default EditStudentModal;
