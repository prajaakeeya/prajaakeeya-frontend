import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Select, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { ReportStatus } from '../../services/adminReportsService';
import { useTranslation } from 'react-i18next';

interface Props {
    open: boolean;
    currentStatus: ReportStatus;
    onClose: () => void;
    onSubmit: (status: ReportStatus, remarks?: string) => Promise<void>;
}

const STATUSES: ReportStatus[] = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

const ReportStatusModal: React.FC<Props> = ({ open, currentStatus, onClose, onSubmit }) => {
    const { t } = useTranslation();
    const [status, setStatus] = useState<ReportStatus>(currentStatus);
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (open) {
            setStatus(currentStatus);
            setRemarks('');
        }
    }, [open, currentStatus]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSubmit(status, remarks || undefined);
            onClose();
        } catch (e) {
            // swallow - parent should show error
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{t('adminReportStatusModal.title', { defaultValue: 'Update Report Status' })}</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ mt: 1 }}>
                    <InputLabel id="status-label">{t('adminReportStatusModal.status', { defaultValue: 'Status' })}</InputLabel>
                    <Select
                        labelId="status-label"
                        value={status}
                        label={t('adminReportStatusModal.status', { defaultValue: 'Status' })}
                        onChange={(e) => setStatus(e.target.value as ReportStatus)}
                    >
                        {STATUSES.map((s) => (
                            <MenuItem key={s} value={s}>
                                {s}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <TextField
                    label={t('adminReportStatusModal.adminRemarks', { defaultValue: 'Admin remarks (optional)' })}
                    fullWidth
                    multiline
                    minRows={3}
                    sx={{ mt: 2 }}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>{t('adminReportStatusModal.cancel', { defaultValue: 'Cancel' })}</Button>
                <Button variant="contained" onClick={handleSave} disabled={loading} startIcon={loading ? <CircularProgress size={16} /> : null}>
                    {t('adminReportStatusModal.save', { defaultValue: 'Save' })}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReportStatusModal;