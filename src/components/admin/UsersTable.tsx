import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Tooltip, Box, Typography, Chip, Avatar,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useTranslation } from 'react-i18next';

import { AdminUser } from '../../services/adminUsersService';

type Props = {
    users: AdminUser[];
    onView?: (id: number) => void;
    onToggleBlock?: (user: AdminUser) => void;
    onDelete?: (id: number) => void;
    onEdit?: (id: number) => void;
};

const safeAvatarSrc = (url?: string | null) => {
    if (!url) return undefined;
    // Google profile pictures are blocked by ORB (no CORS headers); skip them
    if (url.includes('googleusercontent.com') || url.includes('lh3.google')) return undefined;
    return url;
};

const UsersTable: React.FC<Props> = ({ users, onToggleBlock }) => {
    const { t } = useTranslation();
    if (!users || users.length === 0) return <Box sx={{ py: 4 }}><Typography>{t('adminUsersTable.noUsersFound', { defaultValue: 'No users found.' })}</Typography></Box>;

    return (
        <TableContainer>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>{t('adminUsersTable.name', { defaultValue: 'Name' })}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{t('adminUsersTable.role', { defaultValue: 'Role' })}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{t('adminUsersTable.status', { defaultValue: 'Status' })}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="right">{t('adminUsersTable.block', { defaultValue: 'Block' })}</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((u) => (
                        <TableRow key={u.id} hover>
                            <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar
                                        src={safeAvatarSrc(u.profilePicture)}
                                        alt={u.name}
                                        sx={{ width: 34, height: 34, bgcolor: 'primary.main' }}
                                    >
                                        {u.name?.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{u.name}</Typography>
                                </Box>
                            </TableCell>
                            <TableCell>{u.role}</TableCell>
                            <TableCell>
                                {u.isBlocked
                                    ? <Chip label={t('adminUsersTable.blocked', { defaultValue: 'Blocked' })} color="error" size="small" />
                                    : <Chip label={t('adminUsersTable.active', { defaultValue: 'Active' })} color="success" size="small" />
                                }
                            </TableCell>
                            <TableCell align="right">
                                <Tooltip title={u.isBlocked ? t('adminUsersTable.unblock', { defaultValue: 'Unblock' }) : t('adminUsersTable.block', { defaultValue: 'Block' })}>
                                    <IconButton
                                        size="small"
                                        onClick={() => onToggleBlock && onToggleBlock(u)}
                                        color={u.isBlocked ? 'error' : 'default'}
                                    >
                                        {u.isBlocked ? <LockOpenIcon /> : <BlockIcon />}
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default UsersTable;