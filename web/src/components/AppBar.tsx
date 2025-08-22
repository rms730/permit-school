"use client";

import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Stack,
  Link,
  Button,
} from "@mui/material";
import * as React from "react";
import { useState, useEffect } from "react";

import { getEntitlementForUserClient } from "@/lib/entitlementsClient";
import { useI18n } from "@/lib/i18n/I18nProvider";

import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";

interface AppBarProps {
  title?: string;
}

export default function AppBar({ title = "Permit School — Tutor" }: AppBarProps) {
  const { dict } = useI18n();
  const [isEntitled, setIsEntitled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    async function checkEntitlement() {
      try {
        const { active } = await getEntitlementForUserClient('CA');
        setIsEntitled(active);
        
        // Get user role
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setUserRole(data.role);
        }
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
          {userRole === 'guardian' && (
            <Link href="/guardian" underline="hover" color="inherit">
              {dict.nav.guardian}
            </Link>
          )}
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
          <NotificationBell />
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
