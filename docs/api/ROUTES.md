---
title: "API Reference"
owner: "Engineering"
last_reviewed: "2025-01-27"
status: "authoritative"
related:
  - </docs/ARCHITECTURE.md>
  - </web/src/app/api/>
---

# API Reference

**Purpose & Outcome**  
Complete documentation of all API endpoints in the Permit School application, including authentication requirements, request/response formats, and usage examples.

## Authentication

Most API endpoints require authentication via Supabase Auth. Include the session cookie or Authorization header:

```bash
# Using session cookie (automatic with Supabase Auth Helpers)
curl -H "Cookie: sb-..." https://api.example.com/endpoint

# Using Authorization header
curl -H "Authorization: Bearer <jwt_token>" https://api.example.com/endpoint
```

## Response Format

All API responses follow this standard format:

```typescript
// Success response
{
  "data": { ... },
  "status": "success"
}

// Error response
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "status": "error"
}
```

## Health & System

### GET /api/health

**Purpose**: System health check and status monitoring

**Authentication**: None

**Response**:

```json
{
  "status": "ok",
  "time": "2025-01-27T18:22:24.123Z",
  "responseTime": "45ms",
  "supabase": "ok",
  "build": {
    "commit": "abc123",
    "timestamp": "2025-01-27T18:00:00Z"
  },
  "services": {
    "database": "ok",
    "email": "configured",
    "monitoring": "configured"
  }
}
```

**Example**:

```bash
curl http://localhost:3000/api/health
```

## Authentication & Profile

### GET /api/profile

**Purpose**: Get current user's student profile

**Authentication**: Required

**Response**:

```json
{
  "id": "uuid",
  "user_id": "auth_user_id",
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "2000-01-01",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": { ... },
  "created_at": "2025-01-27T18:22:24.123Z"
}
```

### PUT /api/profile

**Purpose**: Update current user's student profile

**Authentication**: Required

**Request Body**:

```json
{
  "first_name": "John",
  "last_name": "Doe",
  "date_of_birth": "2000-01-01",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zip": "12345"
  }
}
```

### GET /api/account/profile

**Purpose**: Get current user's account profile (includes role)

**Authentication**: Required

**Response**:

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "student",
  "created_at": "2025-01-27T18:22:24.123Z",
  "updated_at": "2025-01-27T18:22:24.123Z"
}
```

### PUT /api/account/profile

**Purpose**: Update current user's account profile

**Authentication**: Required

**Request Body**:

```json
{
  "email": "newemail@example.com",
  "role": "student"
}
```

## Enrollment & Courses

### POST /api/enroll

**Purpose**: Enroll user in a course

**Authentication**: Required

**Request Body**:

```json
{
  "course_id": "uuid",
  "guardian_name": "Jane Doe",
  "guardian_email": "guardian@example.com"
}
```

**Response**:

```json
{
  "enrollment_id": "uuid",
  "status": "pending_guardian_consent",
  "course": {
    "id": "uuid",
    "title": "California Driver Education",
    "hours_required_minutes": 9000
  }
}
```

### GET /api/enrollments

**Purpose**: Get user's course enrollments

**Authentication**: Required

**Response**:

```json
{
  "enrollments": [
    {
      "id": "uuid",
      "course_id": "uuid",
      "status": "active",
      "enrolled_at": "2025-01-27T18:22:24.123Z",
      "course": {
        "title": "California Driver Education",
        "j_code": "CA"
      }
    }
  ]
}
```

### GET /api/public/catalog

**Purpose**: Get public course catalog

**Authentication**: None

**Response**:

```json
{
  "catalog": [
    {
      "id": "uuid",
      "title": "California Driver Education",
      "j_code": "CA",
      "hours_required_minutes": 9000,
      "price": 99.99,
      "active": true
    }
  ]
}
```

## Learning & Progress

### POST /api/progress/seat-time

**Purpose**: Record seat time for learning session

**Authentication**: Required

**Request Body**:

```json
{
  "unit_id": "uuid",
  "minutes": 30,
  "session_start": "2025-01-27T18:00:00Z",
  "session_end": "2025-01-27T18:30:00Z"
}
```

### POST /api/progress/heartbeat

**Purpose**: Keep learning session active

**Authentication**: Required

**Request Body**:

```json
{
  "unit_id": "uuid",
  "timestamp": "2025-01-27T18:22:24.123Z"
}
```

## Quizzes & Practice

### POST /api/attempts/start

**Purpose**: Start a new quiz attempt

**Authentication**: Required

**Request Body**:

```json
{
  "unit_id": "uuid",
  "quiz_type": "unit_quiz"
}
```

**Response**:

```json
{
  "attempt_id": "uuid",
  "questions": [
    {
      "id": "uuid",
      "question": "What does a red traffic light mean?",
      "options": ["Stop", "Go", "Yield", "Turn right"],
      "type": "multiple_choice"
    }
  ],
  "time_limit_minutes": 30
}
```

### POST /api/attempts/answer

**Purpose**: Submit answer for current question

**Authentication**: Required

**Request Body**:

```json
{
  "attempt_id": "uuid",
  "question_id": "uuid",
  "answer": "Stop",
  "time_spent_seconds": 15
}
```

### POST /api/attempts/complete

**Purpose**: Complete quiz attempt

**Authentication**: Required

**Request Body**:

```json
{
  "attempt_id": "uuid"
}
```

**Response**:

```json
{
  "score": 85,
  "total_questions": 10,
  "correct_answers": 8,
  "passed": true,
  "feedback": "Great job! You passed the quiz."
}
```

## Final Exam

### GET /api/exam/eligibility

**Purpose**: Check if user is eligible for final exam

**Authentication**: Required

**Response**:

```json
{
  "eligible": true,
  "requirements": {
    "seat_time_minutes": 9000,
    "current_seat_time": 9200,
    "quizzes_completed": 12,
    "required_quizzes": 12
  },
  "message": "You are eligible to take the final exam"
}
```

### POST /api/exam/start

**Purpose**: Start final exam

**Authentication**: Required

**Request Body**:

```json
{
  "course_id": "uuid"
}
```

**Response**:

```json
{
  "attempt_id": "uuid",
  "questions": [ ... ],
  "time_limit_minutes": 60,
  "passing_score": 80
}
```

### POST /api/exam/answer

**Purpose**: Submit exam answer

**Authentication**: Required

**Request Body**:

```json
{
  "attempt_id": "uuid",
  "question_id": "uuid",
  "answer": "Stop",
  "time_spent_seconds": 30
}
```

### POST /api/exam/complete

**Purpose**: Complete final exam

**Authentication**: Required

**Request Body**:

```json
{
  "attempt_id": "uuid"
}
```

**Response**:

```json
{
  "passed": true,
  "score": 85,
  "certificate_number": "CA-2025-000123",
  "certificate_url": "/verify/CA-2025-000123"
}
```

## Certificates

### GET /api/certificates/verify/[number]

**Purpose**: Verify certificate authenticity

**Authentication**: None

**Response**:

```json
{
  "valid": true,
  "certificate": {
    "number": "CA-2025-000123",
    "student_name": "John Doe",
    "course": "California Driver Education",
    "issued_date": "2025-01-27T18:22:24.123Z",
    "status": "active"
  }
}
```

### GET /api/certificates/attempt/[attemptId]

**Purpose**: Get certificate details for exam attempt

**Authentication**: Required

**Response**:

```json
{
  "certificate": {
    "id": "uuid",
    "number": "CA-2025-000123",
    "student_name": "John Doe",
    "course": "California Driver Education",
    "issued_date": "2025-01-27T18:22:24.123Z",
    "download_url": "/api/certificates/download/uuid"
  }
}
```

## Guardian Management

### POST /api/guardian/request

**Purpose**: Request guardian consent for minor enrollment

**Authentication**: Required

**Request Body**:

```json
{
  "course_id": "uuid",
  "guardian_name": "Jane Doe",
  "guardian_email": "guardian@example.com"
}
```

**Response**:

```json
{
  "request_id": "uuid",
  "status": "pending",
  "expires_at": "2025-01-28T18:22:24.123Z"
}
```

### GET /api/guardian/verify/[token]

**Purpose**: Verify guardian consent token

**Authentication**: None

**Response**:

```json
{
  "student_initials": "J D.",
  "course_title": "California Driver Education",
  "jurisdiction_name": "California",
  "guardian_name": "Jane Doe",
  "expires_at": "2025-01-28T18:22:24.123Z"
}
```

### POST /api/guardian/consent

**Purpose**: Provide guardian consent

**Authentication**: None (uses token)

**Request Body**:

```json
{
  "token": "consent_token",
  "guardian_name": "Jane Doe",
  "guardian_email": "guardian@example.com",
  "consent": true
}
```

### GET /api/guardian/children

**Purpose**: Get guardian's linked children

**Authentication**: Required (guardian role)

**Response**:

```json
{
  "children": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "enrollments": [
        {
          "course_title": "California Driver Education",
          "status": "active"
        }
      ]
    }
  ]
}
```

## Billing & Payments

### POST /api/billing/checkout

**Purpose**: Create Stripe checkout session

**Authentication**: Required

**Request Body**:

```json
{
  "course_id": "uuid",
  "price_id": "price_stripe_id"
}
```

**Response**:

```json
{
  "checkout_url": "https://checkout.stripe.com/...",
  "session_id": "cs_test_..."
}
```

### GET /api/billing/summary

**Purpose**: Get user's billing summary

**Authentication**: Required

**Response**:

```json
{
  "subscriptions": [
    {
      "id": "sub_...",
      "status": "active",
      "current_period_end": "2025-02-27T18:22:24.123Z",
      "cancel_at_period_end": false
    }
  ],
  "invoices": [
    {
      "id": "in_...",
      "amount": 9999,
      "status": "paid",
      "created": "2025-01-27T18:22:24.123Z"
    }
  ]
}
```

### GET /api/billing/invoices

**Purpose**: Get user's invoice history

**Authentication**: Required

**Response**:

```json
{
  "invoices": [
    {
      "id": "in_...",
      "number": "INV-001",
      "amount": 9999,
      "status": "paid",
      "created": "2025-01-27T18:22:24.123Z",
      "pdf_url": "https://..."
    }
  ]
}
```

### POST /api/billing/portal

**Purpose**: Create Stripe customer portal session

**Authentication**: Required

**Response**:

```json
{
  "portal_url": "https://billing.stripe.com/..."
}
```

### POST /api/billing/cancel

**Purpose**: Cancel subscription

**Authentication**: Required

**Request Body**:

```json
{
  "subscription_id": "sub_..."
}
```

### POST /api/billing/resume

**Purpose**: Resume cancelled subscription

**Authentication**: Required

**Request Body**:

```json
{
  "subscription_id": "sub_..."
}
```

## Admin APIs

### GET /api/admin/courses

**Purpose**: Get all courses (admin only)

**Authentication**: Required (admin role)

**Response**:

```json
{
  "courses": [
    {
      "id": "uuid",
      "code": "CA-DE-ONLINE",
      "title": "California Driver Education",
      "active": true,
      "hours_required_minutes": 9000,
      "jurisdictions": {
        "name": "California",
        "code": "CA"
      }
    }
  ]
}
```

### GET /api/admin/blueprints

**Purpose**: Get exam blueprints for course

**Authentication**: Required (admin role)

**Query Parameters**:

- `course_id` (required): Course UUID

**Response**:

```json
{
  "blueprints": [
    {
      "id": "uuid",
      "name": "Standard Blueprint",
      "total_questions": 30,
      "is_active": true,
      "exam_blueprint_rules": [
        {
          "rule_no": 1,
          "skill": "Traffic Laws",
          "count": 10,
          "min_difficulty": 1,
          "max_difficulty": 3
        }
      ]
    }
  ]
}
```

### POST /api/admin/regulatory/run

**Purpose**: Generate regulatory report

**Authentication**: Required (admin role)

**Request Body**:

```json
{
  "jCode": "CA",
  "courseId": "uuid",
  "periodStart": "2025-01-01",
  "periodEnd": "2025-01-31",
  "dryRun": false
}
```

**Response**:

```json
{
  "run_id": "uuid",
  "status": "completed",
  "records_processed": 150,
  "download_url": "/api/admin/regulatory/runs/uuid/download"
}
```

### GET /api/admin/regulatory/runs

**Purpose**: Get regulatory report history

**Authentication**: Required (admin role)

**Response**:

```json
{
  "runs": [
    {
      "id": "uuid",
      "j_code": "CA",
      "course_id": "uuid",
      "period_start": "2025-01-01",
      "period_end": "2025-01-31",
      "status": "completed",
      "created_at": "2025-01-27T18:22:24.123Z"
    }
  ]
}
```

## Tutor AI

### POST /api/tutor

**Purpose**: Get AI tutoring assistance

**Authentication**: Required

**Request Body**:

```json
{
  "query": "What does a yellow traffic light mean?",
  "j_code": "CA",
  "top_k": 5,
  "lang": "en"
}
```

**Response**:

```json
{
  "answer": "A yellow traffic light means you should stop if it is safe to do so...",
  "sources": [
    {
      "title": "Traffic Signals",
      "content": "...",
      "page": 45
    }
  ],
  "model": "gpt-4",
  "latency_ms": 1250
}
```

## Notifications

### GET /api/notifications

**Purpose**: Get user's notifications

**Authentication**: Required

**Response**:

```json
{
  "notifications": [
    {
      "id": "uuid",
      "title": "Course Completed",
      "message": "Congratulations! You've completed the course.",
      "type": "success",
      "read": false,
      "created_at": "2025-01-27T18:22:24.123Z"
    }
  ]
}
```

### POST /api/notifications/read

**Purpose**: Mark notification as read

**Authentication**: Required

**Request Body**:

```json
{
  "notification_id": "uuid"
}
```

## Testkit APIs (Development Only)

These APIs are only available when `TESTKIT_ON=true`:

### POST /api/testkit/reset

**Purpose**: Reset all test data

**Authentication**: Required (testkit token)

### POST /api/testkit/user

**Purpose**: Create test user

**Authentication**: Required (testkit token)

**Request Body**:

```json
{
  "email": "test@example.com",
  "admin": false,
  "profile": {
    "first_name": "Test",
    "last_name": "User",
    "date_of_birth": "2000-01-01"
  }
}
```

### POST /api/testkit/enroll

**Purpose**: Enroll test user in course

**Authentication**: Required (testkit token)

**Request Body**:

```json
{
  "email": "test@example.com",
  "course_id": "uuid"
}
```

### POST /api/testkit/seat-time

**Purpose**: Add seat time for test user

**Authentication**: Required (testkit token)

**Request Body**:

```json
{
  "email": "test@example.com",
  "minutes": 150
}
```

## Error Codes

| Code                  | Description                     | HTTP Status |
| --------------------- | ------------------------------- | ----------- |
| `UNAUTHENTICATED`     | User not authenticated          | 401         |
| `FORBIDDEN`           | User lacks required permissions | 403         |
| `NOT_FOUND`           | Resource not found              | 404         |
| `VALIDATION_ERROR`    | Invalid request data            | 400         |
| `RATE_LIMIT_EXCEEDED` | Too many requests               | 429         |
| `INTERNAL_ERROR`      | Server error                    | 500         |

## Rate Limiting

Most API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 60 requests per minute
- **Tutor API**: 10 requests per hour
- **Admin endpoints**: 100 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1643300000
```

## Pagination

List endpoints support pagination:

**Query Parameters**:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

**Response Headers**:

```
X-Total-Count: 150
X-Page-Count: 8
```

---

**Next**: [Environment Variables](ENVIRONMENT_VARIABLES.md) - Complete environment configuration reference
