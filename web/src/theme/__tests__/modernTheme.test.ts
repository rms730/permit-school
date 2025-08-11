import { modernTheme } from '../modernTheme';

describe('Modern Theme', () => {
  it('should have the correct primary colors', () => {
    expect(modernTheme.palette.primary.main).toBe('#00BCD4');
    expect(modernTheme.palette.primary.light).toBe('#4DD0E1');
    expect(modernTheme.palette.primary.dark).toBe('#0097A7');
  });

  it('should have the correct secondary colors', () => {
    expect(modernTheme.palette.secondary.main).toBe('#7C4DFF');
    expect(modernTheme.palette.secondary.light).toBe('#B388FF');
    expect(modernTheme.palette.secondary.dark).toBe('#512DA8');
  });

  it('should have the correct typography font families', () => {
    expect(modernTheme.typography.fontFamily).toContain('Inter');
    expect(modernTheme.typography.h1.fontFamily).toContain('Rubik');
    expect(modernTheme.typography.h2.fontFamily).toContain('Rubik');
  });

  it('should have the correct border radius', () => {
    expect(modernTheme.shape.borderRadius).toBe(12);
  });

  it('should have button component overrides', () => {
    expect(modernTheme.components?.MuiButton?.styleOverrides?.root).toBeDefined();
    expect(modernTheme.components?.MuiButton?.styleOverrides?.contained).toBeDefined();
    expect(modernTheme.components?.MuiButton?.styleOverrides?.outlined).toBeDefined();
  });

  it('should have card component overrides', () => {
    expect(modernTheme.components?.MuiCard?.styleOverrides?.root).toBeDefined();
  });

  it('should have text field component overrides', () => {
    expect(modernTheme.components?.MuiTextField?.styleOverrides?.root).toBeDefined();
  });

  it('should have app bar component overrides', () => {
    expect(modernTheme.components?.MuiAppBar?.styleOverrides?.root).toBeDefined();
  });

  it('should have chip component overrides', () => {
    expect(modernTheme.components?.MuiChip?.styleOverrides?.root).toBeDefined();
  });

  it('should have link component overrides', () => {
    expect(modernTheme.components?.MuiLink?.styleOverrides?.root).toBeDefined();
  });

  it('should have icon button component overrides', () => {
    expect(modernTheme.components?.MuiIconButton?.styleOverrides?.root).toBeDefined();
  });

  it('should have paper component overrides', () => {
    expect(modernTheme.components?.MuiPaper?.styleOverrides?.root).toBeDefined();
  });

  it('should have correct breakpoints', () => {
    expect(modernTheme.breakpoints.values.xs).toBe(0);
    expect(modernTheme.breakpoints.values.sm).toBe(600);
    expect(modernTheme.breakpoints.values.md).toBe(900);
    expect(modernTheme.breakpoints.values.lg).toBe(1200);
    expect(modernTheme.breakpoints.values.xl).toBe(1536);
  });

  it('should have correct spacing', () => {
    expect(modernTheme.spacing).toBe(8);
  });
});
