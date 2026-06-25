import React, { useState } from 'react';
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
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import adminAssemblyService, { Assembly } from '../../services/adminAssemblyService';
import { getStates, getParliamentary, getAssembly } from '../../services/geographyService';
import { MenuItem } from '@mui/material';

const AdminAssemblyPage: React.FC = () => {
  const [items, setItems] = useState<Assembly[]>([]);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<string[]>([]);
  const [parliaments, setParliaments] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedParliamentary, setSelectedParliamentary] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editing, setEditing] = useState<Assembly | null>(null);
  const [formData, setFormData] = useState({ name: '', state: '', parliamentary: '' });
  const [formError, setFormError] = useState('');
  const [formParliaments, setFormParliaments] = useState<string[]>([]);

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; item?: Assembly }>({ open: false });

  const openCreate = () => { setEditing(null); setFormData({ name: '', state: '', parliamentary: '' }); setFormError(''); setFormOpen(true); };
  const openEdit = (it: Assembly) => { setEditing(it); setFormData({ name: it.name, state: it.state, parliamentary: it.parliamentary }); setFormError(''); setFormOpen(true); };
  const closeForm = () => { setFormOpen(false); setEditing(null); setFormData({ name: '', state: '', parliamentary: '' }); setFormError(''); };

  // Load states on mount
  React.useEffect(() => {
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

  // Load parliaments when state changes
  React.useEffect(() => {
    if (!selectedState) {
      setParliaments([]);
      return;
    }
    getParliamentary(selectedState)
      .then((pResp) => {
        const extractNames = (data: any) => {
          if (!Array.isArray(data)) return [];
          return data.map((item: any) => (typeof item === 'string' ? item : item?.name || String(item)));
        };
        setParliaments(extractNames(pResp.data));
      })
      .catch(() => setParliaments([]));
  }, [selectedState]);

  // Load assemblies when state or parliamentary changes
  React.useEffect(() => {
    if (!selectedState) {
      setItems([]);
      return;
    }
    setLoading(true);
    getAssembly(selectedState, selectedParliamentary)
      .then((aResp) => {
        if (!Array.isArray(aResp.data)) { setItems([]); return; }
        const mapped = aResp.data.map((it: any) => ({ id: it.id, name: it.name, state: it.state, parliamentary: it.parliamentary } as Assembly));
        setItems(mapped);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [selectedState, selectedParliamentary]);

  const submitForm = async () => {
    if (!formData.name.trim() || !formData.state.trim() || !formData.parliamentary.trim()) { setFormError('All fields required'); return; }
    setFormLoading(true);
    try {
      if (editing) {
        const resp = await adminAssemblyService.update(editing.id, formData);
        setItems(prev => prev.map(p => p.id === editing.id ? resp.data : p));
        setSuccess('Updated successfully');
      } else {
        const resp = await adminAssemblyService.create(formData);
        setItems(prev => [...prev, resp.data]);
        setSuccess('Created successfully');
      }
      closeForm();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to save');
    } finally { setFormLoading(false); }
  };

  // Load parliaments for the form when formData.state changes
  React.useEffect(() => {
    if (!formData.state) {
      setFormParliaments([]);
      return;
    }
    getParliamentary(formData.state)
      .then((pResp) => {
        const extractNames = (data: any) => {
          if (!Array.isArray(data)) return [];
          return data.map((item: any) => (typeof item === 'string' ? item : item?.name || String(item)));
        };
        setFormParliaments(extractNames(pResp.data));
      })
      .catch(() => setFormParliaments([]));
  }, [formData.state]);

  const confirmDelete = (it?: Assembly) => setDeleteConfirm({ open: true, item: it });
  const doDelete = async () => {
    if (!deleteConfirm.item) return;
    try {
      await adminAssemblyService.delete(deleteConfirm.item.id);
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
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Assembly Constituencies</Typography>
            <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
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
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>

              <TextField
                select
                size="small"
                label="Parliamentary"
                value={selectedParliamentary}
                onChange={(e) => setSelectedParliamentary(e.target.value)}
                sx={{ minWidth: 240 }}
                disabled={!selectedState}
              >
                <MenuItem value="">All</MenuItem>
                {parliaments.map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Add Assembly</Button>
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
                      <TableCell>Parliamentary</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography sx={{
                            color: "text.secondary"
                          }}>No records</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((it, idx) => (
                        <TableRow key={it.id} hover>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>{it.name}</TableCell>
                          <TableCell>{it.state}</TableCell>
                          <TableCell>{it.parliamentary}</TableCell>
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
        <DialogTitle>{editing ? 'Edit Assembly' : 'Add Assembly'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField label="Name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} fullWidth />
            <TextField
              select
              label="State"
              value={formData.state}
              onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value, parliamentary: '' }))}
              fullWidth
            >
              <MenuItem value="">Select state</MenuItem>
              {states.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Parliamentary"
              value={formData.parliamentary}
              onChange={(e) => setFormData(prev => ({ ...prev, parliamentary: e.target.value }))}
              fullWidth
              disabled={!formData.state}
            >
              <MenuItem value="">Select parliamentary</MenuItem>
              {formParliaments.map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForm} disabled={formLoading}>Cancel</Button>
          <Button variant="contained" onClick={submitForm} disabled={formLoading} startIcon={formLoading ? <CircularProgress size={18} /> : undefined}>{editing ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false })}>
        <DialogTitle>Delete Assembly constituency</DialogTitle>
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

export default AdminAssemblyPage;
