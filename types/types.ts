export interface Student {
  id?: number;
  name: string;
  category: string;
  course: string;
  year: number;
  semester: number | null;
  email: string;
  phone: string;
  enrollment_date: string;
  created_at: string;
  fee_status: string;
  total_fee: number | null;
  paid_fee: number | null;
  due_amount: number | null;
  last_payment: string;
  birthday: string;
  installment_amt: number[];
  installments: number | null;
  installment_dates?: string[];
  installment_descriptions?: string[];
  enrollment_year: number[];
  subjects_enrolled: string[];
  due_dates?: string[];
}

export interface FeeSummary {
  id: number;
  name: string;
  category: string;
  course: string;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  payment_date: string;
  payment_method: string;
  status: "Paid" | "Partial" | "Unpaid";
  description: string;
}

export interface Payment {
  id: number;
  student_id: number;
  student_name: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  description: string;
  status: string;
}

export interface Exam {
  id: number;
  name: string;
  date: string;
  category: string;
  course: string;
  year: number;
  subject: string;
  marks: number;
}

export interface Performance {
  id: number;
  result_id: number;
  exam_name: string;
  student_category: string;
  student_name: string;
  date: string;
  marks: number;
  total_marks: number;
  percentage: number;
}