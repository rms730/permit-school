"use client";

import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, useTheme } from '@mui/material';
import { Container } from './Container';

const faqs = [
  {
    question: 'How much does it cost?',
    answer: 'We offer a free practice test to get you started. Our Pro plan is $9.99/month and includes unlimited practice tests, detailed explanations, and progress tracking.',
  },
  {
    question: 'How long does it take to prepare?',
    answer: 'Most students are ready for their permit test after 2-3 weeks of regular practice. Our adaptive system helps you focus on your weak areas.',
  },
  {
    question: 'Is this for my state?',
    answer: 'We currently support California and Texas, with more states coming soon. Our content is based on official state driver handbooks.',
  },
  {
    question: 'Can I study offline?',
    answer: 'Yes! Our Pro plan includes offline access so you can study anywhere, even without an internet connection.',
  },
  {
    question: 'What if I don\'t pass?',
    answer: 'Our practice tests are designed to prepare you thoroughly. If you don\'t pass, you can continue practicing with our unlimited tests until you\'re ready.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied, contact us for a full refund.',
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
        backgroundColor: 'background.paper',
      }}
    >
      <Container>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            id="faq-heading"
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 700,
              mb: 2,
            }}
          >
            Frequently Asked Questions
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Everything you need to know about getting your permit
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
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.200',
              }}
            >
              <AccordionSummary
                sx={{
                  '& .MuiAccordionSummary-content': {
                    margin: '16px 0',
                  },
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.6 }}
                >
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="body1" color="text.secondary">
            Still have questions?{' '}
            <Typography
              component="a"
              href="/contact"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              Contact us
            </Typography>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
