import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  Chip,
  Divider,
  Alert,
  AlertTitle,
} from "@mui/material";
import {
  Code as CodeIcon,
  Build as BuildIcon,
  BugReport as BugIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import {
  getEnvInfo,
  isDevelopment,
  isProduction,
  isStaging,
  isTest,
  isTesting,
  validateEnvironment,
  isSSR,
} from "../../utils/env";

export const ViteModesDemo: React.FC = () => {
  const envInfo = getEnvInfo();
  const isValid = validateEnvironment();

  const getModeColor = () => {
    if (isProduction) return "error";
    if (isStaging) return "warning";
    if (isTesting) return "info";
    if (isTest) return "secondary";
    return "success";
  };

  const getModeIcon = () => {
    if (isProduction) return <BuildIcon />;
    if (isStaging) return <SettingsIcon />;
    if (isTesting || isTest) return <BugIcon />;
    return <CodeIcon />;
  };

  const getModeDescription = () => {
    if (isProduction) return "Production build with optimizations enabled";
    if (isStaging) return "Staging environment for testing before production";
    if (isTesting) return "Testing mode with development features enabled";
    if (isTest) return "Test environment for unit and integration tests";
    return "Development mode with debugging features enabled";
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Vite Modes & Environment Demo
      </Typography>

      {!isValid && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>Environment Validation Warning</AlertTitle>
          Some environment variables may not be properly configured.
        </Alert>
      )}

      <Container sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Current Mode Info */}
        <Container sx={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                {getModeIcon()}
                <Typography variant="h6">Current Mode</Typography>
                <Chip
                  label={envInfo.mode.toUpperCase()}
                  color={getModeColor()}
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {getModeDescription()}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="caption" display="block">
                  <strong>NODE_ENV:</strong> {envInfo.nodeEnv}
                </Typography>
                <Typography variant="caption" display="block">
                  <strong>Vite Mode:</strong> {envInfo.mode}
                </Typography>
                <Typography variant="caption" display="block">
                  <strong>Command:</strong> {envInfo.appCommand}
                </Typography>
                <Typography variant="caption" display="block">
                  <strong>API URL:</strong> {envInfo.apiUrl}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>

        {/* Environment Flags */}
        <Container sx={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Environment Flags
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={envInfo.isProd ? "PROD" : "DEV"}
                    color={envInfo.isProd ? "error" : "success"}
                    size="small"
                  />
                  <Typography variant="body2">
                    {envInfo.isProd ? "Production Build" : "Development Build"}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={isSSR ? "SSR" : "CSR"}
                    color={isSSR ? "info" : "default"}
                    size="small"
                  />
                  <Typography variant="body2">
                    {isSSR ? "Server-Side Rendering" : "Client-Side Rendering"}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={isDevelopment ? "DEV" : "PROD"}
                    color={isDevelopment ? "success" : "error"}
                    size="small"
                  />
                  <Typography variant="body2">
                    {isDevelopment
                      ? "Development Environment"
                      : "Production Environment"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>

        {/* Application Configuration */}
        <Container sx={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application Configuration
              </Typography>
              <Box>
                <Typography variant="body2" gutterBottom>
                  <strong>Title:</strong> {envInfo.appTitle}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Name:</strong> {envInfo.appName}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Version:</strong> {envInfo.appVersion}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>Environment:</strong> {envInfo.appEnv}
                </Typography>
                <Typography variant="body2" gutterBottom>
                  <strong>API URL:</strong> {envInfo.apiUrl}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>

        {/* Feature Flags */}
        <Container sx={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Feature Flags
              </Typography>
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={envInfo.enableMockAuth ? "ON" : "OFF"}
                    color={envInfo.enableMockAuth ? "success" : "default"}
                    size="small"
                  />
                  <Typography variant="body2">Mock Authentication</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={envInfo.enableDebugLogs ? "ON" : "OFF"}
                    color={envInfo.enableDebugLogs ? "warning" : "default"}
                    size="small"
                  />
                  <Typography variant="body2">Debug Logs</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={envInfo.enableAnalytics ? "ON" : "OFF"}
                    color={envInfo.enableAnalytics ? "info" : "default"}
                    size="small"
                  />
                  <Typography variant="body2">Analytics</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={envInfo.showDevInfo ? "ON" : "OFF"}
                    color={envInfo.showDevInfo ? "primary" : "default"}
                    size="small"
                  />
                  <Typography variant="body2">Development Info</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1}>
                  <Chip
                    label={envInfo.errorReportingEnabled ? "ON" : "OFF"}
                    color={envInfo.errorReportingEnabled ? "error" : "default"}
                    size="small"
                  />
                  <Typography variant="body2">Error Reporting</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>

        {/* Commands Reference */}
        <Container sx={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Commands
              </Typography>
              <Container
                sx={{ display: "flex", flexDirection: "column", gap: 2 }}
              >
                <Container sx={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Development
                  </Typography>
                  <Typography variant="body2" component="div">
                    <code>npm run dev</code>
                    <br />
                    <code>npm run dev:staging</code>
                    <br />
                    <code>npm run dev:testing</code>
                    <br />
                    <code>npm run dev:production</code>
                  </Typography>
                </Container>
                <Container sx={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Building
                  </Typography>
                  <Typography variant="body2" component="div">
                    <code>npm run build</code>
                    <br />
                    <code>npm run build:staging</code>
                    <br />
                    <code>npm run build:production</code>
                    <br />
                    <code>npm run build:testing</code>
                  </Typography>
                </Container>
                <Container sx={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Preview
                  </Typography>
                  <Typography variant="body2" component="div">
                    <code>npm run preview</code>
                    <br />
                    <code>npm run preview:staging</code>
                    <br />
                    <code>npm run preview:production</code>
                    <br />
                    <code>npm run preview:testing</code>
                  </Typography>
                </Container>
                <Container sx={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Testing
                  </Typography>
                  <Typography variant="body2" component="div">
                    <code>npm run test</code>
                    <br />
                    <code>npm run test:ui</code>
                    <br />
                    <code>npm run test:coverage</code>
                    <br />
                    <code>npm run test:mode</code>
                  </Typography>
                </Container>
              </Container>
            </CardContent>
          </Card>
        </Container>
      </Container>
    </Box>
  );
};
