import React, { useState, useEffect } from "react";
import { Search, Filter, Download, XCircle } from "lucide-react";
import supabase from "../lib/supabase";
import ReceiptModal from "../components/students/ReceiptModal";
import FeeDueReminder from "../components/students/FeeDueReminder";
import sendWhatsAppMessagesToDueStudents from "../components/students/sendWhatsAppMessagesToDueStudents";
import { Student, FeeSummary, Payment } from "../types/types";

const Fees: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [feeSummary, setFeeSummary] = useState<FeeSummary[]>([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [showTable, setShowTable] = useState<boolean>(true);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [receiptStudent, setReceiptStudent] = useState<Student | null>(null);
  const [paymentDate, setPaymentDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<string>("");
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [showFeeDueReminder, setShowFeeDueReminder] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [newStudent, setNewStudent] = useState<Student>({
    id: 0,
    name: "",
    category: "",
    course: "",
    year: 0,
    semester: null,
    email: "",
    phone: "",
    enrollment_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString().split("T")[0],
    fee_status: "",
    total_fee: null,
    paid_fee: null,
    due_amount: null,
    last_payment: new Date().toISOString().split("T")[0],
    birthday: "",
    installment_amt: [],
    installments: null,
    installment_dates: [],
    installment_descriptions: [],
    enrollment_year: [],
    subjects_enrolled: [],
    due_dates: [],
  });

  // const handleFeeAction = (fee: FeeSummary) => {
  //   if (fee.amountDue > 0) {
  //     setSelectedStudentId(fee.id);
  //     setPaymentAmount('');
  //     setPaymentDate(new Date().toISOString().split('T')[0]);
  //     setSubmitError(null);
  //     setShowPaymentModal(true);
  //   }
  // };

  useEffect(() => {
    fetchData();
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase.from("payments").select("*");
      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.from("students").select("*");

    if (error) {
      setError(error.message);
    } else {
      const studentsWithDue = (data || []).map((student) => ({
        ...student,
        due_amount: (student.total_fee || 0) - (student.paid_fee || 0),
      }));
      setStudents(studentsWithDue);
    }
    setLoading(false);
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("*");
      if (studentsError) throw studentsError;
      setStudents(studentsData || []);
      const summary = (studentsData || []).map((student: Student) => {
        const totalAmount = student.total_fee || 0;
        const amountPaid = student.paid_fee || 0;
        const amountDue = totalAmount - amountPaid;
        let actualStatus: "Paid" | "Partial" | "Unpaid";
        if (amountDue === totalAmount) {
          actualStatus = "Unpaid";
        } else if (amountPaid === totalAmount) {
          actualStatus = "Paid";
        } else if (amountDue > 0 && amountDue < totalAmount) {
          actualStatus = "Partial";
        } else {
          actualStatus = "Unpaid";
        }
        return {
          id: student.id!,
          name: student.name,
          category: student.category,
          course: student.course,
          totalAmount: totalAmount,
          amountPaid: amountPaid,
          amountDue: amountDue,
          status: actualStatus,
          payment_date: "",
          payment_method: "",
          description: "",
        };
      });
      setFeeSummary(summary);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error fetching data");
      }
    }
    setLoading(false);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const handleOpenFeeModal = (student: Student) => {
    setNewStudent(student);
    // setFeeAmount(null);
    setAddError(null);
    setShowFeeModal(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!selectedStudentId) {
      setSubmitError("Please select a student.");
      return;
    }
    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setSubmitError("Please enter a valid payment amount.");
      return;
    }
    // if (!paymentDate) {
    //   setSubmitError('Please select a payment date.');
    //   return;
    // }
    // if (!paymentMethod) {
    //   setSubmitError('Please select a payment method.');
    //   return;
    // }
    setSubmitLoading(true);
    try {
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("paid_fee, last_payment,name")
        .eq("id", selectedStudentId)
        .single();
      if (studentError) throw studentError;
      const newPaidFee = (studentData?.paid_fee || 0) + amountNum;
      const { error: updateError } = await supabase
        .from("students")
        .update({
          paid_fee: newPaidFee,
          last_payment: paymentDate,
        })
        .eq("id", selectedStudentId);
      if (updateError) throw updateError;
      const { error: insertError } = await supabase.from("payments").insert([
        {
          student_id: selectedStudentId,
          student_name: studentData?.name,
          amount: amountNum,
          payment_date: paymentDate,
          payment_method: paymentMethod,
          description: paymentDetails,
          status: "Paid",
        },
      ]);
      if (insertError) throw insertError;
      await fetchData();
      setFeeSummary((prevFeeSummary) => {
        return prevFeeSummary.map((students) => {
          if (students.id === selectedStudentId) {
            const newAmountPaid = students.amountPaid + amountNum;
            const newAmountDue = students.totalAmount - newAmountPaid;
            let newStatus: "Paid" | "Partial" | "Unpaid";
            if (newAmountDue === students.totalAmount) {
              newStatus = "Unpaid";
            } else if (newAmountPaid === students.totalAmount) {
              newStatus = "Paid";
            } else if (
              newAmountDue > 0 &&
              newAmountDue < students.totalAmount
            ) {
              newStatus = "Partial";
            } else {
              newStatus = "Unpaid";
            }
            return {
              ...students,
              amountPaid: newAmountPaid,
              amountDue: newAmountDue,
              status: newStatus,
            };
          }
          return students;
        });
      });
      setShowPaymentModal(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Error recording payment");
      }
    }
    setSubmitLoading(false);
  };

  const filteredFeeSummary = feeSummary.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toString().includes(searchTerm) ||
      student.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All" || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalFees = filteredFeeSummary.reduce(
    (sum, fee) => sum + fee.totalAmount,
    0
  );
  const totalCollected = filteredFeeSummary.reduce(
    (sum, fee) => sum + fee.amountPaid,
    0
  );
  const totalPending = filteredFeeSummary.reduce(
    (sum, fee) => sum + fee.amountDue,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Fee Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage fee payments for all students
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            className="btn-primary flex items-center"
            onClick={() => setShowTable(!showTable)}
          >
            {showTable ? "Close" : "Update Fee"}
          </button>
        </div>
      </div>

      {loading && <div>Loading fee data...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Record New Payment</h2>
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="student"
                  className="block text-sm font-medium text-gray-700"
                >
                  Student
                </label>
                <select
                  id="student"
                  className="input-field w-full"
                  value={selectedStudentId ?? ""}
                  onChange={(e) => setSelectedStudentId(Number(e.target.value))}
                  required
                >
                  <option value="" disabled>
                    Select a student
                  </option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm font-medium text-gray-700"
                >
                  Payment Amount
                </label>
                <input
                  type="number"
                  id="amount"
                  className="input-field w-full"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Payment Date
                </label>
                <input
                  type="date"
                  id="date"
                  className="input-field w-full"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="paymentMethod"
                  className="block text-sm font-medium text-gray-700"
                >
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  className="input-field w-full"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="cheque">Cheque</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              {paymentMethod === "card" && (
                <div>
                  <label
                    htmlFor="cardDetails"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Card Details
                  </label>
                  <input
                    type="text"
                    id="cardDetails"
                    className="input-field w-full"
                    placeholder="Card Number, Expiry, etc."
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                  />
                </div>
              )}

              {paymentMethod === "cheque" && (
                <div>
                  <label
                    htmlFor="chequeDetails"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Cheque Details
                  </label>
                  <input
                    type="text"
                    id="chequeDetails"
                    className="input-field w-full"
                    placeholder="Cheque Number, Bank, etc."
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                  />
                </div>
              )}

              {paymentMethod === "upi" && (
                <div>
                  <label
                    htmlFor="upiDetails"
                    className="block text-sm font-medium text-gray-700"
                  >
                    UPI Details
                  </label>
                  <input
                    type="text"
                    id="upiDetails"
                    className="input-field w-full"
                    placeholder="UPI ID, Transaction Reference, etc."
                    value={paymentDetails}
                    onChange={(e) => setPaymentDetails(e.target.value)}
                  />
                </div>
              )}

              {submitError && <div className="text-red-500">{submitError}</div>}

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closePaymentModal}
                  disabled={submitLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={submitLoading}
                >
                  {submitLoading ? "Recording..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-blue-50 border-none">
          <div className="flex items-center">
            <div className="p-5 font-medium">
              <p className="text-xl text-gray-500 text-center">Total Fees</p>
              <p className="text-3xl font-semibold text-primary-dark">
                ₹{totalFees.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-green-50 border-none">
          <div className="flex items-center">
            <div className="p-5">
              <p className="text-xl text-gray-500 text-center">Collected</p>
              <p className="text-3xl font-semibold text-green-700">
                ₹{totalCollected.toLocaleString()}
              </p>
              <p className="text-sm text-green-700 text-center">
                {totalFees > 0
                  ? `${Math.round(
                    (totalCollected / totalFees) * 100
                  )}% of total`
                  : "0% of total"}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-red-50 border-none">
          <div className="flex items-center">
            <div className="p-5">
              <p className="text-xl text-gray-500 text-center">Pending</p>
              <p className="text-3xl font-semibold text-red-700">
                ₹{totalPending.toLocaleString()}
              </p>
              <p className="text-sm text-red-700 text-center">
                {totalFees > 0
                  ? `${Math.round((totalPending / totalFees) * 100)}% of total`
                  : "0% of total"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by student name, ID, or category..."
            className="input-field pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-4">
          <div className="relative">
            <select
              title="filter"
              className="input-field appearance-none pr-8"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Unpaid">Unpaid</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
          </div>

          <button className="btn-secondary flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Fee Management table */}
      {showTable && (
        <div className="table-container">
          <table className="data-table">
            {/* <table className="min-w-full divide-y divide-gray-200"> */}
            <thead>
              <tr>
                <th>Student</th>
                <th>Category</th>
                <th>Total Amount</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(() => {
                // Group feeSummary by category, then course, then year (year is not in FeeSummary, so get from students)
                const grouped: Record<
                  string,
                  Record<string, Record<number, FeeSummary[]>>
                > = {};
                filteredFeeSummary.forEach((fee) => {
                  const student = students.find((s) => s.id === fee.id);
                  const year = student?.year || 0;
                  if (!grouped[fee.category]) grouped[fee.category] = {};
                  if (!grouped[fee.category][fee.course])
                    grouped[fee.category][fee.course] = {};
                  if (!grouped[fee.category][fee.course][year])
                    grouped[fee.category][fee.course][year] = [];
                  grouped[fee.category][fee.course][year].push(fee);
                });

                const rows: JSX.Element[] = [];
                Object.keys(grouped).forEach((category) => {
                  Object.keys(grouped[category]).forEach((course) => {
                    Object.keys(grouped[category][course])
                      .sort((a, b) => Number(a) - Number(b))
                      .forEach((yearStr) => {
                        const year = Number(yearStr);
                        rows.push(
                          <tr
                            key={`year-${category}-${course}-${year}`}
                            className="bg-red-100"
                          >
                            <td
                              colSpan={7}
                              className="px-8 py-1 font-medium text-sm text-gray-500 text-center"
                            >
                              {category} {course} {year}
                            </td>
                          </tr>
                        );
                        grouped[category][course][year].forEach(
                          (feeSummary) => {
                            const student = students.find(
                              (s) => s.id === feeSummary.id
                            );
                            rows.push(
                              <tr
                                key={feeSummary.id}
                                onClick={() =>
                                  student && handleOpenFeeModal(student)
                                }
                              >
                                <td className="font-medium">
                                  {feeSummary.name}
                                </td>
                                <td className="font-medium">
                                  {feeSummary.category}
                                </td>
                                <td>
                                  ₹{feeSummary.totalAmount.toLocaleString()}
                                </td>
                                <td className="text-green-700">
                                  ₹{feeSummary.amountPaid.toLocaleString()}
                                </td>
                                <td className="text-red-700">
                                  ₹{feeSummary.amountDue.toLocaleString()}
                                </td>
                                <td>
                                  <span
                                    className={`badge text-xs ${feeSummary.status === "Paid"
                                        ? "text-green-700"
                                        : feeSummary.status === "Partial"
                                          ? "text-orange-300"
                                          : "text-red-600"
                                      }`}
                                  >
                                    {feeSummary.status}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    className="text-primary hover:text-primary-dark font-medium text-center"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (student) {
                                        handleOpenFeeModal(student);
                                      }
                                    }}
                                  >
                                    {feeSummary.amountDue > 0
                                      ? "Update"
                                      : "	 - 	"}
                                  </button>
                                </td>
                              </tr>
                            );
                          }
                        );
                      });
                  });
                });
                if (filteredFeeSummary.length === 0) {
                  rows.push(
                    <tr key="no-fees">
                      <td
                        colSpan={8}
                        className="text-center py-4 text-gray-500"
                      >
                        No fee records found
                      </td>
                    </tr>
                  );
                }
                return rows;
              })()}
            </tbody>
          </table>
        </div>
      )}

      {/* Fee Update Modal */}
      {showFeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Update Fee for {newStudent.name}
              </h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowFeeModal(false)}
                aria-label="Close fee modal"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            {addError && (
              <div className="mb-4 text-red-600 font-medium">{addError}</div>
            )}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Installments</h3>
              <button
                className="btn-primary mb-4"
                onClick={() => {
                  if (!newStudent.installment_amt)
                    newStudent.installment_amt = [];
                  if (!newStudent.installment_dates)
                    newStudent.installment_dates = [];
                  if (!newStudent.installment_descriptions)
                    newStudent.installment_descriptions = [];
                  newStudent.installment_amt.push(0);
                  newStudent.installment_dates.push("");
                  newStudent.installment_descriptions.push("");
                  setNewStudent({ ...newStudent });
                }}
              >
                Add Installment
              </button>
              <button
                className="btn-primary mb-4 ml-4"
                onClick={async () => {
                  if (!newStudent.id) {
                    setAddError("Student ID is missing.");
                    return;
                  }
                  setLoading(true);
                  setAddError(null);
                  try {
                    const paidFeeSum = newStudent.installment_amt
                      ? newStudent.installment_amt.reduce(
                        (sum, current) => sum + current,
                        0
                      )
                      : 0;
                    const { error } = await supabase
                      .from("students")
                      .update({
                        installment_amt: newStudent.installment_amt,
                        installment_dates: newStudent.installment_dates,
                        installment_descriptions:
                          newStudent.installment_descriptions,
                        installments: newStudent.installment_amt.length,
                        paid_fee: paidFeeSum,
                      })
                      .eq("id", newStudent.id);
                    if (error) {
                      setAddError(error.message);
                    } else {
                      fetchStudents();
                    }
                  } catch (err: unknown) {
                    if (err instanceof Error) {
                      setAddError(err.message);
                    } else {
                      setAddError("An unknown error occurred.");
                    }
                  }
                  setLoading(false);
                }}
              >
                Save Installments
              </button>
              <div className="space-y-4 max-h-64 overflow-auto">
                {newStudent.installment_amt &&
                  newStudent.installment_amt.map((amt, index) => (
                    <div
                      key={index}
                      className="border border-gray-300 rounded p-3"
                    >
                      <label
                        className="block text-sm font-medium mb-1"
                        htmlFor={`installment_amt_${index}`}
                      >
                        Installment Amount (₹)
                      </label>
                      <input
                        type="number"
                        id={`installment_amt_${index}`}
                        value={amt}
                        min={0}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          const newAmts = [
                            ...(newStudent.installment_amt || []),
                          ];
                          newAmts[index] = value;
                          const paidFeeSum = newAmts.reduce(
                            (sum, current) => sum + current,
                            0
                          );
                          setNewStudent((prev) => ({
                            ...prev,
                            installment_amt: newAmts,
                            paid_fee: paidFeeSum,
                          }));
                        }}
                        className="input-field w-full"
                      />
                      <button
                        className="btn-secondary mt-2"
                        onClick={() => {
                          setReceiptStudent({
                            ...newStudent,
                            paid_fee: amt,
                            last_payment: newStudent.installment_dates
                              ? newStudent.installment_dates[index]
                              : "",
                          });
                          setShowReceiptModal(true);
                        }}
                      >
                        Print Receipt
                      </button>
                      <label
                        className="block text-sm font-medium mt-3 mb-1"
                        htmlFor={`installment_date_${index}`}
                      >
                        Installment Date
                      </label>
                      <input
                        type="date"
                        id={`installment_date_${index}`}
                        value={
                          newStudent.installment_dates &&
                            newStudent.installment_dates[index]
                            ? newStudent.installment_dates[index]
                            : ""
                        }
                        onChange={(e) => {
                          const newDates = newStudent.installment_dates
                            ? [...newStudent.installment_dates]
                            : [];
                          newDates[index] = e.target.value;
                          setNewStudent((prev) => ({
                            ...prev,
                            installment_dates: newDates,
                          }));
                        }}
                        className="input-field w-full"
                      />
                      <label
                        className="block text-sm font-medium mt-3 mb-1"
                        htmlFor={`installment_description_${index}`}
                      >
                        Installment Description
                      </label>
                      <input
                        type="text"
                        id={`installment_description_${index}`}
                        value={
                          newStudent.installment_descriptions &&
                            newStudent.installment_descriptions[index]
                            ? newStudent.installment_descriptions[index]
                            : ""
                        }
                        onChange={(e) => {
                          const newDescriptions =
                            newStudent.installment_descriptions
                              ? [...newStudent.installment_descriptions]
                              : [];
                          newDescriptions[index] = e.target.value;
                          setNewStudent((prev) => ({
                            ...prev,
                            installment_descriptions: newDescriptions,
                          }));
                        }}
                        className="input-field w-full"
                        placeholder="Enter description"
                      />
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && receiptStudent && (
        <ReceiptModal
          student={receiptStudent}
          onClose={() => {
            setShowReceiptModal(false);
            setReceiptStudent(null);
          }}
        />
      )}

      {/* Fee Due Reminder Modal */}
      {showFeeDueReminder && (
        <FeeDueReminder
          showFeeDueReminder={showFeeDueReminder}
          dueStudents={students}
          onDismiss={() => setShowFeeDueReminder(false)}
          onSendWhatsAppMessages={sendWhatsAppMessagesToDueStudents}
        />
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr className="bg-slate-200">
              <th colSpan={8} className="text-xl text-center thhead">
                Fee Payments
              </th>
            </tr>
            <tr>
              <th>Student</th>
              <th>Payment Date</th>
              <th>Payment Method</th>
              <th>Amount</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="font-medium">{payment.student_name}</td>
                <td>
                  <span className="text-sky-800 font-bold">
                    {payment.payment_date}
                  </span>
                </td>
                <td>{payment.payment_method}</td>
                <td>₹{payment.amount.toLocaleString()}</td>
                <td className="font-medium">{payment.description}</td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No payment records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium"> </span>
          <span className="font-medium">{filteredFeeSummary.length}</span>{" "}
          results
        </div>
      </div>
    </div>
  );
};

export default Fees;