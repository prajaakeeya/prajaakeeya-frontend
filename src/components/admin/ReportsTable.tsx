import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Chip, IconButton, Box, Typography, Avatar } from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useTranslation } from 'react-i18next';

interface Props {
    reports: any[];
    loading?: boolean;
    onView: (id: string) => void;
}

// Mirrors UsersTable: Google profile pictures are blocked by ORB (no CORS
// headers) so they render broken — skip them and let the Avatar fall back to
// initials. Returns valid URLs unchanged.
const safeAvatarSrc = (url?: string | null) => {
    if (!url) return undefined;
    if (url.includes('googleusercontent.com') || url.includes('lh3.google')) return undefined;
    return url;
};

const statusColor = (s: string) => {
    switch (s) {
        case 'pending': return 'warning';
        case 'resolved': return 'success';
        case 'rejected': return 'error';
        default: return 'default';
    }
};

const truncateOneLineStyle = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 } as const;

const ReportsTable: React.FC<Props> = ({ reports, onView }) => {
    const { t } = useTranslation();
    if (!reports || reports.length === 0) {
        return (
            <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography color="text.secondary">{t('adminReportsTable.noReportsFound', { defaultValue: 'No reports found' })}</Typography>
            </Box>
        );
    }

    return (
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>{t('adminReportsTable.reportedUser', { defaultValue: 'Reported User' })}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('adminReportsTable.reportedUserType', { defaultValue: 'Reported User Type' })}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('adminReportsTable.reportedBy', { defaultValue: 'Reported By' })}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('adminReportsTable.reason', { defaultValue: 'Reason' })}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('adminReportsTable.status', { defaultValue: 'Status' })}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('adminReportsTable.reportedOn', { defaultValue: 'Reported On' })}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('adminReportsTable.action', { defaultValue: 'Action' })}</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {reports.map((r) => {
                    const id = r.id ?? r.reportId ?? r.report_id ?? '';
                    const reportedUserName = r.reportedUser?.nameEn || r.reportedUser?.name || '';
                    const reportedUserPic = r.reportedUser?.profilePicture || null;
                    const reportedUserType = r.reportedUserType || r.reportedUser?.role || '';
                    const reportedByName = r.reportedBy?.nameEn || r.reportedBy?.name || '';
                    const reportedByPic = r.reportedBy?.profilePicture || null;
                    const reason = r.reason || r.description || r.title || '';
                    const status = r.status || r.currentStatus || '';
                    const createdAt = r.createdAt || r.created_at || r.created || '';

                    return (
                        <TableRow key={id} hover>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar src={safeAvatarSrc(reportedUserPic)} alt={reportedUserName} sx={{ width: 32, height: 32 }}>
                                        {reportedUserName?.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{reportedUserName}</Typography>
                                </Box>
                            </TableCell>
                            <TableCell>{reportedUserType}</TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar src={safeAvatarSrc(reportedByPic)} alt={reportedByName} sx={{ width: 32, height: 32 }}>
                                        {reportedByName?.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Typography variant="body2">{reportedByName}</Typography>
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" sx={truncateOneLineStyle} title={reason}>
                                    {reason}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Chip label={status} color={statusColor(status)} size="small" />
                            </TableCell>
                            <TableCell>{createdAt ? new Date(createdAt).toLocaleString() : ''}</TableCell>
                            <TableCell>
                                <IconButton size="small" onClick={() => onView(id)} title={t('adminReportsTable.viewDetails', { defaultValue: 'View details' })}>
                                    <VisibilityIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
};

export default ReportsTable;