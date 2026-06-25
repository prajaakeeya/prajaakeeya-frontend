import React from 'react';
import {
    Card,
    CardContent,
    Grid,
    Typography,
    Box,
    Stack,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from '@mui/material';
import {
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface AspirantRequestsTabProps {
    bookings: any[];
    bookingsLoading: boolean;
    bookingsFetchError: string | null;
    bookingsLastFetchedAt: number | null;
    fetchAspirantBookings: () => void;
    isMobile: boolean;
}

const AspirantRequestsTab: React.FC<AspirantRequestsTabProps> = ({
    bookings,
    bookingsLoading,
    bookingsFetchError,
    bookingsLastFetchedAt,
    fetchAspirantBookings,
    isMobile
}) => {
    const { t } = useTranslation();

    return (
        <Grid container columnSpacing={{ xs: 0, md: 3 }} rowSpacing={{ xs: 2, md: 3 }}>
            <Grid size={12}>
                <Card sx={{ borderRadius: 3, boxShadow: '0 3px 14px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                {t('userDashboard.aspirant.requests') || 'Direct Meet Requests'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <IconButton size="small" onClick={() => fetchAspirantBookings()} aria-label="Refresh requests">
                                    <RefreshIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        </Box>
                        {bookingsLoading ? (
                            <Typography variant="body2">{t('common.loading') || 'Loading...'}</Typography>
                        ) : bookings && bookings.length > 0 ? (
                            isMobile ? (
                                <Stack spacing={1.5}>
                                    {bookings.map((b: any) => (
                                        <Card key={b.id} sx={{ borderRadius: 2 }}>
                                            <CardContent sx={{ p: 2 }}>
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{b.voterName ?? '-'}</Typography>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            color: "text.secondary",
                                                            mt: 0.5
                                                        }}>{b.message}</Typography>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </Stack>
                            ) : (
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>{t('userDashboard.aspirant.requestsTable.voter') || 'Voter'}</TableCell>
                                            <TableCell>{t('userDashboard.aspirant.requestsTable.message') || 'Message'}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {bookings.map((b: any) => (
                                            <TableRow key={b.id}>
                                                <TableCell>{b.voterName ?? '-'}</TableCell>
                                                <TableCell><Typography variant="body2">{b.message}</Typography></TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )
                        ) : (
                            <Box>
                                <Typography variant="body2" sx={{
                                    color: "text.secondary"
                                }}>
                                    {t('userDashboard.aspirant.noRequests') || 'No requests yet.'}
                                </Typography>
                                {bookingsFetchError && (
                                    <Typography variant="caption" color="error">
                                        {t('userDashboard.aspirant.requestErrorPrefix') || 'Error:'} {bookingsFetchError}
                                    </Typography>
                                )}
                                {bookingsLastFetchedAt && (
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: "text.secondary",
                                            display: 'block'
                                        }}>
                                        {t('userDashboard.aspirant.lastChecked') || 'Last checked:'} {new Date(bookingsLastFetchedAt).toLocaleString()}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );
};

export default AspirantRequestsTab;
