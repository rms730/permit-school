"use client";

import * as React from "react";
import { useState } from "react";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import {
  Container,
  Paper,
  Stack,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function signUp() {
    setBusy(true);
    setErr("");
    setMsg("");
    const supabase = createPagesBrowserClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setErr(error.message);
    else setMsg("Check your email to confirm your account.");
    setBusy(false);
  }

  async function signIn() {
    setBusy(true);
    setErr("");
    setMsg("");
    const supabase = createPagesBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setErr(error.message);
    else setMsg("Signed in. You can close this page or go back.");
    setBusy(false);
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Sign in or create an account</Typography>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={signIn}
              disabled={busy || !email || !password}
            >
              Sign In
            </Button>
            <Button
              variant="outlined"
              onClick={signUp}
              disabled={busy || !email || !password}
            >
              Sign Up
            </Button>
          </Stack>
          {msg && <Alert severity="success">{msg}</Alert>}
          {err && <Alert severity="error">{err}</Alert>}
          <Typography variant="body2" color="text.secondary">
            Note: For local dev you may disable email confirmation in Supabase
            Auth → Email.
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}
