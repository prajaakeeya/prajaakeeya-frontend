import React from "react";
import { Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

const LINKS = [
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms-and-conditions", label: "Terms" },
  { to: "/community-guidelines", label: "Community Guidelines" },
];

const AuthFooter: React.FC = () => (
  <Stack component="footer" alignItems="center" spacing={0.75} sx={{ py: 1.5, px: 2, textAlign: "center" }}>
    <Stack direction="row" spacing={2.5} flexWrap="wrap" justifyContent="center" useFlexGap>
      {LINKS.map((l) => (
        <Link
          key={l.to}
          component={RouterLink}
          to={l.to}
          underline="hover"
          sx={{ color: "text.secondary", fontSize: "0.8125rem", fontWeight: 500, "&:hover": { color: "text.primary" } }}
        >
          {l.label}
        </Link>
      ))}
    </Stack>
    <Typography sx={{ color: "text.disabled", fontSize: "0.75rem" }}>
      © Prajaakeeya {new Date().getFullYear()}
    </Typography>
  </Stack>
);

export default AuthFooter;
