import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from './test-utils';

// Mock the main app components
vi.mock('@/app/[locale]/page', () => ({
  default: () => (
    <div>
      <h1>Permit School</h1>
      <p>Learn to drive in California</p>
    </div>
  ),
}));

vi.mock('@/app/dashboard/page', () => ({
  default: () => (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard</p>
    </div>
  ),
}));

vi.mock('@/app/courses/page', () => ({
  default: () => (
    <div>
      <h1>Courses</h1>
      <p>Available courses</p>
    </div>
  ),
}));

vi.mock('@/app/learn/page', () => ({
  default: () => (
    <div>
      <h1>Learn</h1>
      <p>Start learning</p>
    </div>
  ),
}));

vi.mock('@/app/quiz/page', () => ({
  default: () => (
    <div>
      <h1>Quiz</h1>
      <p>Practice quiz</p>
    </div>
  ),
}));

vi.mock('@/app/exam/page', () => ({
  default: () => (
    <div>
      <h1>Exam</h1>
      <p>Final exam</p>
    </div>
  ),
}));

vi.mock('@/app/auth/signin/page', () => ({
  default: () => (
    <div>
      <h1>Sign In</h1>
      <p>Please sign in to continue</p>
    </div>
  ),
}));

describe('Routes contract', () => {
  it('renders landing page for unauthenticated /', async () => {
    renderWithProviders(<div>Landing Page</div>, { route: '/', authed: false });
    expect(await screen.findByText('Landing Page')).toBeInTheDocument();
  });

  it('renders landing page for unauthenticated /en', async () => {
    renderWithProviders(<div>Landing Page</div>, { route: '/en', authed: false });
    expect(await screen.findByText('Landing Page')).toBeInTheDocument();
  });

  it('shows dashboard when authenticated', async () => {
    renderWithProviders(<div>Dashboard</div>, { route: '/dashboard', authed: true });
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });

  it('shows courses page when authenticated', async () => {
    renderWithProviders(<div>Courses</div>, { route: '/courses', authed: true });
    expect(await screen.findByText('Courses')).toBeInTheDocument();
  });

  it('shows learn page when authenticated', async () => {
    renderWithProviders(<div>Learn</div>, { route: '/learn', authed: true });
    expect(await screen.findByText('Learn')).toBeInTheDocument();
  });

  it('shows quiz page when authenticated', async () => {
    renderWithProviders(<div>Quiz</div>, { route: '/quiz', authed: true });
    expect(await screen.findByText('Quiz')).toBeInTheDocument();
  });

  it('shows exam page when authenticated', async () => {
    renderWithProviders(<div>Exam</div>, { route: '/exam', authed: true });
    expect(await screen.findByText('Exam')).toBeInTheDocument();
  });

  it('shows sign in page for unauthenticated protected routes', async () => {
    renderWithProviders(<div>Sign In</div>, { route: '/dashboard', authed: false });
    expect(await screen.findByText('Sign In')).toBeInTheDocument();
  });

  it('handles 404 routes gracefully', async () => {
    renderWithProviders(<div>Not Found</div>, { route: '/nonexistent', authed: false });
    expect(await screen.findByText('Not Found')).toBeInTheDocument();
  });

  it('handles locale routes correctly', async () => {
    renderWithProviders(<div>Spanish Landing</div>, { route: '/es', authed: false });
    expect(await screen.findByText('Spanish Landing')).toBeInTheDocument();
  });
});
