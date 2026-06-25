import React, { useMemo, useState } from 'react';
import { Card, CardContent, Typography, Box, IconButton, Stack } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CallIcon from '@mui/icons-material/Call';
import apiClient from '../services/apiClient';
import useAuthStore from '../store/useAuthStore';

interface PhoneRevealCardProps {
    phone?: string | null;
    aspirantId?: number | null;
    onCall?: () => void;
    inline?: boolean;
}

const maskPhone = (value?: string | null) => {
    const s = String(value ?? '').replace(/\D/g, '');
    if (!s) return '';
    if (s.length <= 5) {
        // fallback masking for very short numbers
        return s.replace(/.(?=.{2})/g, '*');
    }
    const first = s.slice(0, 3);
    const last = s.slice(-2);
    return `${first}*****${last}`;
};

const PhoneRevealCard: React.FC<PhoneRevealCardProps> = ({ phone, aspirantId, onCall, inline = false }) => {
    const [showFull, setShowFull] = useState(false);
    const [tracked, setTracked] = useState(false);

    const masked = useMemo(() => maskPhone(phone), [phone]);

    const token = useAuthStore((s) => s.token);

    const handleToggle = async () => {
        const willShow = !showFull;
        setShowFull(willShow);

        // If revealing the phone and we haven't tracked yet, POST to tracking endpoint
        if (willShow && aspirantId && !tracked) {
            try {
                await apiClient.post('/users/track/phone-call', { aspirantId });
                setTracked(true);
            } catch (e) {
                // swallow errors; tracking is non-blocking
                console.warn('[PhoneRevealCard] track phone-call failed', e);
            }
        }
    };

    if (inline) {
        return (
            <Stack direction="row" spacing={1} sx={{
                alignItems: "center"
            }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {showFull ? (phone ?? '—') : (masked || '—')}
                </Typography>
                <IconButton
                    aria-label={showFull ? 'Hide phone number' : 'Show phone number'}
                    onClick={handleToggle}
                    size="small"
                    sx={{ ml: 0.5 }}
                >
                    {showFull ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
            </Stack>
        );
    }

    return (
        <Card variant="outlined" sx={{ borderRadius: 1 }}>
            <CardContent sx={{ p: 1.25 }}>
                <Stack
                    direction="row"
                    spacing={2}
                    sx={{
                        alignItems: "center",
                        justifyContent: "space-between"
                    }}>
                    <Box sx={{ minWidth: 0, pr: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Phone Number</Typography>
                        <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                                alignItems: "center",
                                mt: 0.5
                            }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, wordBreak: 'break-all' }}>
                                {showFull ? (phone ?? '—') : (masked || '—')}
                            </Typography>
                        </Stack>
                    </Box>

                    <Stack
                        direction="row"
                        spacing={0.5}
                        sx={{
                            alignItems: "center",
                            ml: 'auto'
                        }}>
                        {onCall && (
                            <IconButton
                                aria-label="Call"
                                onClick={onCall}
                                size="large"
                            >
                                <CallIcon />
                            </IconButton>
                        )}
                        <IconButton
                            aria-label={showFull ? 'Hide phone number' : 'Show phone number'}
                            onClick={handleToggle}
                            size="large"
                        >
                            {showFull ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default PhoneRevealCard;
