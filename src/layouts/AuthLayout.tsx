import { PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import useAuthStore from '../store/useAuthStore';

interface AuthLayoutProps {
  title: string;
}

const AuthLayout = ({ title }: PropsWithChildren<AuthLayoutProps>) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // If user is already authenticated, show only the blank background
  // while RedirectIfAuth (in the child route) performs the navigation.
  // This prevents the white card from ever being painted.
  if (isAuthenticated) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default"
        }}>
        {/* Hidden Outlet so RedirectIfAuth can trigger the navigate */}
        <Box sx={{ display: 'none' }}><Outlet /></Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default"
      }}>
      <Outlet />
    </Box>
  );
};

export default AuthLayout;
