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
  Alert,
  Grid,
  Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import adminGramaPanchayatService, { GramaPanchayat, VillageResult } from '../../services/adminGramaPanchayatService';
import { getStates, getDistricts, getTaluks, getGPs } from '../../services/geographyService';

const emptyForm = {
  state: '',
  district: '',
  taluk: '',
  gpName: '',
  villageName: '',
  villageCode: '',
  population: '',
};

const AdminGramaPanchayatPage: React.FC = () => {
  const [items, setItems] = useState<GramaPanchayat[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filter cascades
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterTaluk, setFilterTaluk] = useState('');
  const [filterGP, setFilterGP] = useState('');
  const [filterDistricts, setFilterDistricts] = useState<string[]>([]);
  const [filterTaluks, setFilterTaluks] = useState<string[]>([]);
  const [filterGPs, setFilterGPs] = useState<string[]>([]);

  // Form state
  const [formOpen, setFormOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editing, setEditing] = useState<GramaPanchayat | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [formDistricts, setFormDistricts] = useState<string[]>([]);
  const [formTaluks, setFormTaluks] = useState<string[]>([]);
  const [formGPs, setFormGPs] = useState<string[]>([]);

  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; item?: GramaPanchayat }>({ open: false });

  // Load states once
  useEffect(() => {
    getStates()
      .then((resp) => {
        const extractNames = (data: any) => {
          if (!Array.isArray(data)) return [];
          return data.map((item: any) => (typeof item === 'string' ? item : item?.name || String(item)));
        };
        setStates(extractNames(resp.data));
      })
      .catch(() => setStates([]));
  }, []);

  // --- Filter cascades ---
  useEffect(() => {
    setFilterDistricts([]); setFilterDistrict('');
    setFilterTaluks([]); setFilterTaluk('');
    setFilterGPs([]); setFilterGP('');
    if (!filterState) return;
    getDistricts(filterState).then(r => setFilterDistricts(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, [filterState]);

  useEffect(() => {
    setFilterTaluks([]); setFilterTaluk('');
    setFilterGPs([]); setFilterGP('');
    if (!filterState || !filterDistrict) return;
    getTaluks(filterState, filterDistrict).then(r => setFilterTaluks(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, [filterDistrict]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setFilterGPs([]); setFilterGP('');
    if (!filterState || !filterDistrict || !filterTaluk) return;
    getGPs(filterState, filterDistrict, filterTaluk).then(r => setFilterGPs(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, [filterTaluk]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Form cascades ---
  useEffect(() => {
    setFormDistricts([]); setFormTaluks([]); setFormGPs([]);
    setFormData(prev => ({ ...prev, district: '', taluk: '', gpName: '' }));
    if (!formData.state) return;
    getDistricts(formData.state).then(r => setFormDistricts(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, [formData.state]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setFormTaluks([]); setFormGPs([]);
    setFormData(prev => ({ ...prev, taluk: '', gpName: '' }));
    if (!formData.state || !formData.district) return;
    getTaluks(formData.state, formData.district).then(r => setFormTaluks(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, [formData.district]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setFormGPs([]);
    setFormData(prev => ({ ...prev, gpName: '' }));
    if (!formData.state || !formData.district || !formData.taluk) return;
    getGPs(formData.state, formData.district, formData.taluk).then(r => setFormGPs(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  }, [formData.taluk]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchList = () => {
    if (!filterState || !filterDistrict || !filterTaluk || !filterGP) {
      setError('Please select State, District, Taluk, and Grama Panchayat to search.');
      return;
    }
    setLoading(true);
    setError('');
    adminGramaPanchayatService
      .getVillages({ state: filterState, district: filterDistrict, taluk: filterTaluk, gpName: filterGP })
      .then((resp) => {
        const villages: VillageResult[] = Array.isArray(resp.data) ? resp.data : [];
        const mapped: GramaPanchayat[] = villages.map((v) => ({
          srNo: v.id,
          state: filterState,
          district: filterDistrict,
          taluk: filterTaluk,
          gpName: filterGP,
          villageName: v.villageName,
          villageCode: v.villageCode,
          population: v.population,
        }));
        setItems(mapped);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Failed to fetch data');
        setItems([]);
      })
      .finally(() => setLoading(false));
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({ ...emptyForm, state: filterState, district: filterDistrict, taluk: filterTaluk });
    setFormDistricts(filterDistricts);
    setFormTaluks(filterTaluks);
    setFormGPs(filterGPs);
    setFormError('');
    setFormOpen(true);
  };

  const openEdit = (it: GramaPanchayat) => {
    setEditing(it);
    setFormData({
      state: it.state,
      district: it.district,
      taluk: it.taluk,
      gpName: it.gpName,
      villageName: it.villageName,
      villageCode: it.villageCode,
      population: it.population,
    });
    setFormError('');
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setFormData(emptyForm);
    setFormDistricts([]);
    setFormTaluks([]);
    setFormGPs([]);
    setFormError('');
  };

  const submitForm = async () => {
    const { state, district, taluk, gpName, villageName } = formData;
    if (!state || !district || !taluk || !gpName || !villageName) {
      setFormError('All fields are required');
      return;
    }
    setFormLoading(true);
    try {
      if (editing) {
        const resp = await adminGramaPanchayatService.update(editing.srNo, formData);
        setItems(prev => prev.map(p => String(p.srNo) === String(editing.srNo) ? resp.data : p));
        setSuccess('Updated successfully');
      } else {
        const resp = await adminGramaPanchayatService.create(formData);
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
      await adminGramaPanchayatService.delete(deleteConfirm.item.srNo);
      setItems(prev => prev.filter(p => String(p.srNo) !== String(deleteConfirm.item!.srNo)));
      setSuccess('Deleted successfully');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete');
    } finally {
      setDeleteConfirm({ open: false });
    }
  };

  const handleField = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [field]: e.target.value }));

  return (
    <Box>
      <Stack spacing={3}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Grama Panchayat
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Add Entry
          </Button>
        </Box>

        {/* Filters */}
        <Card>
          <CardContent>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{
                alignItems: "flex-end",
                flexWrap: "wrap"
              }}>
              <TextField
                select size="small" label="State" value={filterState}
                onChange={(e) => setFilterState(e.target.value)} sx={{ minWidth: 170 }}
              >
                {states.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>

              <TextField
                select size="small" label="District" value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                sx={{ minWidth: 170 }} disabled={!filterState}
              >
                <MenuItem value="">All Districts</MenuItem>
                {filterDistricts.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>

              <TextField
                select size="small" label="Taluk" value={filterTaluk}
                onChange={(e) => setFilterTaluk(e.target.value)}
                sx={{ minWidth: 160 }} disabled={!filterDistrict}
              >
                <MenuItem value="">All Taluks</MenuItem>
                {filterTaluks.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </TextField>

              <TextField
                select size="small" label="Grama Panchayat" value={filterGP}
                onChange={(e) => setFilterGP(e.target.value)}
                sx={{ minWidth: 190 }} disabled={!filterTaluk}
              >
                <MenuItem value="">All GPs</MenuItem>
                {filterGPs.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>

              <Button variant="outlined" startIcon={<SearchIcon />} onClick={fetchList}>
                Search
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}

        <Card>
          <CardContent>
            {loading ? (
              <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>
            ) : (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Sr.No</TableCell>
                      <TableCell>State</TableCell>
                      <TableCell>District</TableCell>
                      <TableCell>Taluk</TableCell>
                      <TableCell>GP Name</TableCell>
                      <TableCell>Village Name</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                          <Typography sx={{
                            color: "text.secondary"
                          }}>No records found</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map(it => (
                        <TableRow key={it.srNo} hover>
                          <TableCell>{it.srNo}</TableCell>
                          <TableCell>{it.state}</TableCell>
                          <TableCell>{it.district}</TableCell>
                          <TableCell>{it.taluk}</TableCell>
                          <TableCell>{it.gpName}</TableCell>
                          <TableCell>{it.villageName}</TableCell>
                          <TableCell align="right">
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => openEdit(it)}><EditIcon fontSize="small" /></IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error" onClick={() => setDeleteConfirm({ open: true, item: it })}>
                                <DeleteIcon fontSize="small" />
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
        <DialogTitle>{editing ? 'Edit Grama Panchayat Entry' : 'Add Grama Panchayat Entry'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <Grid container spacing={2}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <TextField select label="State" value={formData.state} onChange={handleField('state')} fullWidth size="small">
                  {states.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Autocomplete
                  freeSolo
                  options={formDistricts}
                  value={formData.district}
                  disabled={!formData.state}
                  onChange={(_, val) => setFormData(prev => ({ ...prev, district: val || '' }))}
                  onInputChange={(_, val) => setFormData(prev => ({ ...prev, district: val || '' }))}
                  renderInput={(params) => (
                    <TextField {...params} label="District" size="small" fullWidth />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Autocomplete
                  freeSolo
                  options={formTaluks}
                  value={formData.taluk}
                  disabled={!formData.district}
                  onChange={(_, val) => setFormData(prev => ({ ...prev, taluk: val || '' }))}
                  onInputChange={(_, val) => setFormData(prev => ({ ...prev, taluk: val || '' }))}
                  renderInput={(params) => (
                    <TextField {...params} label="Taluk" size="small" fullWidth />
                  )}
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6
                }}>
                <Autocomplete
                  freeSolo
                  options={formGPs}
                  value={formData.gpName}
                  disabled={!formData.taluk}
                  onChange={(_, val) => setFormData(prev => ({ ...prev, gpName: val || '' }))}
                  onInputChange={(_, val) => setFormData(prev => ({ ...prev, gpName: val || '' }))}
                  renderInput={(params) => (
                    <TextField {...params} label="GP Name" size="small" fullWidth />
                  )}
                />
              </Grid>
              <Grid size={12}>
                <TextField label="Village Name" value={formData.villageName} onChange={handleField('villageName')} fullWidth size="small" />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForm} disabled={formLoading}>Cancel</Button>
          <Button variant="contained" onClick={submitForm} disabled={formLoading}
            startIcon={formLoading ? <CircularProgress size={18} /> : undefined}>
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm.open} onClose={() => setDeleteConfirm({ open: false })}>
        <DialogTitle>Delete Entry</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &quot;{deleteConfirm.item?.villageName}&quot; (Sr.No {deleteConfirm.item?.srNo})?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm({ open: false })}>Cancel</Button>
          <Button color="error" variant="contained" onClick={doDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminGramaPanchayatPage;
