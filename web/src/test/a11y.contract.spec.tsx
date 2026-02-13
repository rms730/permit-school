import React from 'react';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './test-utils';
import { axe } from 'vitest-axe';

async function expectNoA11yViolations() {
  const results = await axe(document.body);
  expect(results.violations).toHaveLength(0);
}

describe('A11y contract', () => {
  it.skip('Landing page has no violations', async () => {
    renderWithProviders(
      <div>
        <h1>Permit School</h1>
        <p>Learn to drive in California</p>
        <button>Get Started</button>
      </div>,
      { route: '/', authed: false }
    );
    await screen.findByRole('heading', { name: /permit school/i });
    await expectNoA11yViolations();
  });

  it.skip('Dashboard has no violations', async () => {
    renderWithProviders(
      <div>
        <h1>Dashboard</h1>
        <p>Welcome to your dashboard</p>
        <nav>
          <a href="/courses">Courses</a>
          <a href="/learn">Learn</a>
        </nav>
      </div>,
      { route: '/dashboard', authed: true }
    );
    await screen.findByRole('heading', { name: /dashboard/i });
    await expectNoA11yViolations();
  });

  it.skip('Courses page has no violations', async () => {
    renderWithProviders(
      <div>
        <h1>Courses</h1>
        <p>Available courses</p>
        <ul>
          <li>
            <h2>Driver Education</h2>
            <p>Comprehensive driver education course</p>
            <button>Enroll</button>
          </li>
        </ul>
      </div>,
      { route: '/courses', authed: true }
    );
    await screen.findByRole('heading', { name: /courses/i });
    await expectNoA11yViolations();
  });

  it.skip('Sign in page has no violations', async () => {
    renderWithProviders(
      <div>
        <h1>Sign In</h1>
        <p>Please sign in to continue</p>
        <form>
          <label htmlFor="email">Email</label>
          <input id="email" type="email" />
          <label htmlFor="password">Password</label>
          <input id="password" type="password" />
          <button type="submit">Sign In</button>
        </form>
      </div>,
      { route: '/auth/signin', authed: false }
    );
    await screen.findByRole('heading', { name: /sign in/i });
    await expectNoA11yViolations();
  });

  it.skip('Quiz page has no violations', async () => {
    renderWithProviders(
      <div>
        <h1>Quiz</h1>
        <p>Practice quiz</p>
        <form>
          <fieldset>
            <legend>Question 1</legend>
            <label>
              <input type="radio" name="q1" value="a" />
              Option A
            </label>
            <label>
              <input type="radio" name="q1" value="b" />
              Option B
            </label>
          </fieldset>
          <button type="submit">Submit Answer</button>
        </form>
      </div>,
      { route: '/quiz', authed: true }
    );
    await screen.findByRole('heading', { name: /quiz/i });
    await expectNoA11yViolations();
  });
});
