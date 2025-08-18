"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Stack,
  Link,
  Button,
  Box,
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useState } from 'react';
import MenuIcon from '@mui/icons-material/Menu';

export function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { label: 'Courses', href: '/courses' },
    { label: 'For Schools', href: '/schools' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'About', href: '/about' },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Permit School
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.label} component={Link} href={item.href}>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        <ListItem>
          <Button href="/signin" variant="outlined" fullWidth>
            Sign In
          </Button>
        </ListItem>
        <ListItem>
          <Button href="/practice" variant="contained" fullWidth>
            Start Free Practice Test
          </Button>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={0} sx={{ backgroundColor: 'background.paper' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            variant="h6"
            component={Link}
            href="/"
            sx={{
              textDecoration: 'none',
              color: 'text.primary',
              fontWeight: 700,
            }}
          >
            Permit School
          </Typography>

          {isMobile ? (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          ) : (
            <Stack direction="row" spacing={3} alignItems="center">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  underline="hover"
                  color="text.primary"
                  sx={{ fontWeight: 500 }}
                >
                  {item.label}
                </Link>
              ))}
              <Button href="/signin" variant="outlined" size="small">
                Sign In
              </Button>
              <Button href="/practice" variant="contained" size="small">
                Start Free Practice Test
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
