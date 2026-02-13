import { http, HttpResponse } from 'msw';

// Minimal JSON fixtures for common endpoints
const me = { 
  id: 'test-user-id', 
  email: 'test@example.com', 
  firstName: 'Test', 
  lastName: 'User',
  role: 'student'
};

const courses = [
  { 
    id: 'course_1', 
    title: 'Driver Education Course', 
    slug: 'driver-education',
    description: 'Comprehensive driver education course'
  }
];

const units = [
  { 
    id: 'unit_1', 
    title: 'Traffic Laws', 
    courseId: 'course_1',
    order: 1
  }
];

const questions = [
  {
    id: 'q_1',
    text: 'What does a red traffic light mean?',
    options: ['Stop', 'Go', 'Yield', 'Turn right'],
    correctAnswer: 0,
    unitId: 'unit_1'
  }
];

export const defaultHandlers = [
  // Auth endpoints
  http.get('*/api/auth/user', () => HttpResponse.json(me)),
  http.post('*/api/auth/profile/upsert', () => HttpResponse.json({ success: true })),
  
  // Course endpoints
  http.get('*/api/courses', () => HttpResponse.json(courses)),
  http.get('*/api/courses/:id', ({ params }) => {
    const course = courses.find(c => c.id === params.id);
    return HttpResponse.json(course || { error: 'Course not found' });
  }),
  
  // Unit endpoints
  http.get('*/api/courses/:courseId/units', () => HttpResponse.json(units)),
  http.get('*/api/units/:id', ({ params }) => {
    const unit = units.find(u => u.id === params.id);
    return HttpResponse.json(unit || { error: 'Unit not found' });
  }),
  
  // Question endpoints
  http.get('*/api/units/:unitId/questions', () => HttpResponse.json(questions)),
  http.post('*/api/questions/:id/answer', () => HttpResponse.json({ 
    correct: true, 
    score: 100 
  })),
  
  // Quiz/Exam endpoints
  http.post('*/api/quiz/start', () => HttpResponse.json({ 
    id: 'quiz_1', 
    questions: questions.slice(0, 5) 
  })),
  http.post('*/api/quiz/:id/submit', () => HttpResponse.json({ 
    score: 80, 
    passed: true 
  })),
  http.post('*/api/exam/start', () => HttpResponse.json({ 
    id: 'exam_1', 
    questions: questions.slice(0, 10) 
  })),
  http.post('*/api/exam/:id/submit', () => HttpResponse.json({ 
    score: 85, 
    passed: true,
    certificate: 'cert_123'
  })),
  
  // Tutor endpoint
  http.post('*/api/tutor', () => HttpResponse.json({ 
    answer: 'This is a test answer from the tutor.',
    sources: ['test-source-1', 'test-source-2']
  })),
  
  // Billing endpoints
  http.get('*/api/billing/subscription', () => HttpResponse.json({ 
    status: 'active',
    plan: 'basic'
  })),
  http.post('*/api/billing/checkout', () => HttpResponse.json({ 
    url: 'https://checkout.stripe.com/test'
  })),
  
  // Profile endpoints
  http.get('*/api/profile', () => HttpResponse.json(me)),
  http.put('*/api/profile', () => HttpResponse.json({ success: true })),
  
  // Guardian endpoints
  http.get('*/api/guardian/students', () => HttpResponse.json([])),
  http.post('*/api/guardian/link', () => HttpResponse.json({ success: true })),
  
  // Admin endpoints
  http.get('*/api/admin/users', () => HttpResponse.json([me])),
  http.get('*/api/admin/courses', () => HttpResponse.json(courses)),
  
  // Health check
  http.get('*/api/health', () => HttpResponse.json({ status: 'ok' })),
  
  // Testkit endpoints (for E2E)
  http.post('*/api/testkit/reset', () => HttpResponse.json({ success: true })),
  http.post('*/api/testkit/user', () => HttpResponse.json({ 
    user: { ...me, id: 'testkit-user' } 
  })),
];

// Helper functions to override specific endpoints in tests
export const createUserHandler = (user: any) => 
  http.get('*/api/auth/user', () => HttpResponse.json(user));

export const createCourseHandler = (course: any) => 
  http.get('*/api/courses/:id', () => HttpResponse.json(course));

export const createErrorHandler = (endpoint: string, status: number = 500) =>
  http.all(endpoint, () => HttpResponse.json({ error: 'Test error' }, { status }));
