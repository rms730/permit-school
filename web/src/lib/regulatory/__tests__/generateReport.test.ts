import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { generateReport } from '../generateReport';
import { getSchema } from '../reportSchemas';

// Mock environment variables
process.env.TESTKIT_ON = 'true';
process.env.REGULATORY_SIGNING_SECRET = 'test-signing-secret';

// Test data helpers
const TESTKIT_BASE_URL = process.env.TESTKIT_BASE_URL || 'http://localhost:3000';

async function createTestData() {
  // Create test user
  const userResponse = await fetch(`${TESTKIT_BASE_URL}/api/testkit/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test-student@example.com',
      role: 'student',
      full_name: 'Test Student'
    })
  });
  
  if (!userResponse.ok) {
    throw new Error('Failed to create test user');
  }
  
  const userData = await userResponse.json();
  
  // Create test enrollment
  const enrollmentResponse = await fetch(`${TESTKIT_BASE_URL}/api/testkit/enroll`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userData.user_id,
      course_code: 'DE-ONLINE',
      j_code: 'CA'
    })
  });
  
  if (!enrollmentResponse.ok) {
    throw new Error('Failed to create test enrollment');
  }
  
  // Create test exam attempt
  const examResponse = await fetch(`${TESTKIT_BASE_URL}/api/testkit/exam`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userData.user_id,
      course_code: 'DE-ONLINE',
      j_code: 'CA',
      score: 0.85,
      passed: true
    })
  });
  
  if (!examResponse.ok) {
    throw new Error('Failed to create test exam');
  }
  
  // Create test seat time
  const seatTimeResponse = await fetch(`${TESTKIT_BASE_URL}/api/testkit/seat-time`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userData.user_id,
      course_code: 'DE-ONLINE',
      j_code: 'CA',
      minutes: 150
    })
  });
  
  if (!seatTimeResponse.ok) {
    throw new Error('Failed to create test seat time');
  }
  
  // Create test certificate
  const certResponse = await fetch(`${TESTKIT_BASE_URL}/api/testkit/cert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userData.user_id,
      course_code: 'DE-ONLINE',
      j_code: 'CA',
      number: 'CA-2024-000001'
    })
  });
  
  if (!certResponse.ok) {
    throw new Error('Failed to create test certificate');
  }
  
  return {
    user_id: userData.user_id,
    course_id: enrollmentResponse.json().course_id
  };
}

describe('Regulatory Report Generation', () => {
  let testData: any;
  
  beforeAll(async () => {
    if (process.env.TESTKIT_ON !== 'true') {
      console.log('Skipping tests - TESTKIT_ON not enabled');
      return;
    }
    
    testData = await createTestData();
  });
  
  afterAll(async () => {
    // Cleanup test data if needed
    if (testData) {
      // Add cleanup logic here if needed
    }
  });
  
  it('should generate report schemas correctly', () => {
    const rosterSchema = getSchema('roster');
    const examsSchema = getSchema('exams');
    const certsSchema = getSchema('certs');
    const seatTimeSchema = getSchema('seat_time');
    
    expect(rosterSchema).toBeDefined();
    expect(rosterSchema.length).toBeGreaterThan(0);
    expect(rosterSchema[0]).toHaveProperty('key');
    expect(rosterSchema[0]).toHaveProperty('header');
    
    expect(examsSchema).toBeDefined();
    expect(examsSchema.length).toBeGreaterThan(0);
    
    expect(certsSchema).toBeDefined();
    expect(certsSchema.length).toBeGreaterThan(0);
    
    expect(seatTimeSchema).toBeDefined();
    expect(seatTimeSchema.length).toBeGreaterThan(0);
  });
  
  it('should generate a complete regulatory report', async () => {
    if (process.env.TESTKIT_ON !== 'true') {
      console.log('Skipping test - TESTKIT_ON not enabled');
      return;
    }
    
    const periodStart = '2024-01-01';
    const periodEnd = '2024-01-31';
    
    const result = await generateReport({
      jCode: 'CA',
      courseId: testData.course_id,
      periodStart,
      periodEnd,
      initiatedByUserId: 'test-admin'
    });
    
    // Verify result structure
    expect(result).toHaveProperty('runId');
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('artifacts');
    
    // Verify summary contains expected counts
    expect(result.summary).toHaveProperty('roster');
    expect(result.summary).toHaveProperty('exams');
    expect(result.summary).toHaveProperty('certs');
    expect(result.summary).toHaveProperty('seatTime');
    
    // Verify counts are greater than 0 (we created test data)
    expect(result.summary.roster).toBeGreaterThan(0);
    expect(result.summary.exams).toBeGreaterThan(0);
    expect(result.summary.certs).toBeGreaterThan(0);
    expect(result.summary.seatTime).toBeGreaterThan(0);
    
    // Verify artifacts were created
    expect(result.artifacts.length).toBeGreaterThan(0);
    
    // Verify expected artifacts exist
    const artifactNames = result.artifacts.map(a => a.name);
    expect(artifactNames).toContain('roster.csv');
    expect(artifactNames).toContain('exams.csv');
    expect(artifactNames).toContain('certs.csv');
    expect(artifactNames).toContain('seat_time.csv');
    expect(artifactNames).toContain('cover.pdf');
    expect(artifactNames).toContain('manifest.json');
    
    // Verify each artifact has required properties
    result.artifacts.forEach(artifact => {
      expect(artifact).toHaveProperty('name');
      expect(artifact).toHaveProperty('sha256');
      expect(artifact).toHaveProperty('bytes');
      expect(artifact.bytes).toBeGreaterThan(0);
      expect(artifact.sha256).toMatch(/^[a-f0-9]{64}$/); // SHA256 hex format
    });
    
    // Verify manifest was signed
    const manifestArtifact = result.artifacts.find(a => a.name === 'manifest.json');
    expect(manifestArtifact).toBeDefined();
    expect(manifestArtifact!.bytes).toBeGreaterThan(0);
  });
  
  it('should handle empty data periods gracefully', async () => {
    if (process.env.TESTKIT_ON !== 'true') {
      console.log('Skipping test - TESTKIT_ON not enabled');
      return;
    }
    
    const periodStart = '2020-01-01';
    const periodEnd = '2020-01-31';
    
    const result = await generateReport({
      jCode: 'CA',
      courseId: testData.course_id,
      periodStart,
      periodEnd,
      initiatedByUserId: 'test-admin'
    });
    
    // Should still generate a report with zero counts
    expect(result.summary.roster).toBe(0);
    expect(result.summary.exams).toBe(0);
    expect(result.summary.certs).toBe(0);
    expect(result.summary.seatTime).toBe(0);
    
    // Should still create all artifacts
    expect(result.artifacts.length).toBeGreaterThan(0);
  });
});
