---
title: "Performance"
owner: "Engineering"
last_reviewed: "2025-01-27"
status: "authoritative"
related:
  - </docs/testing/STRATEGY.md>
  - </docs/ACCESSIBILITY.md>
---

# Performance

**Purpose & Outcome**  
This document outlines our performance strategy, monitoring approach, and optimization techniques to ensure fast, responsive user experiences across all devices and network conditions.

## Performance Standards

### Core Web Vitals Targets

We target **Core Web Vitals** metrics for optimal user experience:

| Metric                             | Target  | Description           |
| ---------------------------------- | ------- | --------------------- |
| **LCP** (Largest Contentful Paint) | < 2.5s  | Loading performance   |
| **FID** (First Input Delay)        | < 100ms | Interactivity         |
| **CLS** (Cumulative Layout Shift)  | < 0.1   | Visual stability      |
| **TTFB** (Time to First Byte)      | < 600ms | Server response time  |
| **FCP** (First Contentful Paint)   | < 1.8s  | First content display |

### Performance Budgets

| Resource Type         | Budget            | Rationale                         |
| --------------------- | ----------------- | --------------------------------- |
| **Total Bundle Size** | < 2MB             | Fast loading on slow connections  |
| **Main Bundle**       | < 500KB           | Critical path optimization        |
| **Vendor Bundle**     | < 1MB             | Third-party dependency management |
| **Images**            | < 200KB per image | Visual content optimization       |
| **API Response Time** | < 500ms           | Backend performance               |

## Monitoring Strategy

### Lighthouse CI

#### Configuration

```javascript
// .lighthouserc.js
module.exports = {
  ci: {
    collect: {
      url: [
        "http://localhost:3000",
        "http://localhost:3000/courses",
        "http://localhost:3000/dashboard",
        "http://localhost:3000/signin",
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: "--no-sandbox --disable-dev-shm-usage",
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["warn", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["warn", { minScore: 0.95 }],
        "categories:seo": ["warn", { minScore: 0.9 }],
        "first-contentful-paint": ["warn", { maxNumericValue: 1800 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 2500 }],
        "first-input-delay": ["warn", { maxNumericValue: 100 }],
        "cumulative-layout-shift": ["warn", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["warn", { maxNumericValue: 300 }],
        "speed-index": ["warn", { maxNumericValue: 3000 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
```

#### GitHub Actions Integration

```yaml
# .github/workflows/ci.yml
- name: Run Lighthouse CI
  run: npm --prefix web run lhci
  env:
    LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

### Real User Monitoring (RUM)

#### Sentry Performance Monitoring

```typescript
// web/src/lib/sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Performance monitoring
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ["localhost", "your-domain.com"],
    }),
    new Sentry.Replay(),
  ],
});
```

#### Custom Performance Metrics

```typescript
// web/src/lib/performance.ts
export const trackPerformance = {
  // Track page load performance
  trackPageLoad: (pageName: string) => {
    if (typeof window !== "undefined") {
      const navigation = performance.getEntriesByType(
        "navigation",
      )[0] as PerformanceNavigationTiming;

      const metrics = {
        page: pageName,
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        tcp: navigation.connectEnd - navigation.connectStart,
        ttfb: navigation.responseStart - navigation.requestStart,
        domContentLoaded:
          navigation.domContentLoadedEventEnd - navigation.navigationStart,
        loadComplete: navigation.loadEventEnd - navigation.navigationStart,
      };

      // Send to analytics
      console.log("Performance metrics:", metrics);
    }
  },

  // Track API response times
  trackAPI: (endpoint: string, duration: number) => {
    console.log(`API ${endpoint}: ${duration}ms`);
  },

  // Track user interactions
  trackInteraction: (action: string, duration: number) => {
    console.log(`Interaction ${action}: ${duration}ms`);
  },
};
```

## Optimization Strategies

### Frontend Optimization

#### Code Splitting

```typescript
// Dynamic imports for code splitting
const Dashboard = dynamic(() => import('../components/Dashboard'), {
  loading: () => <DashboardSkeleton />,
  ssr: false
});

const AdminPanel = dynamic(() => import('../components/AdminPanel'), {
  loading: () => <AdminSkeleton />,
  ssr: false
});

// Route-based code splitting
const CoursePage = dynamic(() => import('../app/course/[id]/page'), {
  loading: () => <CourseSkeleton />
});
```

#### Image Optimization

```tsx
// Next.js Image component with optimization
import Image from "next/image";

const OptimizedImage = ({ src, alt, width, height }) => (
  <Image
    src={src}
    alt={alt}
    width={width}
    height={height}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
    priority={false}
  />
);
```

#### Bundle Analysis

```bash
# Analyze bundle size
npm --prefix web run build
npx @next/bundle-analyzer

# Check for duplicate dependencies
npm ls --depth=0
```

### Backend Optimization

#### Database Query Optimization

```sql
-- Optimize frequently used queries
CREATE INDEX idx_enrollments_user_course ON enrollments(user_id, course_id);
CREATE INDEX idx_progress_user_unit ON progress(user_id, unit_id);
CREATE INDEX idx_attempts_user_created ON attempts(user_id, created_at);

-- Use materialized views for complex aggregations
CREATE MATERIALIZED VIEW user_progress_summary AS
SELECT
  user_id,
  course_id,
  SUM(minutes) as total_minutes,
  COUNT(DISTINCT unit_id) as units_completed
FROM progress
GROUP BY user_id, course_id;

-- Refresh materialized view periodically
REFRESH MATERIALIZED VIEW user_progress_summary;
```

#### API Response Caching

```typescript
// API route with caching
export async function GET() {
  const supabase = await getRouteClient();

  // Cache public catalog for 5 minutes
  const { data: catalog, error } = await supabase
    .from("v_course_catalog")
    .select("*")
    .order("j_code", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Failed to load catalog" },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { catalog },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
```

#### Connection Pooling

```typescript
// Optimize database connections
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    db: {
      schema: "public",
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  },
);
```

### Caching Strategies

#### Static Generation

```typescript
// Next.js static generation
export async function generateStaticParams() {
  const courses = await getCourses();

  return courses.map((course) => ({
    j_code: course.j_code,
    course_code: course.course_code,
  }));
}

// Incremental Static Regeneration
export const revalidate = 3600; // Revalidate every hour
```

#### Service Worker Caching

```typescript
// web/public/sw.js
const CACHE_NAME = "permit-school-v1";
const urlsToCache = [
  "/",
  "/courses",
  "/static/js/main.bundle.js",
  "/static/css/main.css",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    }),
  );
});
```

## Performance Testing

### Load Testing

#### API Load Testing

```typescript
// tests/performance/api-load.test.ts
import { test, expect } from "@playwright/test";

test("API endpoints handle load", async ({ request }) => {
  const startTime = Date.now();

  // Simulate concurrent requests
  const promises = Array.from({ length: 10 }, () => request.get("/api/health"));

  const responses = await Promise.all(promises);
  const endTime = Date.now();

  // All requests should succeed
  responses.forEach((response) => {
    expect(response.status()).toBe(200);
  });

  // Total time should be reasonable
  expect(endTime - startTime).toBeLessThan(5000);
});
```

#### Frontend Performance Testing

```typescript
// tests/performance/frontend-performance.test.ts
import { test, expect } from "@playwright/test";

test("page load performance", async ({ page }) => {
  const startTime = Date.now();

  await page.goto("/");

  // Wait for page to be fully loaded
  await page.waitForLoadState("networkidle");

  const endTime = Date.now();
  const loadTime = endTime - startTime;

  // Page should load within 3 seconds
  expect(loadTime).toBeLessThan(3000);

  // Check Core Web Vitals
  const lcp = await page.evaluate(() => {
    return new Promise((resolve) => {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      }).observe({ entryTypes: ["largest-contentful-paint"] });
    });
  });

  expect(lcp).toBeLessThan(2500);
});
```

### Bundle Size Monitoring

#### Webpack Bundle Analyzer

```bash
# Analyze bundle size
npm --prefix web run build
npx @next/bundle-analyzer

# Check for large dependencies
npm ls --depth=0 | grep -E "([0-9]+\.){3}[0-9]+" | sort -k2 -nr
```

#### Bundle Size Thresholds

```javascript
// webpack.config.js
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      openAnalyzer: false,
      generateStatsFile: true,
      statsFilename: "bundle-stats.json",
    }),
  ],

  optimization: {
    splitChunks: {
      chunks: "all",
      maxSize: 500000, // 500KB
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
        },
      },
    },
  },
};
```

## Performance Monitoring

### Real-Time Monitoring

#### Performance Dashboard

```typescript
// Admin performance dashboard
const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState({
    lcp: 0,
    fid: 0,
    cls: 0,
    ttfb: 0,
    errorRate: 0
  });

  useEffect(() => {
    // Fetch real-time performance metrics
    const fetchMetrics = async () => {
      const response = await fetch('/api/admin/performance/metrics');
      const data = await response.json();
      setMetrics(data);
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="performance-dashboard">
      <h2>Performance Metrics</h2>
      <div className="metrics-grid">
        <MetricCard title="LCP" value={`${metrics.lcp}ms`} target="< 2.5s" />
        <MetricCard title="FID" value={`${metrics.fid}ms`} target="< 100ms" />
        <MetricCard title="CLS" value={metrics.cls} target="< 0.1" />
        <MetricCard title="TTFB" value={`${metrics.ttfb}ms`} target="< 600ms" />
      </div>
    </div>
  );
};
```

#### Alerting

```typescript
// Performance alerting
const checkPerformance = async () => {
  const metrics = await getPerformanceMetrics();

  // Alert if metrics exceed thresholds
  if (metrics.lcp > 2500) {
    sendAlert("High LCP detected", {
      metric: "LCP",
      value: metrics.lcp,
      threshold: 2500,
      page: metrics.page,
    });
  }

  if (metrics.errorRate > 0.05) {
    sendAlert("High error rate detected", {
      metric: "Error Rate",
      value: metrics.errorRate,
      threshold: 0.05,
    });
  }
};
```

### Performance Budgets

#### Bundle Size Budgets

```json
// .size-limit.json
[
  {
    "path": "web/.next/static/chunks/pages/**/*.js",
    "limit": "500 KB"
  },
  {
    "path": "web/.next/static/chunks/**/*.js",
    "limit": "1 MB"
  },
  {
    "path": "web/.next/static/**/*.css",
    "limit": "200 KB"
  }
]
```

#### Performance Budgets

```javascript
// performance-budgets.js
module.exports = {
  budgets: [
    {
      resourceType: "script",
      budget: "500 KB",
    },
    {
      resourceType: "total",
      budget: "2 MB",
    },
    {
      resourceType: "image",
      budget: "200 KB",
    },
  ],

  thresholds: {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    ttfb: 600,
    fcp: 1800,
  },
};
```

## Optimization Checklist

### Frontend Optimization

- [ ] **Code Splitting**: Implement route-based and component-based code splitting
- [ ] **Image Optimization**: Use Next.js Image component with proper sizing
- [ ] **Bundle Analysis**: Regular bundle size monitoring and optimization
- [ ] **Caching**: Implement service worker and browser caching
- [ ] **Lazy Loading**: Lazy load non-critical components and images

### Backend Optimization

- [ ] **Database Indexing**: Optimize database queries with proper indexes
- [ ] **Connection Pooling**: Implement efficient database connection management
- [ ] **Caching**: Cache frequently accessed data and API responses
- [ ] **CDN**: Use CDN for static assets and API responses
- [ ] **Compression**: Enable gzip/brotli compression

### Monitoring and Alerting

- [ ] **Real User Monitoring**: Implement RUM for performance tracking
- [ ] **Performance Budgets**: Set and monitor performance budgets
- [ ] **Alerting**: Configure alerts for performance degradation
- [ ] **Dashboards**: Create performance monitoring dashboards
- [ ] **Regular Audits**: Conduct regular performance audits

## Performance Tools

### Development Tools

- **Lighthouse**: Performance auditing and optimization
- **WebPageTest**: Detailed performance analysis
- **Chrome DevTools**: Built-in performance profiling
- **Bundle Analyzer**: Bundle size analysis and optimization

### Monitoring Tools

- **Sentry**: Error tracking and performance monitoring
- **Google Analytics**: User behavior and performance metrics
- **New Relic**: Application performance monitoring
- **DataDog**: Infrastructure and application monitoring

### Testing Tools

- **Playwright**: Performance testing and monitoring
- **Artillery**: Load testing and performance validation
- **k6**: Modern load testing tool
- **JMeter**: Traditional load testing

## Best Practices

### Code Optimization

1. **Minimize Bundle Size**: Remove unused dependencies and code
2. **Optimize Images**: Use appropriate formats and sizes
3. **Implement Caching**: Cache static assets and API responses
4. **Use CDN**: Distribute content globally for faster access
5. **Optimize Fonts**: Use font-display and preload critical fonts

### Database Optimization

1. **Index Optimization**: Create indexes for frequently queried columns
2. **Query Optimization**: Optimize slow queries and use pagination
3. **Connection Pooling**: Manage database connections efficiently
4. **Caching**: Cache frequently accessed data
5. **Monitoring**: Monitor database performance and slow queries

### Infrastructure Optimization

1. **CDN**: Use CDN for global content distribution
2. **Compression**: Enable gzip/brotli compression
3. **HTTP/2**: Use HTTP/2 for multiplexed connections
4. **Caching Headers**: Set appropriate cache headers
5. **Load Balancing**: Distribute load across multiple servers

---

**Next**: [Troubleshooting](TROUBLESHOOTING.md) - Common issues and solutions
