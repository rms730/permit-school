# Page snapshot

```yaml
- link "Skip to main content":
  - /url: "#main"
- main:
  - heading "Sign in or create an account" [level=5]
  - text: Email
  - textbox "Email"
  - text: Password
  - textbox "Password"
  - button "Sign In" [disabled]
  - button "Sign Up" [disabled]
  - paragraph: "Note: For local dev you may disable email confirmation in Supabase Auth → Email."
- contentinfo:
  - paragraph: © 2025 Permit School. All rights reserved.
  - navigation "Footer navigation":
    - link "Privacy":
      - /url: /privacy
    - link "Terms":
      - /url: /terms
    - link "Accessibility":
      - /url: /accessibility
- alert
```