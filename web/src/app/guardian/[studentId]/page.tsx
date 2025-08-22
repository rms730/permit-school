"use client";

import { Person as PersonIcon, ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Divider,
} from "@mui/material";
import { useRouter, useParams } from "next/navigation";
import * as React from "react";
import { useState, useEffect } from "react";

import { useI18n } from "@/lib/i18n/I18nProvider";


interface GuardianChild {
  guardian_id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  dob: string;
  student_role: string;
}

interface CourseProgress {
  guardian_id: string;
  student_id: string;
  course_id: string;
  j_code: string;
  course_code: string;
  course_title: string;
  minutes_total: number;
  final_exam_score: number | null;
  final_exam_completed: string | null;
  has_certificate: boolean;
}

export default function GuardianStudentPage() {
  const { dict } = useI18n();
  const router = useRouter();
  const params = useParams();
  const studentId = params.studentId as string;
  
  const [student, setStudent] = useState<GuardianChild | null>(null);
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStudentData() {
      try {
        // Fetch student info
        const studentResponse = await fetch('/api/guardian/children');
        if (studentResponse.ok) {
          const studentData = await studentResponse.json();
          const foundStudent = studentData.children?.find(
            (child: GuardianChild) => child.student_id === studentId
          );
          if (foundStudent) {
            setStudent(foundStudent);
          } else {
            setError('Student not found');
            return;
          }
        } else {
          setError('Failed to load student data');
          return;
        }

        // Fetch course progress
        const coursesResponse = await fetch(`/api/guardian/children/${studentId}/courses`);
        if (coursesResponse.ok) {
          const coursesData = await coursesResponse.json();
          setCourses(coursesData.courses || []);
        } else {
          setError('Failed to load course progress');
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError('Failed to load student data');
      } finally {
        setLoading(false);
      }
    }

    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  const calculateAge = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Not completed';
    return new Date(dateString).toLocaleDateString();
  };

  const formatScore = (score: number | null): string => {
    if (score === null) return 'Not completed';
    return `${Math.round(score * 100)}%`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>{dict.common.loading}</Typography>
      </Container>
    );
  }

  if (error || !student) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography color="error">{error || 'Student not found'}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back button */}
      <Box sx={{ mb: 3 }}>
        <Chip
          icon={<ArrowBackIcon />}
          label="Back to Students"
          onClick={() => router.push('/guardian')}
          clickable
          variant="outlined"
        />
      </Box>

      {/* Student Hero */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ mr: 2, width: 64, height: 64 }}>
              <PersonIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" component="h1">
                {student.first_name} {student.last_name}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {dict.guardian.age}: {calculateAge(student.dob)} {dict.guardian.yearsOld}
              </Typography>
              <Chip 
                label={student.student_role} 
                size="small" 
                color="primary" 
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Course Progress */}
      <Typography variant="h5" component="h2" gutterBottom>
        {dict.guardian.courseProgress}
      </Typography>

      {courses.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary">
              No course progress found for this student.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell align="right">{dict.guardian.minutesStudied}</TableCell>
                <TableCell align="right">{dict.guardian.finalExamScore}</TableCell>
                <TableCell align="center">{dict.guardian.certificateStatus}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.course_id}>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {course.course_title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {course.j_code} - {course.course_code}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {Math.round(course.minutes_total)} min
                  </TableCell>
                  <TableCell align="right">
                    {formatScore(course.final_exam_score)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={course.has_certificate ? dict.guardian.hasCertificate : dict.guardian.noCertificate}
                      color={course.has_certificate ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
