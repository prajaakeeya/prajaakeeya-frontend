import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Stack,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {
    Person as PersonIcon,
    Event as EventIcon,
    Chat as ChatIcon,
    Article as ArticleIcon,
    Email as EmailIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { HowToVote as HowToVoteIcon, People as PeopleIcon, Forum as ForumIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

interface AspirantMobileNavProps {
    aspirantProfile: any;
    isApproved?: boolean;
}

const AspirantMobileNav: React.FC<AspirantMobileNavProps> = ({ aspirantProfile, isApproved = false }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const menuItems = [
        // High-level actions requested for mobile hamburger menu (registration removed from mobile)
        {
            title: t('userDashboard.actions.vote') || 'Vote Now',
            icon: <HowToVoteIcon />,
            path: '/user/vote',
            color: '#2e7d32',
            disabled: false
        },
        {
            title: t('userDashboard.actions.voters') || 'View Voters',
            icon: <PeopleIcon />,
            path: `/user/voters`,
            color: '#9c27b0'
        },
        {
            title: t('userDashboard.actions.discussions') || 'Ward Discussions',
            icon: <ForumIcon />,
            path: '/user/discussions',
            color: '#ed6c02'
        },
        {
            title: t('userDashboard.aspirant.tabs.profile') || 'My Profile',
            icon: <PersonIcon />,
            path: '/user/dashboard/profile',
            color: '#1976d2'
        },
        {
            title: t('userDashboard.aspirant.tabs.meetings') || 'My Meeting Links',
            icon: <EventIcon />,
            path: '/user/dashboard/meetings',
            color: '#9c27b0'
        },
        {
            title: t('userDashboard.aspirant.tabs.chat') || 'Chat with Citizens',
            icon: <ChatIcon />,
            path: '/user/dashboard/chat',
            color: '#2e7d32'
        },
        {
            title: t('userDashboard.aspirant.tabs.posts') || 'Posts',
            icon: <ArticleIcon />,
            path: '/user/dashboard/posts',
            color: '#ed6c02'
        },
        // Direct Meet Requests removed from mobile menu
    ];

    // Keep the full menu for mobile; ensure Vote action remains visible and enabled
    let filteredMenuItems = menuItems;

    // If aspirant is not approved, hide interactive tabs
    if (aspirantProfile && !isApproved) {
        filteredMenuItems = filteredMenuItems.filter(item =>
            item.path !== '/user/dashboard/meetings' &&
            item.path !== '/user/dashboard/chat' &&
            item.path !== '/user/dashboard/posts'
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Card sx={{
                borderRadius: 3,
                boxShadow: '0 3px 14px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.06)',
                mb: 2
            }}>
                <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {t('userDashboard.aspirant.title') || 'Aspirant Dashboard'}
                    </Typography>
                    <Typography variant="body2" sx={{
                        color: "text.secondary"
                    }}>
                        Ward {aspirantProfile.wardNumber} • {aspirantProfile.assembly}
                    </Typography>
                </CardContent>
            </Card>
            <Card sx={{
                borderRadius: 3,
                boxShadow: '0 3px 14px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.06)'
            }}>
                <List sx={{ p: 0 }}>
                    {filteredMenuItems.map((item, index) => (
                        <React.Fragment key={item.path}>
                            <ListItem disablePadding>
                                <ListItemButton
                                    onClick={() => !(item as any).disabled && navigate(item.path)}
                                    disabled={(item as any).disabled}
                                    sx={{
                                        py: 2,
                                        '&:hover': {
                                            bgcolor: (item as any).disabled ? 'transparent' : 'rgba(25, 118, 210, 0.04)'
                                        },
                                        opacity: (item as any).disabled ? 0.5 : 1,
                                        cursor: (item as any).disabled ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <ListItemIcon sx={{ minWidth: 48 }}>
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 2,
                                                bgcolor: `${item.color}15`,
                                                color: item.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            {item.icon}
                                        </Box>
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.title}
                                        slotProps={{
                                            primary: {
                                                sx: {
                                                    fontWeight: 600,
                                                    fontSize: '0.95rem'
                                                }
                                            }
                                        }}
                                    />
                                    <ChevronRightIcon sx={{ color: 'text.secondary' }} />
                                </ListItemButton>
                            </ListItem>
                            {index < menuItems.length - 1 && (
                                <Box sx={{ mx: 2, borderBottom: '1px solid rgba(0,0,0,0.06)' }} />
                            )}
                        </React.Fragment>
                    ))}
                </List>
            </Card>
        </Box>
    );
};

export default AspirantMobileNav;
