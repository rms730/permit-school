/** @type {import('lighthouse-ci').LHCI.ServerCommand.Options & import('lighthouse-ci').LHCI.CollectCommand.Options} */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'npm run start:ci',
      startServerReadyPattern: 'started server',
      numberOfRuns: 1,
      url: ['http://localhost:4040/'],
      settings: {
        chromeFlags: '--no-sandbox --headless=new'
      }
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.90 }],
        'categories:performance': ['warn', { minScore: 0.80 }],
        'categories:best-practices': ['warn', { minScore: 0.85 }],
        'categories:seo': ['warn', { minScore: 0.85 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    }
  }
};
