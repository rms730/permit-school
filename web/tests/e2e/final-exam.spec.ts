import { test, expect } from '@playwright/test';
import { TestkitAPI } from './utils/testkit';

test.describe('Final Exam (CA/DE-ONLINE)', () => {
  test('fail then pass flow with certificate eligibility', async ({ request }) => {
    const tk = new TestkitAPI(process.env.BASE_URL!, process.env.TESTKIT_TOKEN!);
    
    // Create test users
    const admin = await tk.createUser({ admin: true, locale: 'en' });
    const student = await tk.createUser({ admin: false, locale: 'en' });
    
    // Enroll student in CA DE-ONLINE
    await tk.enrollUser(student.id, 'CA', 'DE-ONLINE');
    
    // Ensure active blueprint exists
    await tk.ensureExamBlueprint('CA', 'DE-ONLINE');

    // Start final exam
    const start = await request.post('/api/exam/start', { 
      data: { 
        j_code: 'CA', 
        course_code: 'DE-ONLINE', 
        mode: 'final' 
      }
    });
    expect(start.ok()).toBeTruthy();
    const { attemptId, items } = await start.json();
    expect(items.length).toBeGreaterThan(0);

    console.log(`📝 Started final exam with ${items.length} questions`);

    // Fail scenario (~50% correct)
    let answers = items.map((it: any, idx: number) => ({
      item_no: it.item_no,
      answer: idx % 2 === 0 ? it.correct : it.choices[0] === it.correct ? it.choices[1] : it.choices[0],
    }));
    
    const failRes = await request.post('/api/exam/complete', { 
      data: { 
        attemptId, 
        answers 
      }
    });
    expect(failRes.ok()).toBeTruthy();
    const failJson = await failRes.json();
    expect(failJson.passed).toBeFalsy();
    
    console.log(`❌ Failed exam with score: ${failJson.score}/${failJson.total} (${(failJson.score/failJson.total*100).toFixed(1)}%)`);

    // Start again and pass
    const start2 = await request.post('/api/exam/start', { 
      data: { 
        j_code: 'CA', 
        course_code: 'DE-ONLINE', 
        mode: 'final' 
      }
    });
    expect(start2.ok()).toBeTruthy();
    const { attemptId: passAttempt, items: items2 } = await start2.json();
    
    // Answer all correctly to pass
    answers = items2.map((it: any) => ({ 
      item_no: it.item_no, 
      answer: it.correct 
    }));
    
    const passRes = await request.post('/api/exam/complete', { 
      data: { 
        attemptId: passAttempt, 
        answers 
      }
    });
    expect(passRes.ok()).toBeTruthy();
    const passJson = await passRes.json();
    expect(passJson.passed).toBeTruthy();
    
    console.log(`✅ Passed exam with score: ${passJson.score}/${passJson.total} (${(passJson.score/passJson.total*100).toFixed(1)}%)`);

    // Verify certificate eligibility
    const certResponse = await request.get(`/api/certificates/status?user_id=${student.id}&j_code=CA&course_code=DE-ONLINE`);
    expect(certResponse.ok()).toBeTruthy();
    const certStatus = await certResponse.json();
    
    // Should be eligible for certificate after passing final exam
    expect(certStatus.eligible).toBeTruthy();
    expect(certStatus.status).toBe('ready');
    
    console.log(`🎓 Certificate status: ${certStatus.status} (eligible: ${certStatus.eligible})`);
  });

  test('exam blueprint validation', async ({ request }) => {
    const tk = new TestkitAPI(process.env.BASE_URL!, process.env.TESTKIT_TOKEN!);
    
    // Ensure blueprint exists
    const blueprintResult = await tk.ensureExamBlueprint('CA', 'DE-ONLINE');
    expect(blueprintResult.success).toBeTruthy();
    
    // Verify blueprint has rules
    const admin = await tk.createUser({ admin: true, locale: 'en' });
    
    // Get course ID
    const courseResponse = await request.get('/api/admin/courses?j_code=CA');
    expect(courseResponse.ok()).toBeTruthy();
    const courses = await courseResponse.json();
    const course = courses.courses.find((c: any) => c.code === 'DE-ONLINE');
    expect(course).toBeTruthy();
    
    // Get blueprint rules
    const rulesResponse = await request.get(`/api/admin/blueprints?course_id=${course.id}`);
    expect(rulesResponse.ok()).toBeTruthy();
    const blueprints = await rulesResponse.json();
    
    const activeBlueprint = blueprints.blueprints.find((bp: any) => bp.is_active);
    expect(activeBlueprint).toBeTruthy();
    expect(activeBlueprint.exam_blueprint_rules.length).toBeGreaterThan(0);
    
    console.log(`📋 Active blueprint has ${activeBlueprint.exam_blueprint_rules.length} rules`);
    
    // Verify rule structure
    for (const rule of activeBlueprint.exam_blueprint_rules) {
      expect(rule.skill).toBeTruthy();
      expect(rule.count).toBeGreaterThan(0);
      expect(rule.min_difficulty).toBeGreaterThanOrEqual(1);
      expect(rule.max_difficulty).toBeLessThanOrEqual(5);
    }
  });
});
