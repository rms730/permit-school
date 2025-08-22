import { NextRequest } from 'next/server';

export async function GET(_request: NextRequest) {
  const robotsTxt = `User-agent: *
Allow: /
Allow: /courses
Allow: /privacy
Allow: /terms
Allow: /accessibility
Allow: /verify/*
Disallow: /api/
Disallow: /learn/
Disallow: /quiz/
Disallow: /exam/
Disallow: /tutor
Disallow: /billing/
Disallow: /admin/
Disallow: /profile/
Disallow: /dashboard/
Disallow: /signin
Disallow: /signout
Disallow: /enroll/
Disallow: /guardian/

Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://permit-school.com'}/sitemap.xml

# Crawl-delay: 1
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
