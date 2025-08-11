import { Page } from '@playwright/test';

export interface TestUser {
  id: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  minor: boolean;
  locale: string;
  admin: boolean;
  guardian_email?: string;
}

export class TestkitAPI {
  constructor(
    private baseURL: string,
    private token: string
  ) {}

  async reset() {
    const response = await fetch(`${this.baseURL}/api/testkit/reset`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok()) {
      throw new Error(`Reset failed: ${await response.text()}`);
    }

    return response.json();
  }

  async createUser(options: { minor?: boolean; locale?: 'en' | 'es'; admin?: boolean } = {}): Promise<TestUser> {
    const response = await fetch(`${this.baseURL}/api/testkit/user`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });

    if (!response.ok()) {
      throw new Error(`User creation failed: ${await response.text()}`);
    }

    const data = await response.json();
    return data.user;
  }

  async enrollUser(userId: string, jCode: string, courseCode: string) {
    const response = await fetch(`${this.baseURL}/api/testkit/enroll`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        j_code: jCode,
        course_code: courseCode
      })
    });

    if (!response.ok()) {
      throw new Error(`Enrollment failed: ${await response.text()}`);
    }

    return response.json();
  }

  async addSeatTime(userId: string, jCode: string, courseCode: string, totalMs: number, unitId?: string) {
    const response = await fetch(`${this.baseURL}/api/testkit/seat-time`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        j_code: jCode,
        course_code: courseCode,
        total_ms: totalMs,
        unit_id: unitId
      })
    });

    if (!response.ok()) {
      throw new Error(`Seat time addition failed: ${await response.text()}`);
    }

    return response.json();
  }

  async setEntitlement(userId: string, jCode: string, active: boolean) {
    const response = await fetch(`${this.baseURL}/api/testkit/entitlement`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        j_code: jCode,
        active
      })
    });

    if (!response.ok()) {
      throw new Error(`Entitlement setting failed: ${await response.text()}`);
    }

    return response.json();
  }

  async createGuardianRequest(userId: string, jCode: string, courseCode: string) {
    const response = await fetch(`${this.baseURL}/api/testkit/guardian/request`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        j_code: jCode,
        course_code: courseCode
      })
    });

    if (!response.ok()) {
      throw new Error(`Guardian request creation failed: ${await response.text()}`);
    }

    return response.json();
  }

  async ensureExamBlueprint(jCode: string, courseCode: string, numQuestions?: number) {
    const response = await fetch(`${this.baseURL}/api/testkit/exam/blueprint`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        j_code: jCode,
        course_code: courseCode,
        num_questions: numQuestions
      })
    });

    if (!response.ok()) {
      throw new Error(`Exam blueprint creation failed: ${await response.text()}`);
    }

    return response.json();
  }

  async issueCertificate(certificateId?: string, userId?: string, jCode?: string, courseCode?: string) {
    const response = await fetch(`${this.baseURL}/api/testkit/cert/draft-to-issued`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        certificate_id: certificateId,
        user_id: userId,
        j_code: jCode,
        course_code: courseCode
      })
    });

    if (!response.ok()) {
      throw new Error(`Certificate issuance failed: ${await response.text()}`);
    }

    return response.json();
  }
}

export async function getTestkitAPI(page: Page): Promise<TestkitAPI> {
  const baseURL = page.url().replace(/\/.*$/, '');
  const token = process.env.TESTKIT_TOKEN;
  
  if (!token) {
    throw new Error('TESTKIT_TOKEN environment variable is required');
  }

  return new TestkitAPI(baseURL, token);
}

export function getTestUser(): TestUser {
  const userStr = process.env.TEST_STUDENT_USER;
  if (!userStr) {
    throw new Error('TEST_STUDENT_USER environment variable is required');
  }
  return JSON.parse(userStr);
}

export function getTestAdminUser(): TestUser {
  const userStr = process.env.TEST_ADMIN_USER;
  if (!userStr) {
    throw new Error('TEST_ADMIN_USER environment variable is required');
  }
  return JSON.parse(userStr);
}

export function getTestMinorUser(): TestUser {
  const userStr = process.env.TEST_MINOR_USER;
  if (!userStr) {
    throw new Error('TEST_MINOR_USER environment variable is required');
  }
  return JSON.parse(userStr);
}
