import { ReactNode } from 'react';
import { Box, ButtonBase, IconButton, Link, Stack, Tooltip, Typography, alpha, useTheme } from '@mui/material';
import { DarkModeOutlined, LightModeOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useThemeStore from '../store/useThemeStore';
import LanguageSelector from './LanguageSelector';
import prajakeeyaLogo from '../assets/images/prajakeeya.webp';

interface PublicTopBarProps {
  /** In-page or route links shown on desktop. */
  links?: { label: string; href: string }[];
  /** Primary call-to-action rendered at the far right. */
  cta?: ReactNode;
}

/** Fixed top bar for the public, pre-login screens. */
export default function PublicTopBar({ links, cta }: PublicTopBarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDark = useTheme().palette.mode === 'dark';
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const themeLabel = isDark
    ? t('common.switchToLight', { defaultValue: 'Switch to light theme' })
    : t('common.switchToDark', { defaultValue: 'Switch to dark theme' });

  return (
    <Box
      component="header"
      sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: (th) => th.zIndex.appBar,
        height: 64, px: { xs: 2, sm: 3, lg: 5 },
        display: 'flex', alignItems: 'center', gap: 3,
        bgcolor: (th) => alpha(th.palette.background.default, 0.85),
        backdropFilter: 'saturate(180%) blur(12px)',
        borderBottom: 1, borderColor: 'divider',
      }}
    >
      <ButtonBase onClick={() => navigate('/')} sx={{ gap: 1.25, borderRadius: 2, p: 0.5, ml: -0.5 }}>
        <Box component="img" src={prajakeeyaLogo} alt="" sx={{ width: 32, height: 32, borderRadius: 2 }} />
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em' }}>Prajaakeeya</Typography>
      </ButtonBase>

      {links && (
        <Stack component="nav" direction="row" spacing={3} sx={{ display: { xs: 'none', md: 'flex' } }}>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              underline="none"
              onClick={(e) => {
                if (!l.href.startsWith('#')) { e.preventDefault(); navigate(l.href); }
              }}
              sx={{ color: 'text.secondary', fontSize: '0.9375rem', fontWeight: 500, '&:hover': { color: 'text.primary' } }}
            >
              {l.label}
            </Link>
          ))}
        </Stack>
      )}

      <Box sx={{ flex: 1 }} />

      <Stack direction="row" alignItems="center" spacing={1}>
        <Tooltip title={themeLabel}>
          <IconButton onClick={toggleTheme} aria-label={themeLabel} sx={{ color: 'text.secondary' }}>
            {isDark ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
          </IconButton>
        </Tooltip>
        <LanguageSelector variant={cta ? 'text' : 'outlined'} size="small" sx={cta ? { color: 'text.primary' } : undefined} />
        {cta}
      </Stack>
    </Box>
  );
}
