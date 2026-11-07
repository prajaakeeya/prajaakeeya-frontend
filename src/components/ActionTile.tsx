import { ReactNode } from 'react';
import { Box, Card, CardActionArea, Typography, alpha } from '@mui/material';
import { ChevronRightRounded } from '@mui/icons-material';

interface ActionTileProps {
  title: string;
  description?: string;
  icon: ReactNode;
  onClick: () => void;
}

/** Navigational card used on dashboards: icon, title, optional description, chevron. */
export default function ActionTile({ title, description, icon, onClick }: ActionTileProps) {
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'border-color 120ms ease, box-shadow 120ms ease',
        '&:hover': {
          borderColor: (th) => alpha(th.palette.primary.main, 0.4),
          boxShadow: (th) => `0 4px 12px ${alpha(th.palette.grey[900], th.palette.mode === 'dark' ? 0.4 : 0.06)}`,
        },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={{ height: '100%', p: 2.5, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-start' }}
      >
        <Box
          sx={{
            width: 48, height: 48, flexShrink: 0, borderRadius: 3,
            display: 'grid', placeItems: 'center',
            bgcolor: (th) => alpha(th.palette.primary.main, th.palette.mode === 'dark' ? 0.14 : 0.06),
            '& img': { width: 28, height: 28, objectFit: 'contain' },
          }}
        >
          {icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '1rem', lineHeight: 1.35 }}>{title}</Typography>
          {description && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>{description}</Typography>
          )}
        </Box>
        <ChevronRightRounded sx={{ color: 'text.disabled' }} />
      </CardActionArea>
    </Card>
  );
}
