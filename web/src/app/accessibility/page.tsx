import * as React from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility Statement — Permit School",
  description: "Our commitment to accessibility and WCAG 2.2 AA compliance for all users.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function AccessibilityPage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h1" component="h1" gutterBottom>
        Accessibility Statement
      </Typography>
      
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h2" component="h2" gutterBottom>
          Our Commitment
        </Typography>
        <Typography paragraph>
          Permit School is committed to ensuring digital accessibility for people with disabilities. 
          We are continually improving the user experience for everyone and applying the relevant 
          accessibility standards.
        </Typography>
        
        <Typography variant="h3" component="h3" gutterBottom>
          Conformance Status
        </Typography>
        <Typography paragraph>
          The Web Content Accessibility Guidelines (WCAG) defines requirements for designers and 
          developers to improve accessibility for people with disabilities. It defines three levels 
          of conformance: Level A, Level AA, and Level AAA. Permit School is partially conformant 
          with WCAG 2.2 level AA. Partially conformant means that some parts of the content do not 
          fully conform to the accessibility standard.
        </Typography>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h2" component="h2" gutterBottom>
          Accessibility Features
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Keyboard Navigation" 
              secondary="All interactive elements can be accessed and operated using only a keyboard."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Screen Reader Support" 
              secondary="Proper ARIA labels and semantic HTML structure for screen reader compatibility."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="High Contrast" 
              secondary="Text and interactive elements meet WCAG 2.2 AA contrast requirements."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Focus Indicators" 
              secondary="Clear, visible focus indicators for all interactive elements."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Skip Links" 
              secondary="Skip to main content links for keyboard users."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Alternative Text" 
              secondary="Descriptive alt text for all images and icons."
            />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h2" component="h2" gutterBottom>
          Known Limitations
        </Typography>
        <Typography paragraph>
          While we strive for full accessibility, some areas may have limitations:
        </Typography>
        <List>
          <ListItem>
            <ListItemText 
              primary="Third-party Content" 
              secondary="Some third-party integrations may not fully meet our accessibility standards."
            />
          </ListItem>
          <ListItem>
            <ListItemText 
              primary="Dynamic Content" 
              secondary="Some dynamically loaded content may require additional time for screen readers to process."
            />
          </ListItem>
        </List>
      </Paper>

      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h2" component="h2" gutterBottom>
          Feedback and Contact
        </Typography>
        <Typography paragraph>
          We welcome your feedback on the accessibility of Permit School. Please let us know if you 
          encounter accessibility barriers:
        </Typography>
        <Typography component="div" sx={{ mb: 2 }}>
          <strong>Email:</strong> {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@permit-school.com'}
        </Typography>
        <Typography component="div" sx={{ mb: 2 }}>
          <strong>Phone:</strong> {process.env.NEXT_PUBLIC_SUPPORT_PHONE || '1-800-PERMIT'}
        </Typography>
        <Typography paragraph>
          We try to respond to accessibility feedback within 2 business days.
        </Typography>
      </Paper>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h2" component="h2" gutterBottom>
          Technical Specifications
        </Typography>
        <Typography paragraph>
          Accessibility of Permit School relies on the following technologies to work with the 
          particular combination of web browser and any assistive technologies or plugins installed 
          on your computer:
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="HTML" secondary="Semantic markup with proper heading structure and landmarks." />
          </ListItem>
          <ListItem>
            <ListItemText primary="WAI-ARIA" secondary="Accessible Rich Internet Applications for enhanced screen reader support." />
          </ListItem>
          <ListItem>
            <ListItemText primary="CSS" secondary="High contrast colors and visible focus indicators." />
          </ListItem>
          <ListItem>
            <ListItemText primary="JavaScript" secondary="Progressive enhancement for interactive features." />
          </ListItem>
        </List>
      </Paper>

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Last updated: {new Date().toLocaleDateString()}
        </Typography>
      </Box>
    </Container>
  );
}
