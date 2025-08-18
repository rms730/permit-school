import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, useTheme } from '@mui/material';
import { Container } from './Container';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqs = [
  {
    question: 'How much does Permit School cost?',
    answer: 'We offer a free plan to get you started, with unlimited practice tests and advanced features available in our Pro plan for $19/month. Schools and driving instructors can contact us for custom pricing.',
  },
  {
    question: 'Can I use Permit School on my phone?',
    answer: 'Absolutely! Permit School is designed to work perfectly on mobile devices. You can study anywhere, anytime, and even use it offline with our Pro plan.',
  },
  {
    question: 'How accurate are the practice tests?',
    answer: 'Our practice tests are built directly from official state driver handbooks and updated regularly. Students who use our platform have a 95% pass rate on their actual permit tests.',
  },
  {
    question: 'Can parents track their child\'s progress?',
    answer: 'Yes! Our Pro plan includes a guardian dashboard where parents can monitor their child\'s study progress, see test results, and get notified about important milestones.',
  },
  {
    question: 'What if I don\'t pass the first time?',
    answer: 'No worries! With unlimited practice tests in our Pro plan, you can keep practicing until you\'re confident. Our adaptive system focuses on your weak areas to help you improve faster.',
  },
  {
    question: 'Do you support multiple languages?',
    answer: 'Yes, we offer content in multiple languages to make learning comfortable for everyone. Check our course catalog for available languages in your state.',
  },
  {
    question: 'How do I get started?',
    answer: 'Simply click "Start Free Practice Test" to begin. No registration required for the free test. Create an account to save your progress and access more features.',
  },
  {
    question: 'Is Permit School available in my state?',
    answer: 'We currently support California and Texas, with more states coming soon. Check our course catalog to see what\'s available in your area.',
  },
];

export function FAQ() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      aria-labelledby="faq-heading"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'background.default',
      }}
    >
      <Container>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            id="faq-heading"
            variant="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            Everything you need to know about Permit School
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              sx={{
                mb: 2,
                '&:before': {
                  display: 'none',
                },
                '&.Mui-expanded': {
                  margin: '16px 0',
                },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`faq-content-${index}`}
                id={`faq-header-${index}`}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    margin: '16px 0',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                  }}
                >
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    lineHeight: 1.6,
                  }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Still have questions?
          </Typography>
          <Typography variant="body1">
            Contact us at{' '}
            <Box
              component="a"
              href="mailto:support@permit-school.com"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              support@permit-school.com
            </Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
