"use client";

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Container,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
} from '@mui/material';
import * as React from 'react';

const faqs = [
  {
    question: "Is this official DMV material?",
    answer: "While we're not affiliated with the DMV, our questions are carefully crafted based on the official California Driver Handbook and real DMV test patterns. We regularly update our content to match the latest handbook changes.",
  },
  {
    question: "How close are your questions to the actual DMV test?",
    answer: "Our questions are modeled after real DMV test items, covering the same topics, difficulty levels, and question formats you'll encounter. Many learners report that our practice tests feel very similar to the real exam.",
  },
  {
    question: "Do you offer a money-back guarantee?",
    answer: "Yes! If you're not satisfied with our service, we offer a 30-day money-back guarantee. No questions asked. We want you to feel confident about your investment in your driving education.",
  },
  {
    question: "Will this work on my phone?",
    answer: "Absolutely! Our platform is fully responsive and works great on phones, tablets, and computers. You can study anywhere, anytime, and your progress syncs automatically across all devices.",
  },
  {
    question: "How long does it take to be ready for the test?",
    answer: "Most learners are ready in 2-4 weeks with regular practice. Our adaptive system helps you focus on weak areas, so you can be confident you're truly prepared when you take the test.",
  },
  {
    question: "Do you support other states besides California?",
    answer: "Currently, we focus on California permit tests to ensure the highest quality content. We're working on expanding to other states, so stay tuned for updates!",
  },
];

export function FAQ() {
  const theme = useTheme();
  const [_isMobile, _setIsMobile] = React.useState(false);
  const [expanded, setExpanded] = React.useState<string | false>(false);

  React.useEffect(() => {
    const checkIsMobile = () => {
      _setIsMobile(window.innerWidth < theme.breakpoints.values.md);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [theme.breakpoints.values.md]);

  const handleAccordionChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Box
      component="section"
      id="section-faq"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: 'background.default',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h2"
            sx={{
              mb: 2,
              fontWeight: 700,
            }}
          >
            Frequently asked questions
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto', lineHeight: 1.5 }}
          >
            Everything you need to know about getting your permit
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 800, mx: 'auto' }} id="faq">
          {faqs.map((faq, index) => (
            <Accordion
              key={index}
              expanded={expanded === `panel${index}`}
              onChange={handleAccordionChange(`panel${index}`)}
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
                aria-expanded={expanded === `panel${index}`}
                sx={{
                  '& .MuiAccordionSummary-content': {
                    margin: '16px 0',
                  },
                }}
              >
                <Typography variant="h6" component="h3" fontWeight={600}>
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

        {/* DMV Disclaimer */}
        <Box
          sx={{
            mt: 8,
            p: 4,
            backgroundColor: 'grey.50',
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', lineHeight: 1.6 }}
          >
            <strong>Important:</strong> Permit School is not affiliated with, endorsed by, or sponsored by the California Department of Motor Vehicles (DMV). 
            Our practice tests are designed to help you prepare for the official DMV permit test, but the actual test content and format are determined solely by the DMV. 
            Always refer to the official California Driver Handbook for the most current and accurate information.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
