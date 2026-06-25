import { useState } from 'react';
import { Button, Menu, MenuItem, SxProps, Theme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation } from 'react-i18next';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'kn', label: 'ಕನ್ನಡ' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'mr', label: 'मराठी' },
  { code: 'gj', label: 'ગુજરાતી' },
  { code: 'ma', label: 'മലയാളം' },
  { code: 'od', label: 'ଓଡ଼ିଆ' },
  { code: 'rj', label: 'राजस्थानी' },
  { code: 'br', label: 'भोजपुरी' },
];

interface LanguageSelectorProps {
  sx?: SxProps<Theme>;
  size?: 'small' | 'medium' | 'large';
  variant?: 'text' | 'outlined' | 'contained';
  fullWidth?: boolean;
  onSelect?: (code: string) => void;
}

export default function LanguageSelector({
  sx,
  size = 'small',
  variant = 'text',
  fullWidth = false,
  onSelect,
}: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const currentLang =
    LANGUAGES.find((l) => i18n.language?.startsWith(l.code)) ?? LANGUAGES[0];

  const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handleSelect = (code: string) => {
    i18n.changeLanguage(code);
    handleClose();
    onSelect?.(code);
  };

  return (
    <>
      <Button
        size={size}
        variant={variant}
        onClick={handleOpen}
        endIcon={<ExpandMoreIcon fontSize="inherit" />}
        fullWidth={fullWidth}
        sx={sx}
      >
        {currentLang.label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        slotProps={{ paper: { sx: { maxHeight: 320, minWidth: 140 } } }}
      >
        {LANGUAGES.map((lang) => (
          <MenuItem
            key={lang.code}
            selected={i18n.language?.startsWith(lang.code)}
            onClick={() => handleSelect(lang.code)}
            sx={{ fontWeight: i18n.language?.startsWith(lang.code) ? 700 : 400 }}
          >
            {lang.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
