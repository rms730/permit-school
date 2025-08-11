import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  
  // Only run setup if TESTKIT_ON is enabled
  if (process.env.TESTKIT_ON !== 'true') {
    console.log('TESTKIT_ON not enabled, skipping global setup');
    return;
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log('Running global setup...');

    // Reset test data
    const resetResponse = await page.request.post(`${baseURL}/api/testkit/reset`, {
      headers: {
        'Authorization': `Bearer ${process.env.TESTKIT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!resetResponse.ok()) {
      console.error('Failed to reset test data:', await resetResponse.text());
      throw new Error('Test data reset failed');
    }

    console.log('Test data reset successfully');

    // Create test admin user
    const adminResponse = await page.request.post(`${baseURL}/api/testkit/user`, {
      headers: {
        'Authorization': `Bearer ${process.env.TESTKIT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        admin: true,
        locale: 'en'
      }
    });

    if (!adminResponse.ok()) {
      console.error('Failed to create admin user:', await adminResponse.text());
      throw new Error('Admin user creation failed');
    }

    const adminData = await adminResponse.json();
    process.env.TEST_ADMIN_USER = JSON.stringify(adminData.user);
    console.log('Admin user created successfully');

    // Create test student user
    const studentResponse = await page.request.post(`${baseURL}/api/testkit/user`, {
      headers: {
        'Authorization': `Bearer ${process.env.TESTKIT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        admin: false,
        locale: 'en'
      }
    });

    if (!studentResponse.ok()) {
      console.error('Failed to create student user:', await studentResponse.text());
      throw new Error('Student user creation failed');
    }

    const studentData = await studentResponse.json();
    process.env.TEST_STUDENT_USER = JSON.stringify(studentData.user);
    console.log('Student user created successfully');

    // Create test minor user
    const minorResponse = await page.request.post(`${baseURL}/api/testkit/user`, {
      headers: {
        'Authorization': `Bearer ${process.env.TESTKIT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        minor: true,
        admin: false,
        locale: 'en'
      }
    });

    if (!minorResponse.ok()) {
      console.error('Failed to create minor user:', await minorResponse.text());
      throw new Error('Minor user creation failed');
    }

    const minorData = await minorResponse.json();
    process.env.TEST_MINOR_USER = JSON.stringify(minorData.user);
    console.log('Minor user created successfully');

    // Ensure exam blueprint exists
    const blueprintResponse = await page.request.post(`${baseURL}/api/testkit/exam/blueprint`, {
      headers: {
        'Authorization': `Bearer ${process.env.TESTKIT_TOKEN}`,
        'Content-Type': 'application/json'
      },
      data: {
        j_code: 'CA',
        course_code: 'DE-ONLINE',
        num_questions: 5 // Small number for faster tests
      }
    });

    if (!blueprintResponse.ok()) {
      console.error('Failed to create exam blueprint:', await blueprintResponse.text());
      throw new Error('Exam blueprint creation failed');
    }

    console.log('Exam blueprint created successfully');

  } catch (error) {
    console.error('Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
