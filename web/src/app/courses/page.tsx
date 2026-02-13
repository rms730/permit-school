import {
  Container,
  Typography,
  Stack,
  Chip,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
} from "@mui/material";
import Grid from '@mui/material/Grid';
import Link from "next/link";
import Script from "next/script";

import AppShell from "@/components/layout/AppShell";
import { getServerClient } from "@/lib/supabaseServer";

type CatalogCourse = {
  course_id: string;
  j_code: string;
  course_code: string;
  course_title: string;
  has_price: boolean;
};

export default async function CoursesPage() {
  const supabase = await getServerClient();

  const { data: catalog, error: catalogError } = await supabase
    .from("v_course_catalog")
    .select("*")
    .order("j_code", { ascending: true });

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

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Driver Education Courses",
    description: "Comprehensive driver education courses for California permit preparation",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://permit-school.com'}/courses`,
    numberOfItems: courses.length,
    itemListElement: courses.map((course, index) => ({
      "@type": "Course",
      position: index + 1,
      name: course.course_title,
      description: `Driver education course for ${course.j_code}`,
      provider: {
        "@type": "Organization",
        name: "Permit School",
        url: process.env.NEXT_PUBLIC_SITE_URL || 'https://permit-school.com',
      },
      educationalLevel: "Beginner",
      inLanguage: "en-US",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://permit-school.com'}/course/${course.j_code}/${course.course_code}`,
      courseCode: course.course_code,
      educationalCredentialAwarded: "Driver Education Certificate",
    })),
  };

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
            <Stack spacing={1.6}>
              <Typography variant="h3" sx={{ color: 'common.white' }}>
                Available Courses
              </Typography>
              <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', maxWidth: 760 }}>
                Browse jurisdiction-ready courses, track eligibility requirements, and continue where you left off.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2}>
                <Chip
                  label={`${courses.length} total courses`}
                  sx={{
                    width: 'fit-content',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'common.white',
                  }}
                />
                <Chip
                  label={`${availableCount} available now`}
                  sx={{
                    width: 'fit-content',
                    backgroundColor: 'rgba(197,245,228,0.28)',
                    color: 'common.white',
                  }}
                />
              </Stack>
            </Stack>
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
                          label={course.has_price ? 'Available' : 'Coming soon'}
                          color={course.has_price ? 'success' : 'default'}
                          size="small"
                        />
                      </Stack>

                      <Box>
                        <Typography variant="h5" sx={{ mb: 0.6 }}>
                          {course.course_title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Code: <Box component="span" sx={{ fontFamily: 'monospace' }}>{course.course_code}</Box>
                        </Typography>
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                        Structured curriculum with unit progression, seat-time tracking, and exam readiness checks.
                      </Typography>

                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.2} sx={{ mt: 'auto' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          component={Link}
                          href={`/course/${course.j_code}/${course.course_code}`}
                        >
                          View Course
                        </Button>
                        {course.has_price ? (
                          <Button
                            variant="contained"
                            size="small"
                            component={Link}
                            href="/billing"
                          >
                            Upgrade
                          </Button>
                        ) : null}
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
