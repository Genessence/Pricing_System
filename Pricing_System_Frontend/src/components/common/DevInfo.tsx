import React from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Info as InfoIcon,
  Code as CodeIcon,
} from "@mui/icons-material";
import {
  getEnvInfo,
  isDevelopment,
  isProduction,
  isStaging,
  isTest,
} from "../../utils/env";

export const DevInfo: React.FC = () => {
  const envInfo = getEnvInfo();

  // Only show in development or when explicitly enabled
  if (!isDevelopment && !envInfo.showDevInfo) {
    return null;
  }

  const getEnvColor = () => {
    if (isProduction) return "error";
    if (isStaging) return "warning";
    if (isTest) return "info";
    return "success";
  };

  const getEnvLabel = () => {
    if (isProduction) return "PRODUCTION";
    if (isStaging) return "STAGING";
    if (isTest) return "TEST";
    return "DEVELOPMENT";
  };

  return (
    <Paper
      elevation={2}
      sx={{
        position: "fixed",
        bottom: 16,
        right: 16,
        maxWidth: 300,
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
      }}
    >
      <Box p={2}>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <InfoIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" fontWeight="bold">
            Environment Info
          </Typography>
          <Chip
            label={getEnvLabel()}
            color={getEnvColor()}
            size="small"
            sx={{ ml: "auto" }}
          />
        </Box>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" color="text.secondary">
              <CodeIcon
                fontSize="small"
                sx={{ mr: 0.5, verticalAlign: "middle" }}
              />
              Configuration Details
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                App: {envInfo.appName} v{envInfo.appVersion}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Environment: {envInfo.appEnv}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                API: {envInfo.apiUrl}
              </Typography>

              <Divider sx={{ my: 1 }} />

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Mock Auth: {envInfo.enableMockAuth ? "✅" : "❌"}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Debug Logs: {envInfo.enableDebugLogs ? "✅" : "❌"}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Analytics: {envInfo.enableAnalytics ? "✅" : "❌"}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Error Reporting: {envInfo.errorReportingEnabled ? "✅" : "❌"}
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Paper>
  );
};
