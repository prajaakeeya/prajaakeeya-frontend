import { useEffect, useRef, useState, useCallback } from 'react';
import {
    Box, Card, CardContent, Stack, Typography, TextField, InputAdornment,
    CircularProgress, Pagination, Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import UsersTable from '../../components/admin/UsersTable';
import adminUsersService, { AdminUser } from '../../services/adminUsersService';

const AdminUsersListPage: React.FC = () => {
    const navigate = useNavigate();
    const isAdmin = useAuthStore((s) => s.isAdmin);

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 20;
    const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const load = useCallback((pageNum: number, searchTerm: string) => {
        setLoading(true);
        adminUsersService.getVoters({ page: pageNum, limit, search: searchTerm || undefined })
            .then((resp) => {
                setUsers(resp.data);
                setTotal(resp.totalUsers ?? resp.total ?? resp.data.length);
                setTotalPages(resp.totalPages ?? 1);
            })
            .catch((e) => console.error('Failed to load users', e))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!isAdmin) { navigate('/'); return; }
        load(1, '');
    }, [isAdmin, load, navigate]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        if (searchTimer.current) clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setPage(1);
            load(1, value);
        }, 400);
    };

    const handlePageChange = (_: any, value: number) => {
        setPage(value);
        load(value, search);
    };

    if (!isAdmin) return null;

    return (
        <Stack spacing={3}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>User List</Typography>
                    <Typography variant="body2" sx={{
                        color: "text.secondary"
                    }}>{total} user{total !== 1 ? 's' : ''} total</Typography>
                </Box>
            </Box>
            <Card>
                <CardContent>
                    <Box sx={{ mb: 2 }}>
                        <TextField
                            size="small"
                            placeholder="Search by name..."
                            value={search}
                            onChange={handleSearchChange}
                            slotProps={{ input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            } }}
                            sx={{ width: 280 }}
                        />
                    </Box>

                    {loading ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
                    ) : (
                        <>
                            <UsersTable
                                users={users}
                                onView={(id) => navigate(`/admin/users/${id}`)}
                            />
                            <Grid
                                container
                                sx={{
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mt: 2
                                }}>
                                <Grid>
                                    <Typography variant="body2">Total: {total}</Typography>
                                </Grid>
                                <Grid>
                                    <Pagination count={Math.max(1, totalPages)} page={page} onChange={handlePageChange} />
                                </Grid>
                            </Grid>
                        </>
                    )}
                </CardContent>
            </Card>
        </Stack>
    );
};

export default AdminUsersListPage;
