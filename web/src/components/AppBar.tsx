"use client";

import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Stack,
  Link,
  Button,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import * as React from "react";
import { useState, useEffect } from "react";

import { getEntitlementForUserClient } from "@/lib/entitlementsClient";
import { useI18n } from "@/lib/i18n/I18nProvider";

import LanguageSwitcher from "./LanguageSwitcher";
import NotificationBell from "./NotificationBell";
import ThemeToggleButton from "./ThemeToggleButton";


interface AppBarProps {
  title?: string;
}

export default function AppBar({ title = "Permit School — Tutor" }: AppBarProps) {
  const { dict } = useI18n();
  const [isEntitled, setIsEntitled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkEntitlement() {
      try {
        const supabase = createPagesBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setIsEntitled(false);
          setUserRole(null);
          setIsAuthenticated(false);
          return;
        }

        setIsAuthenticated(true);

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setUserRole(profile?.role ?? null);

        const { active } = await getEntitlementForUserClient('CA');
        setIsEntitled(active);
      } catch (err) {
        console.error('Error checking entitlement:', err);
        setIsEntitled(false);
        setUserRole(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    checkEntitlement();
  }, []);

  return (
    <MuiAppBar
      position="static"
      elevation={0}
      color="transparent"
      sx={{
        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.92),
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">{title}</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Link href="/" underline="hover" color="inherit">
            {dict.nav.home}
          </Link>
          <Link href="/courses" underline="hover" color="inherit">
            {dict.nav.courses}
          </Link>
          {userRole === 'admin' && (
            <Link href="/admin/logs" underline="hover" color="inherit">
              {dict.nav.admin}
            </Link>
          )}
          {userRole === 'guardian' && (
            <Link href="/guardian" underline="hover" color="inherit">
              {dict.nav.guardian}
            </Link>
          )}
          {!loading && isAuthenticated && (
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
          {isAuthenticated && <NotificationBell />}
          <ThemeToggleButton />
          {isAuthenticated ? (
            <Link href="/signout" underline="hover" color="inherit">
              {dict.nav.signOut}
            </Link>
          ) : (
            <Link href="/login" underline="hover" color="inherit">
              {dict.nav.signIn}
            </Link>
          )}
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
