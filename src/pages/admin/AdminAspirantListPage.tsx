import React, { useEffect, useState, useCallback } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress, Alert,
  Avatar, TextField, InputAdornment, Pagination, Stack, Chip, Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import { getAllAspirants, AdminAspirant } from '../../services/aspirantService';

const AdminAspirantListPage: React.FC = () => {
  const navigate = useNavigate();
  const [aspirants, setAspirants] = useState<AdminAspirant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  // Monotonic request id: only the most recently issued fetch is allowed to
  // write state. If two fetches overlap (StrictMode's dev double-invoke, fast
  // typing, rapid pagination), the superseded one's response is ignored — so the
  // spinner and rows don't flicker as stale responses land out of order.
  const reqIdRef = React.useRef(0);

  const fetchAspirants = useCallback((pageNum: number, searchTerm: string) => {
    const reqId = ++reqIdRef.current;
    setLoading(true);
    setError('');
    getAllAspirants(pageNum, limit, searchTerm || undefined)
      .then((resp) => {
        if (reqId !== reqIdRef.current) return; // a newer request superseded this one
        setAspirants(resp.data.data);
        setTotal(resp.data.total);
        setTotalPages(resp.data.totalPages);
      })
      .catch((err) => {
        if (reqId !== reqIdRef.current) return;
        setError(err?.response?.data?.message || 'Failed to load aspirants');
      })
      .finally(() => {
        if (reqId !== reqIdRef.current) return; // don't clear the spinner for a stale request
        setLoading(false);
      });
  }, []);

  // Single fetch path for both the initial load and search. Previously a
  // separate mount effect ALSO called fetchAspirants(1, ''), so the page issued
  // two overlapping page-1 requests on load (three under StrictMode's double-
  // invoke in dev) — the cause of the request spam and the spinner flicker.
  // The initial load runs immediately (no 400ms delay); subsequent keystrokes
  // are debounced.
  const isFirstRun = React.useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      setPage(1);
      fetchAspirants(1, search);
      return;
    }
    const timer = setTimeout(() => {
      setPage(1);
      fetchAspirants(1, search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, fetchAspirants]);

  return (
    <Box>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Aspirant List</Typography>
            <Typography variant="body2" sx={{
              color: "text.secondary"
            }}>
              {total} aspirant{total !== 1 ? 's' : ''} total
            </Typography>
          </Box>
          <Box>
            <TextField
              size="small"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              slotProps={{ input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              } }}
              sx={{ width: 260 }}
            />
          </Box>
        </Box>

        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

        <Card>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'action.hover' }}>
                      <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Aspirant</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Party</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Election</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Constituency</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {aspirants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                          <Typography sx={{
                            color: "text.secondary"
                          }}>No aspirants found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      aspirants.map((a, index) => (
                        <TableRow key={a.id} hover>
                          <TableCell sx={{ color: 'text.secondary', width: 56 }}>
                            {(page - 1) * limit + index + 1}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar
                                src={a.selfieUrl || undefined}
                                alt={a.name}
                                sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}
                              >
                                {a.name?.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{a.name}</Typography>
                                {a.isBlocked && (
                                  <Chip label="Blocked" size="small" color="error" sx={{ height: 16, fontSize: '0.6rem', mt: 0.3 }} />
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip label={a.party} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{a.electionName}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{a.constituencyName}</Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={<VisibilityIcon fontSize="small" />}
                                onClick={() => navigate(`/admin/registered-aspirants/${a.id}`)}
                              >
                                View
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(_, val) => setPage(val)}
              color="primary"
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default AdminAspirantListPage;
