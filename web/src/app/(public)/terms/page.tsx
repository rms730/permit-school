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

export default function TermsPage() {
  return (
    <>
      <AppBar title="Terms of Service" />
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper variant="outlined" sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Terms of Service
          </Typography>
          
          <Typography variant="body1" paragraph>
            Last updated: {new Date().toLocaleDateString()}
          </Typography>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="body1" paragraph>
            By accessing and using Permit School, you accept and agree to be bound by the terms and provision of this agreement.
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. Use License
          </Typography>
          <Typography variant="body1" paragraph>
            Permission is granted to temporarily access Permit School for personal, non-commercial transitory viewing only.
          </Typography>

          <Typography variant="h6" gutterBottom>
            3. Course Content
          </Typography>
          <Typography variant="body1" paragraph>
            All course content is provided for educational purposes. We strive for accuracy but make no guarantees about the completeness or accuracy of the information.
          </Typography>

          <Typography variant="h6" gutterBottom>
            4. User Responsibilities
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Complete all required study time before taking quizzes" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Maintain the security of your account credentials" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Use the platform in compliance with applicable laws" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Not share or distribute course content without permission" />
            </ListItem>
          </List>

          <Typography variant="h6" gutterBottom>
            5. Certificates
          </Typography>
          <Typography variant="body1" paragraph>
            Certificates are issued upon successful completion of all requirements. We reserve the right to void certificates if we discover violations of these terms.
          </Typography>

          <Typography variant="h6" gutterBottom>
            6. Privacy
          </Typography>
          <Typography variant="body1" paragraph>
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service.
          </Typography>

          <Typography variant="h6" gutterBottom>
            7. Disclaimers
          </Typography>
          <Typography variant="body1" paragraph>
            The service is provided &quot;as is&quot; without warranties of any kind. We are not responsible for any damages arising from the use of this service.
          </Typography>

          <Typography variant="h6" gutterBottom>
            8. Contact Information
          </Typography>
          <Typography variant="body1" paragraph>
            If you have any questions about these Terms of Service, please contact us at {process.env.SUPPORT_EMAIL || 'support@example.com'}.
          </Typography>

          <Box sx={{ mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="body2" color="text.secondary">
              TODO: Replace with actual legal terms. This is a placeholder for development purposes.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
