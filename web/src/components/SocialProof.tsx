import { Shield, CheckCircle, Smartphone } from '@mui/icons-material';
import {
  Container,
  Box,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
const trustBadges = [
  {
    icon: <Shield sx={{ fontSize: 24, color: '#22c55e' }} />,
    label: 'Money-back guarantee',
  },
  {
    icon: <CheckCircle sx={{ fontSize: 24, color: '#22c55e' }} />,
    label: 'Accessible',
  },
  {
    icon: <Smartphone sx={{ fontSize: 24, color: '#22c55e' }} />,
    label: 'Mobile friendly',
  },
];

export function SocialProof() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 4, md: 6 },
        backgroundColor: 'background.default',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 3, md: 6 }}
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            Trusted by drivers across California
          </Typography>

          <Stack
            direction="row"
            spacing={{ xs: 2, md: 4 }}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            sx={{
              justifyContent: { xs: 'center', md: 'flex-end' },
            }}
          >
            {trustBadges.map((badge, index) => (
              <Stack
                key={index}
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  padding: '8px 12px',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'rgba(34, 197, 94, 0.2)',
                }}
              >
                {badge.icon}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {badge.label}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
