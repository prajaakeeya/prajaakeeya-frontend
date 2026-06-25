import { useEffect, useState } from 'react';
import {
  Box, Typography, CircularProgress, Stack, useTheme, Avatar, Card,
  Pagination,
} from '@mui/material';
import { Apartment as ApartmentIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { BRAND } from '../../theme';
import apiClient from '../../services/apiClient';

const FF_HEADING = "'Heming', 'Geist Variable', 'Geist', sans-serif";
const FF_BODY = "'Geist Variable', 'Geist', sans-serif";
const FF = FF_BODY;
const LIMIT = 50;

interface Voter {
  id: number;
  name: string;
  nameEn: string;
  nameKn: string;
  profilePicture: string | null;
  epicId: string;
  role: string;
  wardName: string;
  wardNameL1: string;
  corporationName: string;
  corporationNameL1: string;
  psName: string;
  psNameL1: string;
}

interface ApiResponse {
  data: Voter[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const GuestVotersPage = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const isKannada = (i18n.language || '').startsWith('kn');

  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    apiClient.get<ApiResponse>(`/users/voters?page=${page}&limit=${LIMIT}`)
      .then(res => {
        const d = res.data;
        setVoters(d.data || []);
        setTotalPages(d.totalPages || 1);
        setTotal(d.total || 0);
      })
      .catch(() => setVoters([]))
      .finally(() => setLoading(false));
  }, [page]);

  const cardBg = isDark ? 'linear-gradient(160deg, #1C1010 0%, #130B0B 100%)' : theme.palette.background.paper;
  const cardBorder = isDark ? '1px solid rgba(245,168,0,0.1)' : '1px solid rgba(245,168,0,0.22)';
  const textPrimary = theme.palette.text.primary;
  const textDim = isDark ? 'rgba(255,255,255,0.42)' : 'rgba(17,24,39,0.46)';
  const avatarBg = isDark ? '#1C1010' : theme.palette.background.paper;
  const GOLD = isDark ? BRAND.yellow : BRAND.yellowLight;

  return (
    <Stack spacing={3} sx={{ fontFamily: FF_BODY }}>
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, fontSize: { xs: '1.4rem', md: '1.8rem' }, color: 'text.primary' }}>
            {t('userDashboard.actions.voters', { defaultValue: 'Registered Voters' })}
          </Typography>
          {!loading && total > 0 && (
            <Typography sx={{ fontFamily: FF_BODY, fontWeight: 600, fontSize: '0.95rem', color: 'text.secondary' }}>
              ({total})
            </Typography>
          )}
        </Box>
      </motion.div>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}><CircularProgress /></Box>
      ) : voters.length === 0 ? (
        <Typography sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
          {isKannada ? 'ಮತದಾರರು ಕಂಡುಬಂದಿಲ್ಲ' : 'No voters found'}
        </Typography>
      ) : (
        <>
          <Stack spacing={1.5}>
            {voters.map((voter, idx) => (
              <motion.div key={voter.id || idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(idx * 0.015, 0.4) }}>
                <Card sx={{
                  borderRadius: '12px', overflow: 'hidden', p: 0,
                  background: cardBg, border: cardBorder, position: 'relative',
                  boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.4)' : '0 2px 8px rgba(17,24,39,0.06)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: isDark ? '0 8px 24px rgba(0,0,0,0.6)' : '0 6px 16px rgba(17,24,39,0.1)',
                  },
                }}>
                  <Box sx={{ display: 'flex' }}>
                    <Box sx={{ width: '4px', flexShrink: 0, bgcolor: BRAND.yellow }} />
                    <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1.5, px: { xs: 1.5, sm: 2 }, py: 1.5 }}>
                      <Box sx={{
                        p: '2px', borderRadius: '50%', flexShrink: 0,
                        background: voter.profilePicture
                          ? `conic-gradient(${BRAND.red} 0deg 90deg, ${BRAND.yellow} 90deg 180deg, ${BRAND.red2 || BRAND.red} 180deg 270deg, ${BRAND.yellow2 || BRAND.yellow} 270deg 360deg)`
                          : 'none',
                      }}>
                        <Avatar
                          src={voter.profilePicture || undefined}
                          sx={{
                            width: 48, height: 48, bgcolor: isDark ? '#333' : '#bdbdbd',
                            color: '#fff', fontWeight: 700, fontSize: '1.1rem',
                            border: voter.profilePicture ? `2px solid ${avatarBg}` : 'none',
                          }}
                        >
                          {(voter.name || 'V').charAt(0).toUpperCase()}
                          {(voter.name || 'V').split(' ')[1]?.charAt(0)?.toUpperCase() || ''}
                        </Avatar>
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontFamily: FF_HEADING, fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.25, color: textPrimary }}>
                          {isKannada ? (voter.nameKn || voter.name) : (voter.nameEn || voter.name)}
                        </Typography>
                        {(voter.psName || voter.psNameL1) && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                            <ApartmentIcon sx={{ fontSize: 14, color: textDim }} />
                            <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.78rem', color: textDim, fontWeight: 600 }}>
                              {isKannada ? (voter.psNameL1 || voter.psName) : voter.psName}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Serial number */}
                      <Typography sx={{ fontFamily: FF_BODY, fontSize: '0.78rem', color: textDim, fontWeight: 600, flexShrink: 0 }}>
                        #{(page - 1) * LIMIT + idx + 1}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </motion.div>
            ))}
          </Stack>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, v) => { setPage(v); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}
    </Stack>
  );
};

export default GuestVotersPage;
