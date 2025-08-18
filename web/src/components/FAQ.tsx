"use client";

import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Container } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const faqs = [
  {
    question: 'How much does it cost?',
    answer: 'We offer a free practice test to get you started. Our Plus plan is $9.99/month and includes unlimited practice tests, detailed explanations, and progress tracking.',
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
    question: 'Can parents track progress?',
    answer: 'Yes! Parents can view their teen&apos;s progress, see practice test results, and get notified when they&apos;re ready for the real test.',
  },
  {
    question: 'What if I fail the real test?',
    answer: 'No worries! Your account stays active, so you can continue practicing and retake the test when you&apos;re ready.',
  },
  {
    question: 'Is this affiliated with the DMV?',
    answer: 'No, Permit School is an independent learning platform. We&apos;re not affiliated with any Department of Motor Vehicles.',
  },
  {
    question: 'Can I use this on my phone?',
    answer: 'Absolutely! Our platform is mobile-first and works great on phones, tablets, and computers.',
  },
];

export function FAQ() {
  return (
    <Box
      component="section"
      id="section-faq"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 700 }}>
            Frequently Asked Questions
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Everything you need to know about Permit School
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 800, mx: 'auto' }} id="faq">
          {faqs.map((faq, index) => (
            <Accordion key={index} sx={{ mb: 2 }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`faq-content-${index}`}
                id={`faq-header-${index}`}
              >
                <Typography variant="h6" fontWeight={600}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
