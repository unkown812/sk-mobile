import React, { useState, useEffect } from "react";
import { PlusCircle, Search, Download, Users, XCircle } from "lucide-react";
import supabase from "../lib/supabase";
import "../index.css";
import FeeDueReminder from "../components/students/FeeDueReminder";
import ReceiptModal from "../components/students/ReceiptModal";
import type { Student } from '../types/types';

const Students: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [selectedYear, setSelectedYear] = useState(0);
  const [yearOptionsJuniorCollege] = useState<number[]>([11, 12]);
  const [yearOptionsDiploma] = useState<number[]>([11, 12, 13]);
  const [yearOptionsSchool] = useState<number[]>([5, 6, 7, 8, 9, 10]);
  const [studentCourses, setStudentCourses] = useState<string[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [showFeeDueReminder, setShowFeeDueReminder] = useState(false);
  const [dueStudents, setDueStudents] = useState<Student[]>([]);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptStudent, setReceiptStudent] = useState<Student | null>(null);
  const [enrollmentYearStart, setEnrollmentYearStart] = useState<number | "">("");
  const [enrollmentYearEnd, setEnrollmentYearEnd] = useState<number | "">("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
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

  useEffect(() => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];
    const studentsWithDue = students.filter((student) => {
      if (!student.due_amount || student.due_amount <= 0) return false;
      if (!student.due_dates || student.due_dates.length === 0) return false;
      return student.due_dates.some((dateStr) => dateStr === todayStr);
    });

    if (studentsWithDue.length > 0) {
      setDueStudents(studentsWithDue);
      setShowFeeDueReminder(true);
    }
  }, [students]);

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    if (!editStudent) return;
    const { name, value } = e.target;
    setEditStudent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]:
          name === "paid_fee" ||
            name === "due_date" ||
            name === "installments" ||
            name === "year" ||
            name === "semester"
            ? Number(value)
            : value,
      } as Student;
    });
  };

  const handleSaveEditStudent = async () => {
    if (!editStudent) return;
    setAdding(true);
    setAddError(null);
    try {
      const sanitizedYear =
        typeof editStudent.year === "number" ? editStudent.year : null;
      const sanitizedSemester =
        typeof editStudent.semester === "number" ? editStudent.semester : null;
      const paidFeeSum = editStudent.installment_amt
        ? editStudent.installment_amt.reduce((sum, val) => sum + val, 0)
        : 0;

      // Ensure due_dates array length matches installments
      let dueDates = editStudent.due_dates || [];
      if (editStudent.installments) {
        while (dueDates.length < editStudent.installments) {
          dueDates.push("");
        }
        if (dueDates.length > editStudent.installments) {
          dueDates = dueDates.slice(0, editStudent.installments);
        }
      }
      // Sanitize dueDates to replace empty strings with null
      // To satisfy TypeScript, cast to string[] after filtering nulls
      dueDates = dueDates.map((date) => (date === "" ? null : date)).filter((d): d is string => d !== null);

      const studentToUpdate = {
        ...editStudent,
        year: sanitizedYear,
        semester: sanitizedSemester,
        paid_fee: paidFeeSum,
        due_dates: dueDates,
      };

      const { error } = await supabase
        .from("students")
        .update(studentToUpdate)
        .eq("id", editStudent.id);

      if (error) {
        setAddError(error.message);
      } else {
        setShowEditModal(false);
        fetchStudents();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAddError(err.message);
      } else {
        setAddError("An unknown error occurred.");
      }
    }
    setAdding(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "total_fee") {
      const totalFeeNum = Number(value);
      let installmentsNum = newStudent.installments ?? 1;
      if (installmentsNum < 1) installmentsNum = 1;
      if (installmentsNum > 24) installmentsNum = 24;
      setNewStudent((prev) => ({
        ...prev,
        total_fee: totalFeeNum,
        installment_amt: Array(installmentsNum).fill(
          totalFeeNum / installmentsNum
        ),
      }));
    } else if (name === "installments") {
      let installmentsNum = Number(value);
      if (installmentsNum < 1) installmentsNum = 1;
      if (installmentsNum > 24) installmentsNum = 24;
      let newInstallmentDates = Array.isArray(newStudent.installment_dates)
        ? [...newStudent.installment_dates]
        : [];
      if (newInstallmentDates.length > installmentsNum) {
        newInstallmentDates = newInstallmentDates.slice(0, installmentsNum);
      } else {
        while (newInstallmentDates.length < installmentsNum) {
          newInstallmentDates.push("");
        }
      }

      let newDueDates = Array.isArray(newStudent.due_dates)
        ? [...newStudent.due_dates]
        : [];
      if (newDueDates.length > installmentsNum) {
        newDueDates = newDueDates.slice(0, installmentsNum);
      } else {
        while (newDueDates.length < installmentsNum) {
          newDueDates.push("");
        }
      }
      setNewStudent((prev) => ({
        ...prev,
        installments: installmentsNum,
        installment_amt: Array(installmentsNum).fill((newStudent.total_fee || 0) / installmentsNum),
        installment_dates: newInstallmentDates,
        due_dates: newDueDates,
      }));
    } else if (name === "year") {
      setNewStudent((prev) => ({
        ...prev,
        year: Number(value),
      }));
    } else if (name === "semester") {
      setNewStudent((prev) => ({
        ...prev,
        semester: Number(value),
      }));
    }
    // else if (name === 'due_date') {
    //   setNewStudent((prev) => ({
    //     ...prev,
    //     due_date: Number(value),
    //   }));
    // }
    else {
      setNewStudent((prev) => ({
        ...prev,
        [name]:
          name === "paid_fee" || name === "due_date" ? Number(value) : value,
      }));
    }
  };

  const handleRowClick = (studentId?: number) => {
    if (studentId) {
      const student = students.find((s) => s.id === studentId) || null;
      setEditStudent(student);
      setShowEditModal(true);
    }
  };


  const sendWhatsAppMessage = async (phone: string, message: string) => {
    try {
      const response = await fetch("https://api.example.com/sendWhatsApp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 'Authorization': 'Bearer YOUR_API_TOKEN', // Add auth if needed
        },
        body: JSON.stringify({
          to: phone,
          message: message,
        }),
      });
      if (!response.ok) {
        console.error("Failed to send WhatsApp message to", phone);
      }
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
    }
  };

  const sendWhatsAppMessagesToDueStudents = async () => {
    for (const student of dueStudents) {
      if (student.phone && student.due_amount && student.due_amount > 0) {
        const msg = `Dear ${student.name}, your fee of ₹${student.due_amount} is due. Please make the payment at the earliest.`;
        await sendWhatsAppMessage(student.phone, msg);
      }
    }
    alert("WhatsApp messages sent to students with due fees.");
  };

  const exportToCSV = () => {
    if (filteredStudents.length === 0) {
      alert("No student data to export.");
      return;
    }

    const headers = [
      "id",
      "name",
      "email",
      "phone",
      "category",
      "course",
      "enrollment_date",
      "created_at",
      "fee_status",
      "paid_fee",
      "total_fee",
      "due_amount",
      "last_payment",
      "year",
      "birthday",
      "installments",
      "enrollment_year",
      "semester",
      "subjects_enrolled",
      "installment_amt",
      "installment_dates",
    ];

    const csvRows = [
      headers.join(","),
      ...filteredStudents.map((student) => {
        const row = [
          student.id ?? "",
          student.name,
          student.email,
          student.phone,
          student.category,
          student.course,
          student.enrollment_date,
          student.created_at,
          student.fee_status,
          student.paid_fee,
          student.total_fee,
          (student.total_fee || 0) - (student.paid_fee || 0),
          student.last_payment,
          student.year,
          student.birthday,
          student.installments,
          student.enrollment_year,
          student.semester,
          student.subjects_enrolled,
          student.installment_amt,
          student.installment_dates,
          student.due_dates,
        ];
        return row.join(",");
      }),
    ].join("\n");

    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "students_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

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

  const studentCategories = [
    "School",
    "Junior College",
    "Diploma",
    "Entrance Exams",
  ];

  const schoolCourses = ["SSC", "CBSE", "ICSE", "Others"];

  const juniorCollegeCourses = ["Science", "Commerce", "Arts"];
  const diplomaCourses = [
    "Computer Science",
    "Mechanical",
    "Electrical",
    "Civil",
    "Other",
  ];
  const entranceExamCourses = ["NEET", "JEE", "MHTCET", "Boards"];

  useEffect(() => {
    switch (selectedCategory) {
      case "School":
        setStudentCourses(schoolCourses);
        break;
      case "Junior College":
        setStudentCourses(juniorCollegeCourses);
        break;
      case "Diploma": {
        setStudentCourses(diplomaCourses);
        break;
      }
      case "Entrance Exams":
        setStudentCourses(entranceExamCourses);
        break;
      default:
        setStudentCourses([]);
    }
    setSelectedCourse("All");
    setSelectedYear(0);
  }, [selectedCategory]);

  const feeStatuses = ["Paid", "Partial", "Unpaid"];

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.id && student.id.toString().includes(searchTerm)) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || student.category === selectedCategory;

    const matchesCourse =
      selectedCourse === "All" || student.course === selectedCourse;

    const matchesYear = selectedYear === 0 || student.year === selectedYear;

    return matchesSearch && matchesCategory && matchesCourse && matchesYear;
  });

  const handleAddNewStudent = () => {
    setShowAddModal(true);
    setNewStudent({
      name: "",
      category: "",
      course: "",
      year: 0,
      semester: null,
      email: "",
      phone: "",
      enrollment_date: new Date().toISOString().split("T")[0],
      created_at: new Date().toISOString().split("T")[0],
      fee_status: "Unpaid",
      total_fee: null,
      paid_fee: null,
      due_amount: null,
      last_payment: new Date().toISOString().split("T")[0],
      installment_amt: [],
      installments: null,
      birthday: new Date().toISOString().split("T")[0],
      enrollment_year: [],
      subjects_enrolled: [],
      due_dates: [],
    });
    setAddError(null);
    setStudentCourses(schoolCourses);
  };

  const handleEnrollmentYearStartChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value === "" ? "" : Number(e.target.value);
    setEnrollmentYearStart(val);
  };

  const handleEnrollmentYearEndChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value === "" ? "" : Number(e.target.value);
    setEnrollmentYearEnd(val);
  };

  const handleAddStudentSubmit = async () => {
    setAdding(true);
    setAddError(null);
    try {
      if (!newStudent.name || !newStudent.course || !newStudent.category) {
        setAddError("Please fill in all required fields.");
        setAdding(false);
        return;
      }
      const sanitizedYear =
        typeof newStudent.year === "number" ? newStudent.year : null;
      const sanitizedSemester =
        typeof newStudent.semester === "number" ? newStudent.semester : null;
      const totalFeeNum = Number(newStudent.total_fee);
      const installmentsNum = Math.min(
        Math.max(Number(newStudent.installments), 1),
        24
      );
      const installmentAmtNum =
        installmentsNum > 0 ? totalFeeNum / installmentsNum : 0;
      const dueAmountNum = totalFeeNum - (newStudent.paid_fee || 0);
      // Sanitize installment_dates and due_dates to replace empty strings with null before insert
      // Filter out nulls to satisfy TypeScript string[] type
      const sanitizedInstallmentDates = (newStudent.installment_dates || [])
        .map((date) => (date === "" ? null : date))
        .filter((d): d is string => d !== null);
      const sanitizedDueDates = (newStudent.due_dates || [])
        .map((date) => (date === "" ? null : date))
        .filter((d): d is string => d !== null);

      const studentToInsert = {
        ...newStudent,
        year: sanitizedYear,
        semester: sanitizedSemester,
        total_fee: totalFeeNum,
        due_amount: dueAmountNum,
        installments: installmentsNum,
        installment_amt: installmentAmtNum,
        enrollment_year: [enrollmentYearStart, enrollmentYearEnd],
        installment_dates: sanitizedInstallmentDates,
        due_dates: sanitizedDueDates,
      };

      const { error } = await supabase
        .from("students")
        .insert([studentToInsert]);
      if (error) {
        setAddError(error.message);
      } else {
        setShowAddModal(false);
        fetchStudents();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAddError(err.message);
      } else {
        setAddError("An unknown error occurred.");
      }
    }
    setAdding(false);
  };

  const handleOpenFeeModal = (student: Student) => {
    setNewStudent(student);
    setFeeAmount(null);
    setAddError(null);
    setShowFeeModal(true);
  };

  // Removed unused functions to fix eslint errors

  return (
    <div className="space-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
          <p className="mt-1 text-sm text-gray-500">Manage all students</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            className="btn-primary flex items-center"
            onClick={handleAddNewStudent}
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Add New Student
          </button>
        </div>
      </div>
      {showEditModal && editStudent && (
        <div className="fixed inset-0 scrollbar-hide bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Edit Student Details</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowEditModal(false)}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            {addError && (
              <div className="mb-4 text-red-600 font-medium">{addError}</div>
            )}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={editStudent.name || ""}
                  onChange={handleEditInputChange}
                  className="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  id="category"
                  value={editStudent.category || ""}
                  onChange={handleEditInputChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label
                  htmlFor="course"
                  className="block text-sm font-medium text-gray-700"
                >
                  Course
                </label>
                <input
                  type="text"
                  name="course"
                  id="course"
                  value={editStudent.course || ""}
                  onChange={handleEditInputChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700"
                >
                  Year
                </label>
                <input
                  type="number"
                  name="year"
                  id="year"
                  value={editStudent.year || ""}
                  onChange={handleEditInputChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label
                  htmlFor="semester"
                  className="block text-sm font-medium text-gray-700"
                >
                  Semester
                </label>
                <input
                  type="number"
                  name="semester"
                  id="semester"
                  value={editStudent.semester || ""}
                  onChange={handleEditInputChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={editStudent.email || ""}
                  onChange={handleEditInputChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={editStudent.phone || ""}
                  onChange={handleEditInputChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label
                  htmlFor="enrollmentYearStart"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enrollment Year Start
                </label>
                <input
                  type="number"
                  name="enrollmentYearStart"
                  id="enrollmentYearStart"
                  value={enrollmentYearStart}
                  onChange={handleEnrollmentYearStartChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label
                  htmlFor="enrollmentYearEnd"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enrollment Year End
                </label>
                <input
                  type="number"
                  name="enrollmentYearEnd"
                  id="enrollmentYearEnd"
                  value={enrollmentYearEnd}
                  onChange={handleEnrollmentYearEndChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label
                  htmlFor="total_fee"
                  className="block text-sm font-medium text-gray-700"
                >
                  Total Fee
                </label>
                <input
                  type="number"
                  name="total_fee"
                  id="total_fee"
                  value={editStudent.total_fee || ""}
                  onChange={handleEditInputChange}
                  className="input-field mt-1"
                  min={0}
                />
              </div>
              <div>
                <label
                  htmlFor="installments"
                  className="block text-sm font-medium text-gray-700"
                >
                  Installments
                </label>
                <input
                  type="number"
                  name="installments"
                  id="installments"
                  value={editStudent.installments || ""}
                  onChange={handleEditInputChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label
                  htmlFor="fee_status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Fee Status
                </label>
                <input
                  type="text"
                  name="fee_status"
                  id="fee_status"
                  value={editStudent.fee_status || ""}
                  onChange={handleEditInputChange}
                  className="input-field mt-1"
                />
              </div>
              <div>
                <label
                  htmlFor="subjects_enrolled"
                  className="block text-sm font-medium text-gray-700"
                >
                  Subjects Enrolled
                </label>
                <input
                  type="text"
                  name="subjects_enrolled"
                  id="subjects_enrolled"
                  value={
                    Array.isArray(editStudent.subjects_enrolled)
                      ? editStudent.subjects_enrolled.join(", ")
                      : ""
                  }
                  onChange={(e) => {
                    const subjects = e.target.value
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
                  }}
                  placeholder="Enter subjects separated by commas"
                  className="input-field mt-1"
                />
              </div>
              {editStudent.installments && editStudent.installments > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-semibold mb-2">
                    Installment Due Dates
                  </h3>
                  {[...Array(editStudent.installments)].map((_, index) => (
                    <div key={index} className="mb-2">
                      <label
                        htmlFor={`installment_date_${index}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Installment {index + 1} Date
                      </label>
                      <input
                        type="date"
                        id={`installment_date_${index}`}
                        value={
                          editStudent.installment_dates &&
                            editStudent.installment_dates[index]
                            ? editStudent.installment_dates[index]
                            : ""
                        }
                        onChange={(e) => {
                          const newDates = editStudent?.installment_dates
                            ? [...editStudent.installment_dates]
                            : [];
                          newDates[index] = e.target.value;
                          setEditStudent((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              installment_dates: newDates,
                            } as Student;
                          });
                        }}
                        className="input-field mt-1"
                        required
                      />
                    </div>
                  ))}
                  <h3 className="text-md font-semibold mb-2 mt-6">
                    Due Dates
                  </h3>
                  {[...Array(editStudent.installments)].map((_, index) => (
                    <div key={`due_date_${index}`} className="mb-2">
                      <label
                        htmlFor={`due_date_${index}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Due Date {index + 1}
                      </label>
                      <input
                        type="date"
                        id={`due_date_${index}`}
                        value={
                          editStudent.due_dates && editStudent.due_dates[index]
                            ? editStudent.due_dates[index]
                            : ""
                        }
                        onChange={(e) => {
                          const newDueDates = editStudent?.due_dates
                            ? [...editStudent.due_dates]
                            : [];
                          newDueDates[index] = e.target.value;
                          setEditStudent((prev) => {
                            if (!prev) return prev;
                            return {
                              ...prev,
                              due_dates: newDueDates,
                            } as Student;
                          });
                        }}
                        className="input-field mt-1"
                      />
                    </div>
                  ))}
                </div>
              )}
              {[...Array(editStudent.installments)].map((_, index) => (
                <div key={index} className="mb-2">
                  <label
                    htmlFor={`installment_amt_${index}`}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Installment {index + 1} amount
                  </label>
                  <input
                    type="number"
                    id={`installment_amt_${index}`}
                    value={
                      editStudent.installment_amt &&
                        editStudent.installment_amt[index]
                        ? editStudent.installment_amt[index]
                        : ""
                    }
                    onChange={(e) => {
                      const newAmts = editStudent?.installment_amt
                        ? [...editStudent.installment_amt]
                        : [];
                      newAmts[index] = Number(e.target.value);
                      setEditStudent((prev) => {
                        if (!prev) return prev;
                        return { ...prev, installment_amt: newAmts } as Student;
                      });
                    }}
                    className="input-field mt-1"
                    required
                  />
                </div>
              ))}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  className="btn-secondary"
                  onClick={() => setShowEditModal(false)}
                  disabled={adding}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleSaveEditStudent}
                  disabled={adding}
                >
                  {adding ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mt-5 mb-5">
        <div className="relative flex-grow flex items-center">
          <Search className="h-5 w-5 text-gray-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search student"
            className="input-field pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex flex-col space-y-2 mb-5">
        <div className="flex space-x-2">
          <button
            className={`btn text- ${selectedCategory === "All" ? "btn-primary" : "btn-secondary"
              }`}
            onClick={() => setSelectedCategory("All")}
          >
            All
          </button>
          {studentCategories.map((category) => (
            <button
              key={category}
              className={`btn ${selectedCategory === category ? "btn-primary" : "btn-secondary"
                }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Course selection based on category */}
        <div className="flex space-x-2 pl-4">
          <button
            className={`btn ${selectedCourse === "All" ? "btn-primary" : "btn-secondary"
              }`}
            onClick={() => setSelectedCourse("All")}
          >
            All
          </button>
          {studentCourses.map((course) => (
            <button
              key={course}
              className={`btn ${selectedCourse === course ? "btn-primary" : "btn-secondary"
                }`}
              onClick={() => setSelectedCourse(course)}
            >
              {course}
            </button>
          ))}
        </div>

        {/* Year selection based on course */}
        <div className="flex space-x-2 pl-8">
          <button
            className={`btn ${selectedYear === 0 ? "btn-primary" : "btn-secondary"
              }`}
            onClick={() => setSelectedYear(0)}
          >
            All
          </button>
          {(() => {
            const yearOptions =
              selectedCategory === "School"
                ? yearOptionsSchool
                : selectedCategory === "Diploma"
                  ? yearOptionsDiploma
                  : selectedCategory === "Junior College"
                    ? yearOptionsJuniorCollege
                    : [];
            return yearOptions.map((year) => (
              <button
                key={year}
                className={`btn ${selectedYear === year ? "btn-primary" : "btn-secondary"
                  }`}
                onClick={() => setSelectedYear(year)}
              >
                {year}
              </button>
            ));
          })()}
        </div>

        <button
          className="btn-secondary flex items-center"
          onClick={exportToCSV}
        >
          <Download className="h-5 w-5 mr-2" />
          Export
        </button>
      </div>
      {loading && <div>Loading students...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}
      {/* Students Count */}
      <div className="flex items-center text-sm text-gray-500">
        <Users className="h-4 w-4 mr-1" />
        <span>
          Showing {filteredStudents.length} out of {students.length} students
        </span>
      </div>
      {/* Students Table */}
      <div className="overflow-x-scroll">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                Name
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                Category
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                Course
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                Year
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                Contact
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                Fee Status
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                Total Fee
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                Amount Paid
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                Due
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                Installments
              </th>
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(() => {
              const grouped: Record<
                string,
                Record<string, Record<number, Student[]>>
              > = {};
              filteredStudents.forEach((student) => {
                const year = student.year || 0; // Handle null year
                if (!grouped[student.category]) grouped[student.category] = {};
                if (!grouped[student.category][student.course])
                  grouped[student.category][student.course] = {};
                if (!grouped[student.category][student.course][year])
                  grouped[student.category][student.course][year] = [];
                grouped[student.category][student.course][year].push(student);
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
                          className="bg-white"
                        >
                          <td
                            colSpan={11}
                            className="px-8 py-1 font-medium text-2xl text-gray-500 bg-orange-100 text-center "
                          >
                            {category} {course} {year}
                          </td>
                        </tr>
                      );
                      grouped[category][course][year].forEach((student) => {
                        rows.push(
                          <tr
                            key={student.id}
                            onClick={() => handleRowClick(student.id)}
                            className="cursor-pointer"
                          >
                            <td className="px-4 py-2 font-medium">
                              {student.name}
                            </td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-1 text-x text-blue-800 text-center">
                                {student.category}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className="px-2 py-1 text-x text-blue-600">
                                {student.course}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-1 text-x text-blue-400">
                                {student.year}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <div className="text-xs">
                                <a href={`tel:+${student.phone}`}>
                                  {student.phone}
                                </a>
                              </div>
                              <div className="text-xs text-gray-500">
                                {student.email}
                              </div>
                            </td>
                            <td
                              className={`px-10 py-1 m-3 text-x ${student.fee_status === "Paid"
                                  ? "text-green-800"
                                  : student.fee_status === "Partial"
                                    ? "text-yellow-500"
                                    : "text-red-800"
                                }`}
                            >
                              {student.fee_status}
                            </td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-1 text-x text-secondary">
                                {student.total_fee}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-1 text-x text-green-600">
                                {student.paid_fee}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-1 text-x text-red-600">
                                {student.due_amount}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-1 text-x text-purple-800">
                                {student.installments}
                              </span>
                            </td>
                            <td className="px-1 py-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditStudent(student);
                                  setShowEditModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 font-small"
                              >
                                Details
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenFeeModal(student);
                                }}
                                className="text-blue-400 hover:text-black-800 font-small inline-block ml-2"
                              >
                                Fees
                              </button>
                              {/* <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (receiptStudent && receiptStudent.id === student.id) {
                                  setShowReceiptModal(true);
                                  setReceiptStudent(null);
                                } else {
                                  setReceiptStudent(student);
                                  setShowReceiptModal(true);
                                }
                              }}
                              className="text-green-600 hover:text-green-800 font-small inline-block ml-2"
                            >
                              {receiptStudent && receiptStudent.id === student.id && showReceiptModal ? 'Hide' : 'Receipt'}
                            </button> */}
                            </td>
                          </tr>
                        );
                      });
                    });
                });
              });
              if (filteredStudents.length === 0) {
                return (
                  <tr>
                    <td colSpan={11} className="text-center py-4 text-gray-500">
                      No students found.
                    </td>
                  </tr>
                );
              }
              return rows;
            })()}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-700 space-y-2 md:space-y-0">
        <div>
          Showing{" "}
          <span className="font-medium text-primary">
            {filteredStudents.length}
          </span>{" "}
          students
        </div>
      </div>
      {showAddModal && (
        <div className="fixed inset-0 scrollbar-hide bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Student</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowAddModal(false)}
                aria-label="Close modal"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            {addError && (
              <div className="mb-4 text-red-600 font-medium">{addError}</div>
            )}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={newStudent.name}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <select
                  name="category"
                  id="category"
                  value={newStudent.category}
                  onChange={(e) => {
                    handleInputChange(e);
                    setNewStudent((prev) => ({ ...prev, course: "" }));
                    setSelectedCategory(e.target.value);
                  }}
                  className="input-field mt-1"
                >
                  {studentCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="course"
                  className="block text-sm font-medium text-gray-700"
                >
                  Course
                </label>
                <select
                  name="course"
                  id="course"
                  value={newStudent.course}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  required
                  disabled={studentCourses.length === 0}
                >
                  <option value="" disabled>
                    Select course
                  </option>
                  {studentCourses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700"
                >
                  Year
                </label>
                <input
                  name="year"
                  type="number"
                  id="year"
                  value={newStudent.year ?? 0}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="semester"
                  className="block text-sm font-medium text-gray-700"
                >
                  Semester
                </label>
                <input
                  type="number"
                  name="semester"
                  id="semester"
                  value={newStudent.semester ?? ""}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  min={1}
                  max={10}
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={newStudent.email}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={newStudent.phone}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="enrollment_date"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enrollment Date
                </label>
                <input
                  type="date"
                  name="enrollment_date"
                  id="enrollment_date"
                  value={newStudent.enrollment_date}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="total_fee"
                  className="block text-sm font-medium text-gray-700"
                >
                  Total Fee (₹)
                </label>
                <input
                  name="total_fee"
                  id="total_fee"
                  value={
                    typeof newStudent.total_fee === "number"
                      ? newStudent.total_fee
                      : Number(newStudent.total_fee)
                  }
                  onChange={handleInputChange}
                  className="input-field mt-1"
                  min={0}
                />
              </div>
              <div>
                <label
                  htmlFor="installments"
                  className="block text-sm font-medium text-gray-700"
                >
                  Installments (1-24)
                </label>
                <input
                  type="number"
                  name="installments"
                  id="installments"
                  value={
                    typeof newStudent.installments === "number"
                      ? newStudent.installments
                      : Number(newStudent.installments)
                  }
                  onChange={handleInputChange}
                  className="input-field mt-1"
                />
              </div>

              <div>
                <label
                  htmlFor="fee_status"
                  className="block text-sm font-medium text-gray-700"
                >
                  Fee Status
                </label>
                <select
                  name="fee_status"
                  id="fee_status"
                  value={newStudent.fee_status}
                  onChange={handleInputChange}
                  className="input-field mt-1"
                >
                  {feeStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="enrollmentYearStart"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enrollment Year Start
                </label>
                <input
                  type="number"
                  name="enrollmentYearStart"
                  id="enrollmentYearStart"
                  value={enrollmentYearStart}
                  onChange={handleEnrollmentYearStartChange}
                  className="input-field mt-1"
                  min={1900}
                  max={2100}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="enrollmentYearEnd"
                  className="block text-sm font-medium text-gray-700"
                >
                  Enrollment Year End
                </label>
                <input
                  type="number"
                  name="enrollmentYearEnd"
                  id="enrollmentYearEnd"
                  value={enrollmentYearEnd}
                  onChange={handleEnrollmentYearEndChange}
                  className="input-field mt-1"
                  min={1900}
                  max={2100}
                  required
                />
              </div>
              {/* <div>
                  <label htmlFor="subjects_enrolled" className="block text-sm font-medium text-gray-700">Subjects Enrolled</label>
                  <input
                    type="text"
                    name="subjects_enrolled"
                    id="subjects_enrolled"
                    value={newStudent.subjects_enrolled.join(', ')}
                    onChange={(e) => {
                      const subjects = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                      setNewStudent(prev => ({ ...prev, subjects_enrolled: subjects }));
                    }}
                    placeholder="Enter subjects separated by commas"
                    className="input-field mt-1"
                  />
                </div> */}

              {newStudent.installments && newStudent.installments > 0 && (
                <div className="mt-4">
                  <h3 className="text-md font-semibold mb-2">
                    Installment Due Dates
                  </h3>
                  {[...Array(newStudent.installments)].map((_, index) => (
                    <div key={index} className="mb-2">
                      <label
                        htmlFor={`installment_date_${index}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Installment {index + 1} Due Date
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
                        className="input-field mt-1"
                        required
                      />
                    </div>
                  ))}
                  <h3 className="text-md font-semibold mb-2 mt-6">
                    Due Dates
                  </h3>
                  {[...Array(newStudent.installments)].map((_, index) => (
                    <div key={`due_date_${index}`} className="mb-2">
                      <label
                        htmlFor={`due_date_${index}`}
                        className="block text-sm font-medium text-gray-700"
                      >
                        Due Date {index + 1}
                      </label>
                      <input
                        type="date"
                        id={`due_date_${index}`}
                        value={
                          newStudent.due_dates && newStudent.due_dates[index]
                            ? newStudent.due_dates[index]
                            : ""
                        }
                        onChange={(e) => {
                          const newDueDates = newStudent.due_dates
                            ? [...newStudent.due_dates]
                            : [];
                          newDueDates[index] = e.target.value;
                          setNewStudent((prev) => ({
                            ...prev,
                            due_dates: newDueDates,
                          }));
                        }}
                        className="input-field mt-1"
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  className="btn-secondary"
                  onClick={() => setShowAddModal(false)}
                  disabled={adding}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  onClick={handleAddStudentSubmit}
                  disabled={adding}
                >
                  {adding ? "Adding..." : "Add Student"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      ;{/* Fee Update Modal */}
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
            {/* <div className="space-y-4">
              <p>Total Fee: ₹{newStudent.total_fee}</p>
              <p>Paid Fee: ₹{newStudent.paid_fee}</p>
              <p>Remaining Fee: ₹{getRemainingFee(newStudent)}</p>
              {(newStudent.fee_status === 'Unpaid' || newStudent.fee_status === 'Partial') && (
                <div>
                  <label htmlFor="feeAmount" className="block text-sm font-medium text-gray-700">
                    Add Amount (₹)
                  </label>
                  <input
                    type="number"
                    id="feeAmount"
                    min={0}
                    value={feeAmount ?? ''}
                    onChange={handleFeeAmountChange}
                    className="input-field mt-1"
                    placeholder="Enter amount to add"
                  />
                </div>
              )}
            </div> */}
            {/* <div className="mt-6 flex justify-end space-x-4">
              <button className="btn-secondary" onClick={() => setShowFeeModal(false)} disabled={adding}>Cancel</button>
              {(newStudent.fee_status === 'Unpaid' || newStudent.fee_status === 'Partial') && (
                <button className="btn-primary" onClick={handleFeeUpdate} disabled={adding}>
                  {adding ? 'Saving...' : 'Save'}
                </button>
              )}
            </div> */}
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
                  setAdding(true);
                  setAddError(null);
                  try {
                    // Sanitize installment_dates to replace empty strings with null before update
                    const sanitizedInstallmentDates = (newStudent.installment_dates || [])
                      .map((date) => (date === "" ? null : date))
                      .filter((d): d is string => d !== null);
                    const { error } = await supabase
                      .from("students")
                      .update({
                        installment_amt: newStudent.installment_amt,
                        installment_dates: sanitizedInstallmentDates,
                        installment_descriptions:
                          newStudent.installment_descriptions,
                        installments: newStudent.installment_amt.length,
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
                  setAdding(false);
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
                          setNewStudent((prev) => ({
                            ...prev,
                            installment_amt: newAmts,
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
          dueStudents={dueStudents}
          onDismiss={() => setShowFeeDueReminder(false)}
          onSendWhatsAppMessages={sendWhatsAppMessagesToDueStudents}
        />
      )}
    </div>
  );
};
export default Students;