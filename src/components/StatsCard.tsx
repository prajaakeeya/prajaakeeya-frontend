import { Card, CardContent, Typography, Stack, Box } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { ReactNode } from 'react';

interface StatsCardProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

const StatsCard = ({ label, value, icon, color = 'primary' }: StatsCardProps) => {
  const colorMap = {
    primary: '#00695f',
    secondary: '#d32f2f',
    success: '#2e7d32',
    error: '#d32f2f',
    warning: '#ed6c02',
    info: '#0288d1'
  };

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${colorMap[color]}15 0%, ${colorMap[color]}05 100%)`,
        border: `1px solid ${colorMap[color]}20`
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            alignItems: "flex-start",
            justifyContent: "space-between"
          }}>
          <Box sx={{
            flex: 1
          }}>
            <Typography
              variant="subtitle2"
              gutterBottom
              sx={{
                color: "text.secondary",
                fontWeight: 500
              }}>
              {label}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: colorMap[color],
                mt: 0.5
              }}
            >
              {value.toLocaleString()}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: `${colorMap[color]}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colorMap[color]
            }}
          >
            {icon || <TrendingUpIcon fontSize="large" />}
              </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
