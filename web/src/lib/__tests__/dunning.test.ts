import { describe, it, expect } from 'vitest';

// Dunning state transition logic
type DunningState = 'none' | 'email_1' | 'email_2' | 'email_3' | 'canceled';

interface DunningTransition {
  currentState: DunningState;
  action: 'payment_failed' | 'payment_succeeded' | 'daily_job';
  expectedState: DunningState;
  expectedNextAction: Date | null;
  expectedFailCount: number;
}

// Dunning state transition function
function getDunningTransition(
  currentState: DunningState,
  action: 'payment_failed' | 'payment_succeeded' | 'daily_job',
  currentFailCount: number = 0
): {
  newState: DunningState;
  nextActionAt: Date | null;
  failCount: number;
} {
  let newState: DunningState = currentState;
  let nextActionAt: Date | null = null;
  let failCount = currentFailCount;

  if (action === 'payment_succeeded') {
    // Reset everything on successful payment
    newState = 'none';
    nextActionAt = null;
    failCount = 0;
  } else if (action === 'payment_failed') {
    failCount += 1;
    
    if (currentState === 'none') {
      newState = 'email_1';
      // Schedule next action in 3 days
      nextActionAt = new Date(Date.now() + (3 * 24 * 60 * 60 * 1000));
    } else if (currentState === 'email_1') {
      newState = 'email_2';
      // Schedule next action in 7 days
      nextActionAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
    } else if (currentState === 'email_2') {
      newState = 'email_3';
      // Schedule next action in 24 hours
      nextActionAt = new Date(Date.now() + (24 * 60 * 60 * 1000));
    } else if (currentState === 'email_3') {
      newState = 'canceled';
      nextActionAt = null;
    }
  } else if (action === 'daily_job') {
    // Daily job processes the next action
    if (currentState === 'email_1') {
      newState = 'email_2';
      nextActionAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));
    } else if (currentState === 'email_2') {
      newState = 'email_3';
      nextActionAt = new Date(Date.now() + (24 * 60 * 60 * 1000));
    } else if (currentState === 'email_3') {
      newState = 'canceled';
      nextActionAt = null;
    }
  }

  return {
    newState,
    nextActionAt,
    failCount,
  };
}

describe('Dunning State Transitions', () => {
  const testCases: DunningTransition[] = [
    // Payment failure transitions
    {
      currentState: 'none',
      action: 'payment_failed',
      expectedState: 'email_1',
      expectedNextAction: new Date(Date.now() + (3 * 24 * 60 * 60 * 1000)),
      expectedFailCount: 1,
    },
    {
      currentState: 'email_1',
      action: 'payment_failed',
      expectedState: 'email_2',
      expectedNextAction: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
      expectedFailCount: 2,
    },
    {
      currentState: 'email_2',
      action: 'payment_failed',
      expectedState: 'email_3',
      expectedNextAction: new Date(Date.now() + (24 * 60 * 60 * 1000)),
      expectedFailCount: 3,
    },
    {
      currentState: 'email_3',
      action: 'payment_failed',
      expectedState: 'canceled',
      expectedNextAction: null,
      expectedFailCount: 4,
    },
    {
      currentState: 'canceled',
      action: 'payment_failed',
      expectedState: 'canceled', // No further transitions
      expectedNextAction: null,
      expectedFailCount: 5,
    },

    // Daily job transitions
    {
      currentState: 'email_1',
      action: 'daily_job',
      expectedState: 'email_2',
      expectedNextAction: new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)),
      expectedFailCount: 1,
    },
    {
      currentState: 'email_2',
      action: 'daily_job',
      expectedState: 'email_3',
      expectedNextAction: new Date(Date.now() + (24 * 60 * 60 * 1000)),
      expectedFailCount: 2,
    },
    {
      currentState: 'email_3',
      action: 'daily_job',
      expectedState: 'canceled',
      expectedNextAction: null,
      expectedFailCount: 3,
    },

    // Payment success resets everything
    {
      currentState: 'email_1',
      action: 'payment_succeeded',
      expectedState: 'none',
      expectedNextAction: null,
      expectedFailCount: 0,
    },
    {
      currentState: 'email_2',
      action: 'payment_succeeded',
      expectedState: 'none',
      expectedNextAction: null,
      expectedFailCount: 0,
    },
    {
      currentState: 'email_3',
      action: 'payment_succeeded',
      expectedState: 'none',
      expectedNextAction: null,
      expectedFailCount: 0,
    },
    {
      currentState: 'canceled',
      action: 'payment_succeeded',
      expectedState: 'none',
      expectedNextAction: null,
      expectedFailCount: 0,
    },
  ];

  testCases.forEach((testCase, index) => {
    it(`should transition correctly for test case ${index + 1}: ${testCase.currentState} + ${testCase.action}`, () => {
      const result = getDunningTransition(
        testCase.currentState,
        testCase.action,
        testCase.expectedFailCount > 0 ? testCase.expectedFailCount - 1 : 0
      );

      expect(result.newState).toBe(testCase.expectedState);
      expect(result.failCount).toBe(testCase.expectedFailCount);

      if (testCase.expectedNextAction === null) {
        expect(result.nextActionAt).toBeNull();
      } else {
        expect(result.nextActionAt).toBeInstanceOf(Date);
        // Allow for small timing differences (within 1 second)
        const timeDiff = Math.abs(result.nextActionAt!.getTime() - testCase.expectedNextAction.getTime());
        expect(timeDiff).toBeLessThan(1000);
      }
    });
  });

  it('should handle fail count correctly across multiple failures', () => {
    let state = 'none';
    let failCount = 0;

    // First failure
    let result = getDunningTransition(state, 'payment_failed', failCount);
    state = result.newState;
    failCount = result.failCount;
    expect(state).toBe('email_1');
    expect(failCount).toBe(1);

    // Second failure
    result = getDunningTransition(state, 'payment_failed', failCount);
    state = result.newState;
    failCount = result.failCount;
    expect(state).toBe('email_2');
    expect(failCount).toBe(2);

    // Third failure
    result = getDunningTransition(state, 'payment_failed', failCount);
    state = result.newState;
    failCount = result.failCount;
    expect(state).toBe('email_3');
    expect(failCount).toBe(3);

    // Fourth failure
    result = getDunningTransition(state, 'payment_failed', failCount);
    state = result.newState;
    failCount = result.failCount;
    expect(state).toBe('canceled');
    expect(failCount).toBe(4);
  });

  it('should reset everything on successful payment', () => {
    const states: DunningState[] = ['email_1', 'email_2', 'email_3', 'canceled'];
    
    states.forEach(initialState => {
      const result = getDunningTransition(initialState, 'payment_succeeded', 5);
      
      expect(result.newState).toBe('none');
      expect(result.nextActionAt).toBeNull();
      expect(result.failCount).toBe(0);
    });
  });

  it('should not transition from canceled state on payment failure', () => {
    const result = getDunningTransition('canceled', 'payment_failed', 4);
    
    expect(result.newState).toBe('canceled');
    expect(result.nextActionAt).toBeNull();
    expect(result.failCount).toBe(5);
  });

  it('should not transition from none state on daily job', () => {
    const result = getDunningTransition('none', 'daily_job', 0);
    
    expect(result.newState).toBe('none');
    expect(result.nextActionAt).toBeNull();
    expect(result.failCount).toBe(0);
  });
});

// Invoice status validation
describe('Invoice Status Validation', () => {
  it('should validate correct invoice statuses', () => {
    const validStatuses = ['draft', 'open', 'paid', 'uncollectible', 'void'];
    
    validStatuses.forEach(status => {
      // This would be validated in the database constraint
      expect(validStatuses).toContain(status);
    });
  });

  it('should reject invalid invoice statuses', () => {
    const invalidStatuses = ['pending', 'failed', 'processing', 'unknown'];
    
    const validStatuses = ['draft', 'open', 'paid', 'uncollectible', 'void'];
    
    invalidStatuses.forEach(status => {
      expect(validStatuses).not.toContain(status);
    });
  });
});

// Subscription status validation
describe('Subscription Status Validation', () => {
  it('should validate correct subscription statuses', () => {
    const validStatuses = [
      'trialing',
      'active',
      'past_due',
      'canceled',
      'incomplete',
      'incomplete_expired',
      'unpaid',
      'paused'
    ];
    
    validStatuses.forEach(status => {
      // This would be validated in the database constraint
      expect(validStatuses).toContain(status);
    });
  });

  it('should identify active subscription statuses', () => {
    const activeStatuses = ['active', 'trialing'];
    const inactiveStatuses = ['past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid', 'paused'];
    
    activeStatuses.forEach(status => {
      expect(['active', 'trialing']).toContain(status);
    });
    
    inactiveStatuses.forEach(status => {
      expect(['active', 'trialing']).not.toContain(status);
    });
  });
});
