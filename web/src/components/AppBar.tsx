"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Stack,
  Link,
  Button,
} from "@mui/material";
import { getEntitlementForUserClient } from "@/lib/entitlementsClient";
import { useI18n } from "@/lib/i18n/I18nProvider";
import LanguageSwitcher from "./LanguageSwitcher";

interface AppBarProps {
  title?: string;
}

export default function AppBar({ title = "Permit School — Tutor" }: AppBarProps) {
  const { dict } = useI18n();
  const [isEntitled, setIsEntitled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkEntitlement() {
      try {
        const { active } = await getEntitlementForUserClient('CA');
        setIsEntitled(active);
      } catch (err) {
        console.error('Error checking entitlement:', err);
        setIsEntitled(false);
      } finally {
        setLoading(false);
      }
    }

    checkEntitlement();
  }, []);

  return (
    <MuiAppBar position="static" elevation={0}>
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">{title}</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Link href="/" underline="hover" color="inherit">
            {dict.nav.home}
          </Link>
          <Link href="/course/CA/DE-ONLINE" underline="hover" color="inherit">
            {dict.nav.courses}
          </Link>
          <Link href="/admin/logs" underline="hover" color="inherit">
            {dict.nav.admin}
          </Link>
          {!loading && (
            <>
              {!isEntitled ? (
                <Button
                  component={Link}
                  href="/billing"
                  variant="contained"
                  size="small"
                  sx={{ color: 'white' }}
                >
                  {dict.actions.upgrade}
                </Button>
              ) : (
                <Link href="/billing" underline="hover" color="inherit">
                  {dict.nav.billing}
                </Link>
              )}
            </>
          )}
          <Link href="/signin" underline="hover" color="inherit">
            {dict.nav.signIn}
          </Link>
          <Link href="/privacy" underline="hover" color="inherit">
            {dict.nav.privacy}
          </Link>
          <Link href="/terms" underline="hover" color="inherit">
            {dict.nav.terms}
          </Link>
          <LanguageSwitcher />
        </Stack>
      </Toolbar>
    </MuiAppBar>
  );
}
