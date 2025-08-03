import React from "react";
import { XCircle } from "lucide-react";
import { Student } from "../../lib/database.types";

interface EditStudentModalProps {
  editStudent: Student;
  setEditStudent: React.Dispatch<React.SetStateAction<Student | null>>;
  onClose: () => void;
  onSave: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
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
  const handleEnrollmentYearStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === "" ? "" : Number(e.target.value);
    setEnrollmentYearStart(val);
  };

  const handleEnrollmentYearEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value === "" ? "" : Number(e.target.value);
    setEnrollmentYearEnd(val);
  };

  return (
    <div className="fixed inset-0 scrollbar-hide bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Student Details</h2>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={editStudent.name || ""}
              onChange={onInputChange}
              className="input-field mt-1"
              required
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <input
              type="text"
              name="category"
              id="category"
              value={editStudent.category || ""}
              onChange={onInputChange}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label htmlFor="course" className="block text-sm font-medium text-gray-700">
              Course
            </label>
            <input
              type="text"
              name="course"
              id="course"
              value={editStudent.course || ""}
              onChange={onInputChange}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700">
              Year
            </label>
            <input
              type="number"
              name="year"
              id="year"
              value={editStudent.year || ""}
              onChange={onInputChange}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700">
              Semester
            </label>
            <input
              type="number"
              name="semester"
              id="semester"
              value={editStudent.semester || ""}
              onChange={onInputChange}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={editStudent.email || ""}
              onChange={onInputChange}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={editStudent.phone || ""}
              onChange={onInputChange}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label htmlFor="enrollmentYearStart" className="block text-sm font-medium text-gray-700">
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
            <label htmlFor="enrollmentYearEnd" className="block text-sm font-medium text-gray-700">
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
            <label htmlFor="total_fee" className="block text-sm font-medium text-gray-700">
              Total Fee
            </label>
            <input
              type="number"
              name="total_fee"
              id="total_fee"
              value={editStudent.total_fee || ""}
              onChange={onInputChange}
              className="input-field mt-1"
              min={0}
            />
          </div>
          <div>
            <label htmlFor="installments" className="block text-sm font-medium text-gray-700">
              Installments
            </label>
            <input
              type="number"
              name="installments"
              id="installments"
              value={editStudent.installments || ""}
              onChange={onInputChange}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label htmlFor="fee_status" className="block text-sm font-medium text-gray-700">
              Fee Status
            </label>
            <input
              type="text"
              name="fee_status"
              id="fee_status"
              value={editStudent.fee_status || ""}
              onChange={onInputChange}
              className="input-field mt-1"
            />
          </div>
          <div>
            <label htmlFor="subjects_enrolled" className="block text-sm font-medium text-gray-700">
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
                    Installment {index + 1} Due Date
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
              onClick={onClose}
              disabled={adding}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={onSave}
              disabled={adding}
            >
              {adding ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditStudentModal;
