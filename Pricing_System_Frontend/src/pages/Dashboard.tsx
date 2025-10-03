import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  // Grid,
  // Avatar,
  Chip,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import {
  AccountCircle,
  Logout,
  Settings,
  Notifications,
  Dashboard as DashboardIcon,
  // People,
  // Assessment,
  // AttachMoney,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { UserRole } from "../types/auth";
import { DevInfo } from "../components/common/DevInfo";
import { appName, appVersion, isDevelopment } from "../utils/env";

export const Dashboard: React.FC = () => {
  const { authState, hasRole, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const getWelcomeMessage = () => {
    if (!authState.user) return "Welcome";

    const roleMessages = {
      [UserRole.SUPER_ADMIN]: "Welcome, Super Administrator",
      [UserRole.ADMIN]: "Welcome, Administrator",
      [UserRole.MANAGER]: "Welcome, Manager",
      [UserRole.USER]: "Welcome",
      [UserRole.VIEWER]: "Welcome, Viewer",
    };

    return roleMessages[authState.user.role] || "Welcome";
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "error";
      case UserRole.ADMIN:
        return "warning";
      case UserRole.MANAGER:
        return "info";
      case UserRole.USER:
        return "success";
      case UserRole.VIEWER:
        return "default";
      default:
        return "default";
    }
  };

  const getDashboardContent = () => {
    if (hasRole(UserRole.SUPER_ADMIN)) {
      return (
        <Card
          sx={{
            mb: 3,
            background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
            color: "white",
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <strong>Super Admin Panel</strong>
            </Typography>
            <Box component="ul" sx={{ mt: 2, pl: 2 }}>
              <Typography component="li" variant="body2">
                System Configuration
              </Typography>
              <Typography component="li" variant="body2">
                User Management
              </Typography>
              <Typography component="li" variant="body2">
                Role & Permission Management
              </Typography>
              <Typography component="li" variant="body2">
                System Analytics
              </Typography>
              <Typography component="li" variant="body2">
                Backup & Recovery
              </Typography>
            </Box>
          </CardContent>
        </Card>
      );
    }

    if (hasRole(UserRole.ADMIN)) {
      return (
        <Card
          sx={{
            mb: 3,
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "white",
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <strong>Admin Panel</strong>
            </Typography>
            <Box component="ul" sx={{ mt: 2, pl: 2 }}>
              <Typography component="li" variant="body2">
                User Management
              </Typography>
              <Typography component="li" variant="body2">
                Content Management
              </Typography>
              <Typography component="li" variant="body2">
                Reports & Analytics
              </Typography>
              <Typography component="li" variant="body2">
                Settings Configuration
              </Typography>
            </Box>
          </CardContent>
        </Card>
      );
    }

    if (hasRole(UserRole.MANAGER)) {
      return (
        <Card
          sx={{
            mb: 3,
            background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            color: "white",
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <strong>Manager Panel</strong>
            </Typography>
            <Box component="ul" sx={{ mt: 2, pl: 2 }}>
              <Typography component="li" variant="body2">
                Team Management
              </Typography>
              <Typography component="li" variant="body2">
                Project Overview
              </Typography>
              <Typography component="li" variant="body2">
                Performance Reports
              </Typography>
              <Typography component="li" variant="body2">
                Resource Planning
              </Typography>
            </Box>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card
        sx={{
          mb: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <strong>User Dashboard</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 2, pl: 2 }}>
            <Typography component="li" variant="body2">
              Personal Tasks
            </Typography>
            <Typography component="li" variant="body2">
              Profile Management
            </Typography>
            <Typography component="li" variant="body2">
              Basic Reports
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  // const statsCards = [
  //   {
  //     title: "Total Users",
  //     value: "1,234",
  //     icon: <People />,
  //     color: "primary",
  //     gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  //   },
  //   {
  //     title: "Active Projects",
  //     value: "56",
  //     icon: <DashboardIcon />,
  //     color: "success",
  //     gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  //   },
  //   {
  //     title: "Pending Quotes",
  //     value: "23",
  //     icon: <Assessment />,
  //     color: "warning",
  //     gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  //   },
  //   {
  //     title: "Revenue",
  //     value: "$45.2K",
  //     icon: <AttachMoney />,
  //     color: "info",
  //     gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  //   },
  // ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {appName} Dashboard
            {isDevelopment && (
              <Chip
                label={`v${appVersion}`}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Typography>

          <IconButton color="inherit">
            <Notifications />
          </IconButton>

          <IconButton color="inherit">
            <Settings />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", ml: 2 }}>
            <Chip
              label={authState.user?.role || "User"}
              color={getRoleColor(authState.user?.role || UserRole.USER)}
              size="small"
              sx={{ mr: 2 }}
            />
            <IconButton size="large" onClick={handleMenuOpen} color="inherit">
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem disabled>
                <Typography variant="body2">{authState.user?.name}</Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="body2" color="text.secondary">
                  {authState.user?.email}
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {getWelcomeMessage()}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your pricing system efficiently with role-based access.
          </Typography>
        </Box>

        {/* Role-based Content */}
        {getDashboardContent()}

        {/* Stats Cards */}
        {/* <Grid container spacing={3}>
          {statsCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  background: card.gradient,
                  color: "white",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography
                        variant="h4"
                        component="div"
                        fontWeight="bold"
                      >
                        {card.value}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {card.title}
                      </Typography>
                    </Box>
                    <Avatar
                      sx={{
                        backgroundColor: "rgba(255,255,255,0.2)",
                        color: "white",
                      }}
                    >
                      {card.icon}
                    </Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid> */}
      </Container>

      {/* Development Info Component */}
      <DevInfo />
    </Box>
  );
};
