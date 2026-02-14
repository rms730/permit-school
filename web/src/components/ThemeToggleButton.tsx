"use client";

import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import { IconButton, Tooltip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import * as React from "react";

import { useThemeMode } from "@/app/providers/MuiProvider";

type ThemeToggleButtonProps = {
  switchToDarkLabel?: string;
  switchToLightLabel?: string;
  size?: "small" | "medium" | "large";
};

export default function ThemeToggleButton({
  switchToDarkLabel = "Switch to dark mode",
  switchToLightLabel = "Switch to light mode",
  size = "medium",
}: ThemeToggleButtonProps) {
  const { mode, toggleMode } = useThemeMode();
  const nextActionLabel = mode === "light" ? switchToDarkLabel : switchToLightLabel;

  return (
    <Tooltip title={nextActionLabel}>
      <IconButton
        onClick={toggleMode}
        color="inherit"
        size={size}
        aria-label={nextActionLabel}
        data-testid="theme-toggle"
        sx={{
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.52),
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      >
        {mode === "light" ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
      </IconButton>
    </Tooltip>
  );
}
