import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import adminElectionsService, { AdminElection } from '../../services/adminElectionsService';

const AdminElectionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [elections, setElections] = useState<AdminElection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingElection, setEditingElection] = useState<AdminElection | null>(null);
  const [formData, setFormData] = useState({ type: '', name: '' });
  const [formError, setFormError] = useState('');

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; election?: AdminElection }>({ open: false });

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminElectionsService.getAll();
      setElections(response.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingElection(null);
    setFormData({ type: '', name: '' });
    setFormError('');
    setFormOpen(true);
  };

  const handleOpenEdit = (election: AdminElection) => {
    setEditingElection(election);
    setFormData({ type: election.type, name: election.name });
    setFormError('');
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingElection(null);
    setFormData({ type: '', name: '' });
    setFormError('');
  };

  const handleFormSubmit = async () => {
    if (!formData.type.trim() || !formData.name.trim()) {
      setFormError(t('adminElections.validation.required'));
      return;
    }

    setFormLoading(true);
    setFormError('');
    try {
      if (editingElection) {
        // Backend validation forbids updating the `type` property; only send mutable fields
        const updated = await adminElectionsService.update(editingElection.id, { name: formData.name });
        setElections((prev) =>
          prev.map((e) => (e.id === editingElection.id ? updated.data : e))
        );
        setSuccess(t('adminElections.updateSuccess'));
      } else {
        const created = await adminElectionsService.create(formData);
        setElections((prev) => [...prev, created.data]);
        setSuccess(t('adminElections.createSuccess'));
      }
      handleFormClose();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to save election');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (election: AdminElection) => {
    setDeleteConfirm({ open: true, election });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.election) return;
    try {
      await adminElectionsService.delete(deleteConfirm.election.id);
      setElections((prev) => prev.filter((e) => e.id !== deleteConfirm.election!.id));
      setSuccess(t('adminElections.deleteSuccess'));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete election');
    } finally {
      setDeleteConfirm({ open: false });
    }
  };

  return (
    <Box>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 2 }}>
            <HowToVoteIcon color="primary" />
            {t('adminElections.title')}
          </Typography>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            {t('adminElections.addElection')}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('adminElections.table.id')}</TableCell>
                      <TableCell>{t('adminElections.table.type')}</TableCell>
                      <TableCell>{t('adminElections.table.name')}</TableCell>
                      <TableCell align="right">{t('adminElections.table.actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {elections.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography sx={{
                            color: "text.secondary"
                          }}>
                            {t('adminElections.noElections')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      elections.map((election) => (
                        <TableRow key={election.id} hover>
                          <TableCell>{election.id}</TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {election.type}
                            </Typography>
                          </TableCell>
                          <TableCell>{election.name}</TableCell>
                          <TableCell align="right">
                            <Tooltip title={t('adminElections.edit')}>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEdit(election)}
                                color="secondary"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={t('adminElections.delete')}>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(election)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
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
      </Stack>
      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onClose={handleFormClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingElection ? t('adminElections.editElection') : t('adminElections.addElection')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label={t('adminElections.form.type')}
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
              fullWidth
              required
              disabled={!!editingElection}
              placeholder="e.g. municipal corporation"
            />
            <TextField
              label={t('adminElections.form.name')}
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              fullWidth
              required
              placeholder="e.g. Municipal Corporation (Corporator)"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleFormClose} disabled={formLoading}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleFormSubmit}
            disabled={formLoading}
            startIcon={formLoading ? <CircularProgress size={18} /> : undefined}
          >
            {editingElection ? t('common.update') : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false })}>
        <DialogTitle>{t('adminElections.deleteConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('adminElections.deleteConfirmMessage', { name: deleteConfirm.election?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false })}>
            {t('common.cancel')}
          </Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>
            {t('adminElections.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminElectionsPage;
