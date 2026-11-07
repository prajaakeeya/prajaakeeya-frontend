import { Box, Card, CardContent, Stack, Typography, alpha } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { ReactNode } from 'react';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

/** Metric card: label, large tabular value, tinted icon. */
const StatsCard = ({ label, value, icon, color = 'primary' }: StatsCardProps) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
      <Stack direction="row" spacing={2} alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>{label}</Typography>
          <Typography sx={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1.2, mt: 1, fontVariantNumeric: 'tabular-nums' }}>
            {value.toLocaleString()}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 44, height: 44, borderRadius: 2, flexShrink: 0,
            display: 'grid', placeItems: 'center',
            color: `${color}.main`,
            bgcolor: (th) => alpha(th.palette[color].main, th.palette.mode === 'dark' ? 0.16 : 0.08),
          }}
        >
          {icon || <TrendingUpIcon />}
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

export default StatsCard;
