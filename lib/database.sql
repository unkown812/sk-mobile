-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.attendance (
    date date NOT NULL,
    status text,
    student_id bigint,
    id uuid NOT NULL DEFAULT uuid_generate_v4 (),
    name text,
    CONSTRAINT attendance_pkey PRIMARY KEY (id),
    CONSTRAINT attendance_name_fkey FOREIGN KEY (name) REFERENCES public.students (name)
);

CREATE TABLE public.exams (
    name text,
    date date,
    category text,
    course text,
    year numeric,
    subject text,
    marks smallint,
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    CONSTRAINT exams_pkey PRIMARY KEY (id)
);

CREATE TABLE public.payments (
  student_id uuid NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  payment_date date,
  payment_method text NOT NULL,
  status text,
  description text,
  student_name text,
  created_at timestamp with time zone DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_student_name_fkey FOREIGN KEY (student_name) REFERENCES public.students(name),
  CONSTRAINT payments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);

CREATE TABLE public.performance (
    exam_name text NOT NULL,
    date date NOT NULL,
    marks numeric NOT NULL,
    total_marks numeric NOT NULL,
    percentage numeric NOT NULL,
    student_name text NOT NULL,
    student_category text,
    id uuid,
    result_id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
    CONSTRAINT performance_pkey PRIMARY KEY (result_id)
);

CREATE TABLE public.students (
    name text NOT NULL UNIQUE,
    email text,
    phone text,
    category text NOT NULL,
    course text NOT NULL,
    fee_status text,
    paid_fee numeric,
    total_fee bigint,
    due_amount bigint,
    last_payment date,
    year smallint,
    birthday date,
    installments integer CHECK (
        installments > 0
        AND installments <= 24
    ),
    enrollment_year ARRAY,
    semester smallint,
    subjects_enrolled ARRAY,
    installment_dates ARRAY,
    installment_amt ARRAY,
    id uuid NOT NULL DEFAULT gen_random_uuid (),
    created_at date,
    due_dates ARRAY,
    enrollment_date date,
    installment_descriptions ARRAY,
    CONSTRAINT students_pkey PRIMARY KEY (id)
);