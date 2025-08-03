import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Student } from "../../types/types";

const ReceiptModal: React.FC<{
  student: Student | null;
  onClose: () => void;
}> = ({ student, onClose }) => {
  if (!student) return null;

  const numberToWords = (num: number): string => {
    if (num === 0) return "Zero";

    const a = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const b = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const numToWords = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100)
        return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
      if (n < 1000)
        return (
          a[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 !== 0 ? " " + numToWords(n % 100) : "")
        );
      if (n < 100000)
        return (
          numToWords(Math.floor(n / 1000)) +
          " Thousand" +
          (n % 1000 !== 0 ? " " + numToWords(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          numToWords(Math.floor(n / 100000)) +
          " Lakh" +
          (n % 100000 !== 0 ? " " + numToWords(n % 100000) : "")
        );
      return (
        numToWords(Math.floor(n / 10000000)) +
        " Crore" +
        (n % 10000000 !== 0 ? " " + numToWords(n % 10000000) : "")
      );
    };

    return numToWords(num);
  };

  const handlePrint = () => {
    Alert.alert(
      "Print Receipt",
      "To print this receipt, please take a screenshot and print it manually.",
      [{ text: "OK" }]
    );
  };

  return (
    <View style={styles.modalContainer}>
      <ScrollView style={styles.receiptContainer}>
        <View style={styles.header}>
          {/* Logo would go here if available */}
          <Text style={styles.schoolName}>SK CLASSES</Text>
          <View style={styles.divider} />
        </View>
        <View style={styles.receiptDetails}>
          <View style={styles.row}>
            <Text style={styles.detailText}>
              <Text style={styles.bold}>Receipt No. :</Text> {student.id ?? "N/A"}
            </Text>
            <Text style={styles.detailText}>
              <Text style={styles.bold}>Date:</Text> {new Date().toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Received with thanks from :</Text> {student.name}
          </Text>
          <View style={styles.row}>
            <Text style={styles.detailText}>
              <Text style={styles.bold}>Standard:</Text> {student.category} {student.course}{" "}
              {student.year ?? ""}
            </Text>
          </View>
          <View style={styles.installmentsContainer}>
            <Text style={styles.bold}>Installments:</Text>
            {student.installment_amt &&
              student.installment_amt.map((amt, index) => (
                <Text key={index} style={styles.installmentItem}>
                  Amount: ₹{amt} - Date:{" "}
                  {student.installment_dates && student.installment_dates[index]
                    ? new Date(
                        student.installment_dates[index]
                      ).toLocaleDateString()
                    : "N/A"}
                </Text>
              ))}
          </View>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Cash / Cheque for Rs.:</Text> {student.paid_fee ?? 0}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>Dated:</Text>{" "}
            {student.last_payment
              ? new Date(student.last_payment).toLocaleDateString()
              : ""}
          </Text>
          <Text style={styles.detailText}>
            <Text style={styles.bold}>
              Rupees in Words ({numberToWords(student.paid_fee ?? 0)})
            </Text>
          </Text>
        </View>
        <View style={styles.feesTable}>
          <View style={styles.feesHeader}>
            <Text style={styles.feesHeaderText}>FEES</Text>
          </View>
          <View style={styles.feesRow}>
            <Text style={[styles.feesCell, styles.borderRight]}>Course Fees</Text>
            <Text style={[styles.feesCell, styles.borderRight]}>Installment</Text>
            <Text style={styles.feesCell}>Balance Amt.</Text>
          </View>
          <View style={styles.feesRow}>
            <Text style={[styles.feesCell, styles.borderRight]}>{student.total_fee}</Text>
            <Text style={[styles.feesCell, styles.borderRight]}>{student.paid_fee}</Text>
            <Text style={styles.feesCell}>{student.due_amount}</Text>
          </View>
        </View>
        <View style={styles.termsContainer}>
          <Text style={styles.termsText}>Attendance and punctuality in the class is compulsory.</Text>
          <Text style={styles.termsText}>
            Tuition fees shall not be refunded or transferred to any other
            students name under any circumstances.
          </Text>
        </View>
        <View style={styles.signatureContainer}>
          <Text style={styles.signatureText}>For SK CLASSES</Text>
          <Text style={styles.signatureText}>Auth. Sign</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.printButton} onPress={handlePrint}>
            <Text style={styles.buttonText}>Print Receipt</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  receiptContainer: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  schoolName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    height: 4,
    backgroundColor: '#000000',
    width: '100%',
    marginBottom: 16,
  },
  receiptDetails: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 12,
    marginBottom: 4,
  },
  bold: {
    fontWeight: 'bold',
  },
  installmentsContainer: {
    marginBottom: 8,
  },
  installmentItem: {
    fontSize: 12,
    marginLeft: 16,
    marginBottom: 2,
  },
  feesTable: {
    borderWidth: 1,
    borderColor: '#000000',
    marginBottom: 16,
  },
  feesHeader: {
    backgroundColor: '#D1D5DB', // Tailwind gray-300
    fontWeight: 'bold',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  feesHeaderText: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 12,
  },
  feesRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#000000',
  },
  feesCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    paddingVertical: 8,
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: '#000000',
  },
  termsContainer: {
    marginBottom: 16,
  },
  termsText: {
    fontSize: 10,
    marginBottom: 4,
  },
  signatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 16,
  },
  signatureText: {
    fontSize: 12,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  printButton: {
    backgroundColor: '#2563EB', // Tailwind primary
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 16,
  },
  closeButton: {
    backgroundColor: '#E5E7EB', // Tailwind gray-200
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ReceiptModal;