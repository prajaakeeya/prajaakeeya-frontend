import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  MenuItem,
  TextField,
  Box,
  Stack,
  Grid,
  Chip,
  Paper
} from '@mui/material';
import {
  HowToVote as HowToVoteIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { fetchWardResults } from '../services/voteService';
import { getWards } from '../services/wardService';

interface Ward {
  id: number;
  name: string;
  wardNo: number;
  assemblyName: string;
  zoneName: string;
}

interface Election {
  id: number;
  name: string;
  type: string;
  date: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  location: string;
  totalCandidates: number;
  totalVotes: number;
}

const electionKeys = [
  'bbmp',
  'assembly2023',
  'loksabha2024',
  'gram2024',
  'zilla2024',
  'urban2025'
];

const karnatakaElections: Election[] = electionKeys.map((key, idx) => ({
  id: idx + 1,
  name: key, // placeholder, will use i18n in render
  type: key,
  date: '',
  status: 'upcoming',
  location: '',
  totalCandidates: 0,
  totalVotes: 0
}));

const VotingResultPage = () => {
  const [wardId, setWardId] = useState<number>();
  const [results, setResults] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [showElections, setShowElections] = useState(true);
  const { t } = useTranslation();

  // Dummy wards data
  const dummyWardsData: Ward[] = [
    { id: 1, name: 'Ward 101 - Central', wardNo: 101, assemblyName: 'Central Assembly', zoneName: 'Central Zone' },
    { id: 2, name: 'Ward 102 - North', wardNo: 102, assemblyName: 'North Assembly', zoneName: 'North Zone' }
  ];

  // Dummy results data
  const dummyResults = [
    { aspirantId: 1, aspirantName: 'Rajesh Kumar', totalVotes: 1250 },
    { aspirantId: 2, aspirantName: 'Priya Sharma', totalVotes: 980 },
    { aspirantId: 3, aspirantName: 'Suresh Reddy', totalVotes: 750 }
  ];

  useEffect(() => {
    // Use dummy data instead of API call
    setWards(dummyWardsData);
    if (dummyWardsData.length > 0) {
      setWardId(dummyWardsData[0].id);
    }
  }, []);

  useEffect(() => {
    if (!wardId) return;
    // Always show elections view for demo
    setShowElections(true);
  }, [wardId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'ongoing':
        return 'primary';
      case 'upcoming':
        return 'warning';
      default:
        return 'default';
    }
  };

  if (showElections) {
    return (
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            {t('pages.landing.results.title') || 'Karnataka Elections'}
          </Typography>
          <Typography variant="body1" sx={{
            color: "text.secondary"
          }}>
            {t('pages.landing.results.subtitle') || 'Overview of elections in Karnataka'}
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {karnatakaElections.map((election) => (
            <Grid
              key={election.id}
              size={{
                xs: 12,
                md: 6
              }}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 2
                    }}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {t(`pages.landing.elections.${electionKeys[election.id - 1]}.title`)}
                      </Typography>
                      <Typography variant="body2" sx={{
                        color: "text.secondary"
                      }}>
                        {t(`pages.landing.elections.${electionKeys[election.id - 1]}.level`)}
                      </Typography>
                    </Box>
                    <Chip
                      label={t(`common.statusLabels.${election.status}`)}
                      size="small"
                      color={getStatusColor(election.status) as any}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Stack>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2" sx={{
                        color: "text.secondary"
                      }}>
                        {t(`pages.landing.elections.${electionKeys[election.id - 1]}.date`)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationIcon fontSize="small" color="action" />
                      <Typography variant="body2" sx={{
                        color: "text.secondary"
                      }}>
                        {t(`pages.landing.elections.${electionKeys[election.id - 1]}.location`)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <HowToVoteIcon fontSize="small" color="action" />
                      <Typography variant="body2" sx={{
                        color: "text.secondary"
                      }}>
                        {(() => {
                          const ek = electionKeys[election.id - 1];
                          const candidates = t(`pages.landing.elections.${ek}.candidates`, { defaultValue: '' });
                          const stats = t(`pages.landing.elections.${ek}.stats`, { defaultValue: '' });
                          if (stats) return stats;
                          if (candidates) return candidates;
                          return '';
                        })()}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {t('pages.landing.results.title')}
        </Typography>
        <Typography variant="body1" sx={{
          color: "text.secondary"
        }}>
          {t('pages.landing.results.subtitle') || 'Voting results by ward'}
        </Typography>
      </Box>
      <Card>
        <CardContent>
          <TextField
            select
            fullWidth
            value={wardId ?? ''}
            onChange={(e) => setWardId(Number(e.target.value))}
            sx={{ mb: 3 }}
            label={t('pages.landing.results.selectWard') || 'Select Ward'}
          >
            {wards.map((ward) => (
              <MenuItem key={ward.id} value={ward.id}>
                {ward.name}
              </MenuItem>
            ))}
          </TextField>
          {results.length > 0 ? (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>{t('pages.landing.results.aspirant') || 'Aspirant'}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {t('pages.landing.results.votes') || 'Votes'}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((row) => (
                  <TableRow key={row.aspirantId} hover>
                    <TableCell>{row.aspirantName}</TableCell>
                    <TableCell align="right">{row.totalVotes.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" sx={{
                color: "text.secondary"
              }}>
                {t('pages.landing.results.noResults') || 'No results available for this ward'}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
};

export default VotingResultPage;
