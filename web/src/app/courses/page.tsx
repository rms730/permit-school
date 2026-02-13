import {
  ArrowForward,
  AutoStories,
  LocalOffer,
  Shield,
  WorkspacePremium,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import Link from 'next/link';
import Script from 'next/script';

import AppShell from '@/components/layout/AppShell';
import { getServerClient } from '@/lib/supabaseServer';

type CatalogCourse = {
  course_code: string;
  course_id: string;
  course_title: string;
  has_price: boolean;
  j_code: string;
};

function buildCourseSchema(courses: CatalogCourse[]) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://permit-school.com';

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    description: 'Comprehensive driver education courses for permit preparation',
    itemListElement: courses.map((course, index) => ({
      '@type': 'Course',
      courseCode: course.course_code,
      description: `Driver education course for ${course.j_code}`,
      educationalCredentialAwarded: 'Driver Education Certificate',
      educationalLevel: 'Beginner',
      inLanguage: 'en-US',
      name: course.course_title,
      position: index + 1,
      provider: {
        '@type': 'Organization',
        name: 'Permit School',
        url: siteUrl,
      },
      url: `${siteUrl}/course/${course.j_code}/${course.course_code}`,
    })),
    name: 'Driver Education Courses',
    numberOfItems: courses.length,
    url: `${siteUrl}/courses`,
  };
}

export default async function CoursesPage() {
  const supabase = await getServerClient();

  const { data: catalog, error: catalogError } = await supabase
    .from('v_course_catalog')
    .select('*')
    .order('j_code', { ascending: true });

  const courses = (catalog ?? []) as CatalogCourse[];

  if (catalogError) {
    return (
      <AppShell>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">Failed to load courses.</Alert>
        </Container>
      </AppShell>
    );
  }

  const availableCount = courses.filter(course => course.has_price).length;
  const comingSoonCount = courses.length - availableCount;
  const jurisdictions = Object.entries(
    courses.reduce<Record<string, number>>((acc, course) => {
      acc[course.j_code] = (acc[course.j_code] ?? 0) + 1;
      return acc;
    }, {})
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const courseSchema = buildCourseSchema(courses);

  return (
    <AppShell>
      <Script
        id="course-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Card
          sx={{
            mb: 3,
            background:
              'linear-gradient(150deg, rgba(12,46,79,0.95) 0%, rgba(15,110,207,0.88) 58%, rgba(23,134,111,0.9) 100%)',
            color: 'common.white',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Grid container spacing={2.5} alignItems="center">
              <Grid xs={12} md={8}>
                <Stack spacing={1.6}>
                  <Typography variant="h3" sx={{ color: 'common.white' }}>
                    Course Catalog
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', maxWidth: 760 }}>
                    Choose your jurisdiction-ready path, continue active enrollments, and move toward final exam
                    eligibility.
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} useFlexGap flexWrap="wrap">
                    <Chip
                      icon={<AutoStories />}
                      label={`${courses.length} total courses`}
                      sx={{
                        width: 'fit-content',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'common.white',
                      }}
                    />
                    <Chip
                      icon={<WorkspacePremium />}
                      label={`${availableCount} purchasable now`}
                      sx={{
                        width: 'fit-content',
                        backgroundColor: 'rgba(197,245,228,0.28)',
                        color: 'common.white',
                      }}
                    />
                    <Chip
                      icon={<LocalOffer />}
                      label={`${comingSoonCount} coming soon`}
                      sx={{
                        width: 'fit-content',
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        color: 'common.white',
                      }}
                    />
                  </Stack>
                </Stack>
              </Grid>

              <Grid xs={12} md={4}>
                <Card
                  sx={{
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(11,35,64,0.25)',
                    boxShadow: 'none',
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.82)' }}>
                        Top jurisdictions
                      </Typography>
                      {jurisdictions.length === 0 ? (
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                          No jurisdictions available yet.
                        </Typography>
                      ) : (
                        jurisdictions.map(([jCode, count]) => (
                          <Stack
                            key={jCode}
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                            sx={{ color: 'common.white' }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {jCode}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.86 }}>
                              {count} course{count > 1 ? 's' : ''}
                            </Typography>
                          </Stack>
                        ))
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {courses.length === 0 ? (
          <Alert severity="info">No courses available at this time.</Alert>
        ) : (
          <Grid container spacing={2.5}>
            {courses.map(course => (
              <Grid key={course.course_id} xs={12} md={6} lg={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3, height: '100%' }}>
                    <Stack spacing={2.2} sx={{ height: '100%' }}>
                      <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                        <Chip label={course.j_code} color="primary" size="small" />
                        <Chip
                          label={course.has_price ? 'Ready to enroll' : 'Coming soon'}
                          color={course.has_price ? 'success' : 'default'}
                          size="small"
                        />
                      </Stack>

                      <Box>
                        <Typography variant="h5" sx={{ mb: 0.6 }}>
                          {course.course_title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Course code:{' '}
                          <Box component="span" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                            {course.course_code}
                          </Box>
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Shield color="action" sx={{ fontSize: 18 }} />
                        <Typography variant="body2" color="text.secondary">
                          Structured unit progression with tracked seat-time and exam readiness checks.
                        </Typography>
                      </Stack>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ mt: 'auto' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          component={Link}
                          href={`/course/${course.j_code}/${course.course_code}`}
                          endIcon={<ArrowForward />}
                        >
                          View curriculum
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          component={Link}
                          href={course.has_price ? '/billing' : `/course/${course.j_code}/${course.course_code}`}
                          disabled={!course.has_price}
                        >
                          {course.has_price ? 'Enroll now' : 'Not yet available'}
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </AppShell>
  );
}
