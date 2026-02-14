"use client";

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { alpha } from '@mui/material/styles';
import * as React from 'react';

import { Heading } from './ui/Heading';
import { Section } from './ui/Section';

const FAQS = [
  {
    question: 'Is this official DMV material?',
    answer:
      'Permit School is not affiliated with the DMV. Our content is built from the official California handbook and updated to match common exam patterns.',
  },
  {
    question: 'How close are your questions to the actual test?',
    answer:
      'Question style, structure, and topic coverage are designed to mirror what learners typically face on permit day, including right-of-way and hazard scenarios.',
  },
  {
    question: 'Do you offer a money-back guarantee?',
    answer:
      'Yes. Paid plans include a 30-day money-back guarantee so you can evaluate the platform with low risk.',
  },
  {
    question: 'Will this work on my phone?',
    answer:
      'Yes. The experience is optimized for phones, tablets, and desktops, and your progress carries across devices.',
  },
  {
    question: 'How long does preparation usually take?',
    answer:
      'Most learners feel ready in 2 to 4 weeks with regular short sessions. Adaptive review helps reduce wasted study time.',
  },
  {
    question: 'Do you support states outside California?',
    answer:
      'California is the current primary focus. Additional jurisdictions are being rolled out as state content clears quality and compliance review.',
  },
];

export function FAQ() {
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleAccordionChange =
    (panel: string) =>
    (_event: React.SyntheticEvent, isExpanded: boolean): void => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <Section id="section-faq" spacing="xl">
      <Box sx={{ textAlign: 'center', mb: { xs: 5, md: 7 } }}>
        <Heading level={2} sx={{ mb: 1.5 }}>
          Frequently asked questions
        </Heading>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{ maxWidth: 720, mx: 'auto', textWrap: 'balance' }}
        >
          Answers about study quality, platform behavior, and permit-readiness.
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 860, mx: 'auto' }} id="faq" role="region" aria-labelledby="faq-heading">
        <Heading
          level={3}
          id="faq-heading"
          sx={{
            position: 'absolute',
            left: '-10000px',
            width: 1,
            height: 1,
            overflow: 'hidden',
          }}
        >
          FAQ content
        </Heading>
        {FAQS.map((faq, index) => (
          <Accordion
            key={faq.question}
            expanded={expanded === `panel${index}`}
            onChange={handleAccordionChange(`panel${index}`)}
            sx={{
              mb: 1.5,
              '&.Mui-expanded': {
                my: 1.5,
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`faq-content-${index}`}
              id={`faq-header-${index}`}
              aria-expanded={expanded === `panel${index}`}
            >
              <Heading level={4}>{faq.question}</Heading>
            </AccordionSummary>
            <AccordionDetails id={`faq-content-${index}`}>
              <Typography color="text.secondary" sx={{ lineHeight: 1.65 }}>
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      <Box
        sx={(theme) => ({
          mt: { xs: 5, md: 7 },
          p: { xs: 2.5, md: 3.5 },
          backgroundColor:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.background.paper, 0.88)
              : 'rgba(255,255,255,0.75)',
          border: '1px solid',
          borderColor:
            theme.palette.mode === 'dark'
              ? alpha(theme.palette.text.primary, 0.24)
              : 'divider',
          borderRadius: 3,
        })}
      >
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          <strong>Important:</strong> Permit School is not affiliated with, endorsed by, or sponsored by
          the California Department of Motor Vehicles (DMV). Always verify legal requirements using the
          official California Driver Handbook.
        </Typography>
      </Box>
    </Section>
  );
}
