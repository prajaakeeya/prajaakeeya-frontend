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
import adminMunicipalityService, { Municipality } from '../../services/adminMunicipalityService';
import { getStates } from '../../services/geographyService';

const AdminMunicipalityPage: React.FC = () => {
  const [items, setItems] = useState<Municipality[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editing, setEditing] = useState<Municipality | null>(null);
  const [formData, setFormData] = useState({ name: '', state: '' });
  const [formError, setFormError] = useState('');

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; item?: Municipality }>({ open: false });

  useEffect(() => {
    getStates()
      .then((resp: { data: any[] }) => {
        const extractNames = (data: any[]) => {
          if (!Array.isArray(data)) return [];
          return data.map((item) => (typeof item === 'string' ? item : item?.name || String(item)));
        };
        setStates(extractNames(resp.data));
      })
      .catch(() => setStates([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    adminMunicipalityService
      .getAll(selectedState || undefined)
      .then((resp) => setItems(Array.isArray(resp.data) ? resp.data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [selectedState]);

  const openCreate = () => {
    setEditing(null);
    setFormData({ name: '', state: selectedState });
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (it: Municipality) => {
    setEditing(it);
    setFormData({ name: it.name, state: it.state });
    setFormError('');
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setFormData({ name: '', state: '' });
    setFormError('');
  };

  const submitForm = async () => {
    if (!formData.name.trim() || !formData.state.trim()) {
      setFormError('Name and state are required');
      return;
    }
    setFormLoading(true);
    try {
      if (editing) {
        const resp = await adminMunicipalityService.update(editing.id, { name: formData.name, state: formData.state });
        setItems(prev => prev.map(p => p.id === editing.id ? resp.data : p));
        setSuccess('Updated successfully');
      } else {
        const resp = await adminMunicipalityService.create({ name: formData.name, state: formData.state });
        setItems(prev => [...prev, resp.data]);
        setSuccess('Created successfully');
      }
      closeForm();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to save');
    } finally {
      setFormLoading(false);
    }
  };

  const doDelete = async () => {
    if (!deleteConfirm.item) return;
    try {
      await adminMunicipalityService.delete(deleteConfirm.item.id);
      setItems(prev => prev.filter(p => p.id !== deleteConfirm.item!.id));
      setSuccess('Deleted successfully');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleteConfirm({ open: false });
    }
  };

  return (
    <Box>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              City Corporations / Municipalities
            </Typography>
            <Box sx={{ mt: 2 }}>
              <TextField
                select
                size="small"
                label="Filter by State"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="">All States</MenuItem>
                {states.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add Municipality
          </Button>
        </Box>

        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}

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
                          }}>No municipalities found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((it, idx) => (
                        <TableRow key={it.id} hover>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{it.name}</TableCell>
                          <TableCell>{it.state}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => openEdit(it)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => setDeleteConfirm({ open: true, item: it })}>
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
      <Dialog open={formOpen} onClose={closeForm} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? 'Edit Municipality' : 'Add Municipality'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              fullWidth
            />
            <TextField
              select
              label="State"
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
              fullWidth
            >
              {states.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForm} disabled={formLoading}>Cancel</Button>
          <Button
            variant="contained"
            onClick={submitForm}
            disabled={formLoading}
            startIcon={formLoading ? <CircularProgress size={18} /> : undefined}
          >
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false })}>
        <DialogTitle>Delete Municipality</DialogTitle>
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

export default AdminMunicipalityPage;
