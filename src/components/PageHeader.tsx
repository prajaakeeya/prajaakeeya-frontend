import { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Small label above the title. */
  overline?: ReactNode;
  /** Right-aligned actions (buttons, stats). */
  actions?: ReactNode;
}

/** Standard page title block: overline, title, subtitle and optional actions. */
export default function PageHeader({ title, subtitle, overline, actions }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={2}
      alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
      justifyContent="space-between"
      sx={{ mb: { xs: 3, md: 4 } }}
    >
      <Box sx={{ minWidth: 0 }}>
        {overline && (
          <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700 }}>{overline}</Typography>
        )}
        <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '1.625rem', md: '2rem' } }}>{title}</Typography>
        {subtitle && <Typography sx={{ color: 'text.secondary', mt: 0.75 }}>{subtitle}</Typography>}
      </Box>
      {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
    </Stack>
  );
}
