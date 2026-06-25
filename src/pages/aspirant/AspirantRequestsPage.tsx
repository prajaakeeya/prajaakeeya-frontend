import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Alert, CircularProgress, Snackbar } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import useAuthStore from '../../store/useAuthStore';
import { getAspirantById, getAspirantBookings, updateBookingStatus, respondBooking } from '../../services/aspirantService';
import AspirantRequestsTab from '../../components/aspirant/AspirantRequestsTab';

const AspirantRequestsPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [aspirantProfile, setAspirantProfile] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [bookingsFetchError, setBookingsFetchError] = useState<string | null>(null);
    const [bookingsLastFetchedAt, setBookingsLastFetchedAt] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Booking action state
    const [bookingActionOpen, setBookingActionOpen] = useState(false);
    const [bookingActionErrorOpen, setBookingActionErrorOpen] = useState(false);
    const [bookingActionMsg, setBookingActionMsg] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!user?.id) {
                    navigate('/register');
                    return;
                }

                // Use aspirantId if available, otherwise fall back to user.id
                const aspirantId = user?.aspirantId ?? user?.id;
                const [profile, bookingsData] = await Promise.all([
                    getAspirantById(aspirantId),
                    getAspirantBookings(aspirantId)
                ]);

                setAspirantProfile(profile.data);
                setBookings(bookingsData?.data || []);
                setBookingsLastFetchedAt(Date.now());
            } catch (err: any) {
                setError(err.message || 'Failed to load data');
            } finally {
                setLoading(false);
                setBookingsLoading(false);
            }
        };

        fetchData();
    }, [user, navigate]);

    const fetchAspirantBookings = async () => {
        if (!user?.id) return;

        setBookingsLoading(true);
        setBookingsFetchError(null);
        try {
            const bookingsData = await getAspirantBookings(user.id);
            setBookings(bookingsData?.data || []);
            setBookingsLastFetchedAt(Date.now());
        } catch (err: any) {
            setBookingsFetchError(err.message || 'Failed to fetch bookings');
        } finally {
            setBookingsLoading(false);
        }
    };

    const handleBookingAction = async (bookingId: string, action: 'accept' | 'reject', message?: string) => {
        try {
            const aspirantId = aspirantProfile?.id || user?.id;
            if (!aspirantId) throw new Error('No aspirant id available');

            if (action === 'accept') {
                await updateBookingStatus(aspirantId, parseInt(bookingId), 'accepted');
                setBookingActionMsg(t('userDashboard.aspirant.bookingAccepted') || 'Booking accepted successfully');
            } else {
                await respondBooking(aspirantId, parseInt(bookingId), { status: 'rejected' });
                setBookingActionMsg(t('userDashboard.aspirant.bookingRejected') || 'Booking rejected');
            }

            setBookingActionOpen(true);
            await fetchAspirantBookings();
        } catch (err: any) {
            setBookingActionMsg(err.message || 'Failed to process booking');
            setBookingActionErrorOpen(true);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        minHeight: "400px"
                    }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!aspirantProfile) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="warning">
                    {t('userDashboard.aspirant.noProfile') || 'Aspirant profile not found'}
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3 }}>
                {t('userDashboard.aspirant.tabs.requests') || 'Direct Meet Requests'}
            </Typography>

            <AspirantRequestsTab
                bookings={bookings}
                bookingsLoading={bookingsLoading}
                bookingsFetchError={bookingsFetchError}
                bookingsLastFetchedAt={bookingsLastFetchedAt}
                fetchAspirantBookings={fetchAspirantBookings}
                isMobile={isMobile}
            />

            {/* Success Snackbar */}
            <Snackbar open={bookingActionOpen} autoHideDuration={3000} onClose={() => setBookingActionOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="success" onClose={() => setBookingActionOpen(false)}>{bookingActionMsg}</Alert>
            </Snackbar>

            {/* Error Snackbar */}
            <Snackbar open={bookingActionErrorOpen} autoHideDuration={4000} onClose={() => setBookingActionErrorOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="error" onClose={() => setBookingActionErrorOpen(false)}>{bookingActionMsg}</Alert>
            </Snackbar>
        </Container>
    );
};

export default AspirantRequestsPage;