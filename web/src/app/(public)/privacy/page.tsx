import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
} from "@mui/material";
import * as React from "react";

import AppBar from "@/components/AppBar";

export default function PrivacyPage() {
  return (
    <>
      <AppBar title="Privacy Policy" />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper variant="outlined" sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Privacy Policy
          </Typography>
          
          <Typography variant="body1" paragraph>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            1. Information We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            We collect information you provide directly to us, such as when you create an account, complete courses, or contact us for support.
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. Personal Information
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Email address and name for account creation" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Course progress and completion data" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Quiz and exam results" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Certificate information" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom>
            3. How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            We use the information we collect to provide, maintain, and improve our services, process payments, and communicate with you.
          </Typography>

          <Typography variant="h6" gutterBottom>
            4. Information Sharing
          </Typography>
          <Typography variant="body1" paragraph>
            We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this policy or with your consent.
          </Typography>

          <Typography variant="h6" gutterBottom>
            5. Data Security
          </Typography>
          <Typography variant="body1" paragraph>
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </Typography>

          <Typography variant="h6" gutterBottom>
            6. Cookies and Tracking
          </Typography>
          <Typography variant="body1" paragraph>
            We use cookies and similar technologies to enhance your experience and collect usage data. You can control cookie settings through your browser.
          </Typography>

          <Typography variant="h6" gutterBottom>
            7. Third-Party Services
          </Typography>
          <Typography variant="body1" paragraph>
            We may use third-party services for payment processing, email delivery, and analytics. These services have their own privacy policies.
          </Typography>

          <Typography variant="h6" gutterBottom>
            8. Your Rights
          </Typography>
          <Typography variant="body1" paragraph>
            You have the right to access, update, or delete your personal information. Contact us to exercise these rights.
          </Typography>

          <Typography variant="h6" gutterBottom>
            9. Changes to This Policy
          </Typography>
          <Typography variant="body1" paragraph>
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
          </Typography>

          <Typography variant="h6" gutterBottom>
            10. Contact Us
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about this Privacy Policy, please contact us at {process.env.SUPPORT_EMAIL || 'support@example.com'}.
          </Typography>

          <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              TODO: Replace with actual privacy policy. This is a placeholder for development purposes.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
