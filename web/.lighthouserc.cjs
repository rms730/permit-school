/** @type {import('lighthouse-ci').LHCI.ServerCommand.Options & import('lighthouse-ci').LHCI.CollectCommand.Options} */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'PORT=${PORT:-4310} npm run start:ci',
      startServerReadyPattern: 'Ready on',
      numberOfRuns: 2,
      url: ['http://localhost:4310/'],
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
