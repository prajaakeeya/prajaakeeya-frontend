import { ElementType } from 'react';
import { Box, ButtonBase, Typography } from '@mui/material';

export interface SegmentedTab<K extends string> {
  key: K;
  label: string;
  Icon?: ElementType;
}

interface SegmentedTabsProps<K extends string> {
  tabs: SegmentedTab<K>[];
  value: K;
  onChange: (key: K) => void;
}

/** Equal-width segmented control (e.g. Lok Sabha / Assembly / Ward switcher). */
export default function SegmentedTabs<K extends string>({ tabs, value, onChange }: SegmentedTabsProps<K>) {
  return (
    <Box
      role="tablist"
      sx={{
        display: 'grid', gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))`, gap: 0.5, p: 0.5,
        borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'action.hover',
      }}
    >
      {tabs.map(({ key, label, Icon }) => {
        const active = value === key;
        return (
          <ButtonBase
            key={key}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            sx={{
              flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 0.5, sm: 1 },
              px: { xs: 1, sm: 2 }, py: { xs: 1.25, sm: 1.5 }, borderRadius: 2, minWidth: 0,
              color: active ? 'text.primary' : 'text.secondary',
              bgcolor: active ? 'background.paper' : 'transparent',
              boxShadow: active ? (th) => `0 0 0 1px ${th.palette.divider}, 0 1px 2px ${th.palette.divider}` : 'none',
              transition: 'background-color 120ms ease, color 120ms ease',
              '&:hover': { color: 'text.primary' },
            }}
          >
            {Icon && <Icon sx={{ fontSize: 20, color: active ? 'primary.main' : 'inherit' }} />}
            <Typography
              component="span"
              sx={{ fontWeight: active ? 600 : 500, fontSize: { xs: '0.75rem', sm: '0.875rem' }, lineHeight: 1.25, textAlign: 'center' }}
            >
              {label}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
