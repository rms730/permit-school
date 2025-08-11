// Report schemas for regulatory reporting
// Each schema defines the column order and headers for CSV exports

export interface ReportSchema {
  key: string;
  header: string;
}

// Roster schema: one row per enrolled student
export const rosterSchema: ReportSchema[] = [
  { key: 'user_id', header: 'User ID' },
  { key: 'full_name', header: 'Full Name' },
  { key: 'date_of_birth', header: 'Date of Birth' },
  { key: 'address_city', header: 'City' },
  { key: 'address_state', header: 'State' },
  { key: 'address_zip', header: 'ZIP Code' },
  { key: 'course_id', header: 'Course ID' },
  { key: 'course_code', header: 'Course Code' },
  { key: 'course_title', header: 'Course Title' },
  { key: 'j_code', header: 'Jurisdiction' },
  { key: 'first_enroll_at', header: 'First Enrollment Date' }
];

// Exams schema: final exam attempts
export const examsSchema: ReportSchema[] = [
  { key: 'user_id', header: 'User ID' },
  { key: 'attempt_id', header: 'Attempt ID' },
  { key: 'started_at', header: 'Started At' },
  { key: 'completed_at', header: 'Completed At' },
  { key: 'score', header: 'Score' },
  { key: 'passed', header: 'Passed' },
  { key: 'course_id', header: 'Course ID' },
  { key: 'course_code', header: 'Course Code' },
  { key: 'j_code', header: 'Jurisdiction' }
];

// Certificates schema: issued certificates
export const certsSchema: ReportSchema[] = [
  { key: 'number', header: 'Certificate Number' },
  { key: 'issued_at', header: 'Issued At' },
  { key: 'student_id', header: 'Student ID' },
  { key: 'course_id', header: 'Course ID' },
  { key: 'course_code', header: 'Course Code' },
  { key: 'j_code', header: 'Jurisdiction' }
];

// Seat time schema: minutes per user/course
export const seatTimeSchema: ReportSchema[] = [
  { key: 'user_id', header: 'User ID' },
  { key: 'course_id', header: 'Course ID' },
  { key: 'course_code', header: 'Course Code' },
  { key: 'j_code', header: 'Jurisdiction' },
  { key: 'total_minutes', header: 'Total Minutes' }
];

// Helper function to get schema by name
export function getSchema(schemaName: 'roster' | 'exams' | 'certs' | 'seat_time'): ReportSchema[] {
  switch (schemaName) {
    case 'roster':
      return rosterSchema;
    case 'exams':
      return examsSchema;
    case 'certs':
      return certsSchema;
    case 'seat_time':
      return seatTimeSchema;
    default:
      throw new Error(`Unknown schema: ${schemaName}`);
  }
}
