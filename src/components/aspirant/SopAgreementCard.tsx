import React, { useState } from 'react';
import {
    Box, Typography, Stack, Dialog, IconButton as MuiIconButton,
    useTheme, useMediaQuery,
} from '@mui/material';
import {
    CheckBox as CheckBoxIcon,
    OpenInNew as OpenInNewIcon,
    Draw as DrawIcon,
    Close as CloseIcon,
} from '@mui/icons-material';
import SopFlowChart from './SopFlowChart';
import { BRAND } from '../../theme';

const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
const FF = FF_BODY;

interface Props {
    sopAgreed: boolean;
    name: string;
    sopAgreedAt?: string | null;
    isKannada?: boolean;
    /** Hide the green "SOP Agreed" pill — useful when opening the dialog from elsewhere */
    hidePill?: boolean;
    /** Controlled open state. When provided, overrides internal state */
    open?: boolean;
    /** Required when `open` is controlled */
    onClose?: () => void;
}

const SopAgreementCard: React.FC<Props> = ({ sopAgreed, name, sopAgreedAt, isKannada = false, hidePill = false, open: openProp, onClose }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [openState, setOpenState] = useState(false);
    const isControlled = openProp !== undefined;
    const open = isControlled ? openProp : openState;
    const setOpen = (v: boolean) => {
        if (isControlled) { if (!v) onClose?.(); }
        else setOpenState(v);
    };

    if (!sopAgreed) return null;

    const border = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(17,24,39,0.1)';

    return (
        <>
            {/* SOP Agreed pill */}
            {!hidePill && (
            <Box
                sx={{
                    px: 1.75, py: 1.25,
                    borderRadius: 1.5,
                    display: 'flex', alignItems: 'center', gap: 1.25,
                    background: isDark ? 'rgba(43,180,104,0.10)' : 'rgba(43,180,104,0.12)',
                    border: `1.5px solid rgba(43,180,104,0.45)`,
                }}
            >
                <CheckBoxIcon sx={{ color: '#2fbf71', fontSize: 24 }} />
                <Box
                    component="button"
                    type="button"
                    onClick={() => setOpen(true)}
                    sx={{
                        all: 'unset',
                        cursor: 'pointer',
                        flex: 1, minWidth: 0,
                        textAlign: 'left',
                    }}
                >
                    <Typography sx={{
                        fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.15,
                        color: '#2fbf71',
                    }}>
                        {isKannada ? 'SOP ಒಪ್ಪಿಗೆ ಪಡೆಯಲಾಗಿದೆ' : 'SOP Agreed'}
                    </Typography>
                    <Typography sx={{
                        fontFamily: FF_BODY, fontSize: '0.75rem', mt: '2px',
                        color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.6)',
                    }}>
                        {isKannada ? 'ಪರಿಶೀಲಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ' : 'Tap to review the SOP'}
                    </Typography>
                </Box>
                <Box
                    component="button"
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label="Review SOP"
                    sx={{
                        all: 'unset',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 32, height: 32, borderRadius: '6px',
                        transition: 'background 0.18s',
                        '&:hover': {
                            background: isDark ? 'rgba(43,180,104,0.18)' : 'rgba(43,180,104,0.2)',
                        },
                    }}
                >
                    <OpenInNewIcon sx={{ fontSize: 18, color: 'rgba(43,180,104,0.9)' }} />
                </Box>
            </Box>
            )}
            {/* SOP Agreement Dialog */}
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                maxWidth="md"
                fullWidth
                fullScreen={isMobile}
                slotProps={{ paper: { sx: { borderRadius: isMobile ? 0 : 3, overflow: 'hidden' } } }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, borderBottom: `1px solid ${border}` }}>
                    <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.95rem' }}>
                        {isKannada ? 'SOP' : 'Standard Operating Procedure'}
                    </Typography>
                    <MuiIconButton onClick={() => setOpen(false)} size="small"><CloseIcon /></MuiIconButton>
                </Box>
                <Box sx={{ p: { xs: 1.5, sm: 2 }, overflowY: 'auto' }}>
                    <SopFlowChart
                        sopAgreed={sopAgreed}
                        setSopAgreed={() => { /* read-only */ }}
                        onAgree={() => setOpen(false)}
                        hideAgreement
                        signatureSlot={
                            <Box>
                                <Stack
                                    direction="row"
                                    spacing={1.2}
                                    sx={{
                                        alignItems: "center",
                                        mb: 1.5
                                    }}>
                                    <DrawIcon sx={{ color: isDark ? BRAND.yellow : BRAND.saffron, fontSize: 18 }} />
                                    <Typography sx={{
                                        fontFamily: FF_HEADING, fontWeight: 700, fontSize: '0.72rem',
                                        textTransform: 'uppercase', letterSpacing: '0.1em',
                                        color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(15,23,42,0.6)',
                                    }}>
                                        {isKannada ? 'ಡಿಜಿಟಲ್ ಸಹಿ' : 'Digitally Signed'}
                                    </Typography>
                                </Stack>

                                <Box sx={{ mb: 1.2 }}>
                                    <Typography sx={{
                                        fontFamily: '"Dancing Script","Brush Script MT",cursive',
                                        fontWeight: 700,
                                        fontSize: { xs: '1.2rem', sm: '2rem' },
                                        color: isDark ? '#FFD27A' : '#B45309',
                                        lineHeight: 1.1,
                                        pb: 0.5,
                                        borderBottom: `1.5px solid ${isDark ? 'rgba(245,168,0,0.35)' : 'rgba(180,83,9,0.4)'}`,
                                        display: 'inline-block',
                                        minWidth: { xs: 140, sm: 240 },
                                    }}>
                                        {name}
                                    </Typography>
                                </Box>

                                <Stack
                                    direction="row"
                                    spacing={2}
                                    sx={{
                                        alignItems: "flex-end",
                                        justifyContent: "space-between"
                                    }}>
                                    {/* Left: Name */}
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{
                                            fontFamily: FF_BODY, fontSize: { xs: '0.6rem', sm: '0.7rem' }, fontWeight: 600,
                                            color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.55)',
                                            textTransform: 'uppercase', letterSpacing: '0.08em',
                                        }}>
                                            {isKannada ? 'ಹೆಸರು' : 'Name'}
                                        </Typography>
                                        <Typography sx={{
                                            fontFamily: FF_HEADING, fontSize: { xs: '0.75rem', sm: '0.88rem' }, fontWeight: 700,
                                            color: isDark ? '#fff' : 'rgba(15,23,42,0.92)',
                                        }}>
                                            {name}
                                        </Typography>
                                    </Box>

                                    {/* Right: Signed On */}
                                    {sopAgreedAt && (
                                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                                            <Typography sx={{
                                                fontFamily: FF_BODY, fontSize: { xs: '0.6rem', sm: '0.7rem' }, fontWeight: 600,
                                                color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(15,23,42,0.55)',
                                                textTransform: 'uppercase', letterSpacing: '0.08em',
                                            }}>
                                                {isKannada ? 'ಸಹಿ ಮಾಡಿದ ದಿನಾಂಕ' : 'Signed On'}
                                            </Typography>
                                            <Typography sx={{
                                                fontFamily: FF_HEADING, fontSize: { xs: '0.75rem', sm: '0.88rem' }, fontWeight: 700,
                                                color: isDark ? '#fff' : 'rgba(15,23,42,0.92)',
                                            }}>
                                                {new Date(sopAgreedAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', year: 'numeric',
                                                    hour: '2-digit', minute: '2-digit',
                                                })}
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </Box>
                        }
                    />
                </Box>
            </Dialog>
        </>
    );
};

export default SopAgreementCard;
