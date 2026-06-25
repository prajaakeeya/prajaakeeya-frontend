import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  MenuItem,
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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTranslation } from 'react-i18next';
import adminParliamentaryService, { Parliamentary } from '../../services/adminParliamentaryService';
import { getStates, getParliamentary } from '../../services/geographyService';

const AdminParliamentaryPage: React.FC = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<Parliamentary[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [loading, setLoading] = useState(false); // listing removed; page starts empty
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editing, setEditing] = useState<Parliamentary | null>(null);
  const [formData, setFormData] = useState({ name: '', state: '' });
  const [formError, setFormError] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; item?: Parliamentary }>({ open: false });

  // Listing endpoint removed; start with empty list and rely on create responses
  // Load states on mount
  useEffect(() => {
    setLoading(true);
    getStates()
      .then((sResp) => {
        const extractNames = (data: any) => {
          if (!Array.isArray(data)) return [];
          return data.map((item: any) => (typeof item === 'string' ? item : item?.name || String(item)));
        };
        setStates(extractNames(sResp.data));
      })
      .catch(() => setStates([]))
      .finally(() => setLoading(false));
  }, []);

  // Load parliamentary list for selected state
  useEffect(() => {
    if (!selectedState) {
      setItems([]);
      return;
    }
    setLoading(true);
    getParliamentary(selectedState)
      .then((pResp) => {
        if (!Array.isArray(pResp.data)) {
          setItems([]);
          return;
        }
        const mapped = pResp.data.map((it: any) => ({ id: it.id, name: it.name, state: it.state } as Parliamentary));
        setItems(mapped);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [selectedState]);

  const openCreate = () => { setEditing(null); setFormData({ name: '', state: '' }); setFormError(''); setFormOpen(true); };
  const openEdit = (it: Parliamentary) => { setEditing(it); setFormData({ name: it.name, state: it.state }); setFormError(''); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); setFormData({ name: '', state: '' }); setFormError(''); };

  const submitForm = async () => {
    if (!formData.name.trim() || !formData.state.trim()) { setFormError('Name and state required'); return; }
    setFormLoading(true);
    try {
      if (editing) {
        const resp = await adminParliamentaryService.update(editing.id, { name: formData.name, state: formData.state });
        setItems(prev => prev.map(p => p.id === editing.id ? resp.data : p));
        setSuccess('Updated successfully');
      } else {
        const resp = await adminParliamentaryService.create(formData);
        setItems(prev => [...prev, resp.data]);
        setSuccess('Created successfully');
      }
      closeForm();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to save');
    } finally { setFormLoading(false); }
  };

  const confirmDelete = (it?: Parliamentary) => setDeleteConfirm({ open: true, item: it });
  const doDelete = async () => {
    if (!deleteConfirm.item) return;
    try {
      await adminParliamentaryService.delete(deleteConfirm.item.id);
      setItems(prev => prev.filter(p => p.id !== deleteConfirm.item!.id));
      setSuccess('Deleted');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleteConfirm({ open: false });
    }
  };

  return (
    <Box>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Parliamentary Constituencies
            </Typography>
            <Box sx={{ mt: 2 }}>
              <TextField
                select
                size="small"
                label="State"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="">All</MenuItem>
                {states.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Parliament</Button>
        </Box>

        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}

        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>No</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>State</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography sx={{
                            color: "text.secondary"
                          }}>No records</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map(it => (
                        <TableRow key={it.id} hover>
                          <TableCell>{it.id}</TableCell>
                          <TableCell>{it.name}</TableCell>
                          <TableCell>{it.state}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(it)}><EditIcon /></IconButton></Tooltip>
                            <Tooltip title="Delete"><IconButton size="small" onClick={() => confirmDelete(it)} color="error"><DeleteIcon /></IconButton></Tooltip>
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
      <Dialog open={formOpen} onClose={closeForm} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Parliament' : 'Add Parliament'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label="Name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} fullWidth />
            <TextField label="State" value={formData.state} onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForm} disabled={formLoading}>Cancel</Button>
          <Button variant="contained" onClick={submitForm} disabled={formLoading} startIcon={formLoading ? <CircularProgress size={18} /> : undefined}>{editing ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false })}>
        <DialogTitle>Delete Parliamentary constituency</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete &quot;{deleteConfirm.item?.name}&quot;?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false })}>Cancel</Button>
          <Button color="error" variant="contained" onClick={doDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminParliamentaryPage;
