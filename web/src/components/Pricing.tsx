import { Box, Typography, Grid, Card, CardContent, Button, Chip, List, ListItem, ListItemIcon, ListItemText, useTheme } from '@mui/material';
import { Container } from './Container';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      '1 practice test',
      'Basic explanations',
      'Mobile access',
      'Progress tracking',
    ],
    excluded: [
      'Unlimited practice tests',
      'Advanced analytics',
      'Guardian dashboard',
    ],
    cta: 'Start Free Practice Test',
    ctaHref: '/practice',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'month',
    description: 'Best for serious learners',
    features: [
      'Unlimited practice tests',
      'Detailed explanations',
      'Progress analytics',
      'Guardian dashboard',
      'Offline access',
      'Multiple languages',
    ],
    excluded: [],
    cta: 'Start Pro Trial',
    ctaHref: '/billing',
    popular: true,
  },
  {
    name: 'Classroom',
    price: 'Custom',
    period: 'per student',
    description: 'For schools and driving instructors',
    features: [
      'Everything in Pro',
      'Class management',
      'Bulk reporting',
      'Admin dashboard',
      'API access',
      'White-label options',
    ],
    excluded: [],
    cta: 'Contact Sales',
    ctaHref: '/schools',
    popular: false,
  },
];

export function Pricing() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      id="pricing"
      aria-labelledby="pricing-heading"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'background.default',
      }}
    >
      <Container>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            id="pricing-heading"
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
            }}
          >
            Choose Your Plan
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
            }}
          >
                            Start free, upgrade when you&apos;re ready
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {plans.map((plan, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transition: 'all 0.3s ease-in-out',
                  transform: plan.popular ? 'scale(1.05)' : 'scale(1)',
                  '&:hover': {
                    transform: plan.popular ? 'scale(1.05) translateY(-4px)' : 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  },
                  ...(plan.popular && {
                    border: `2px solid ${theme.palette.primary.main}`,
                  }),
                }}
              >
                {plan.popular && (
                  <Chip
                    icon={<StarIcon />}
                    label="Most Popular"
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 1,
                    }}
                  />
                )}

                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    p: 4,
                    flexGrow: 1,
                    pt: plan.popular ? 6 : 4,
                  }}
                >
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography
                      variant="h4"
                      component="h3"
                      sx={{
                        mb: 1,
                        fontWeight: 700,
                      }}
                    >
                      {plan.name}
                    </Typography>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: 'primary.main',
                      }}
                    >
                      {plan.price}
                      {plan.period !== 'forever' && (
                        <Typography
                          component="span"
                          variant="h6"
                          sx={{
                            color: 'text.secondary',
                            fontWeight: 400,
                          }}
                        >
                          /{plan.period}
                        </Typography>
                      )}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'text.secondary',
                        mt: 1,
                      }}
                    >
                      {plan.description}
                    </Typography>
                  </Box>

                  <List sx={{ flexGrow: 1, mb: 3 }}>
                    {plan.features.map((feature, featureIndex) => (
                      <ListItem key={featureIndex} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CheckIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary={feature} />
                      </ListItem>
                    ))}
                    {plan.excluded.map((feature, featureIndex) => (
                      <ListItem key={`excluded-${featureIndex}`} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <CloseIcon color="disabled" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={feature} 
                          sx={{ 
                            '& .MuiListItemText-primary': {
                              color: 'text.disabled',
                              textDecoration: 'line-through',
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>

                  <Button
                    href={plan.ctaHref}
                    variant={plan.popular ? 'contained' : 'outlined'}
                    size="large"
                    fullWidth
                    sx={{ mt: 'auto' }}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
