/** @type {import('lighthouse-ci').LHCI.ServerCommand.Options & import('lighthouse-ci').LHCI.CollectCommand.Options} */
module.exports = {
  ci: {
    collect: {
      startServerCommand: 'node -e "process.exit(0)"', // Server started by workflow
      numberOfRuns: 2,
      url: ['http://localhost:4330/en'],
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --headless=new',
        onlyCategories: ['accessibility', 'performance', 'best-practices', 'seo'],
        formFactor: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        }
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
