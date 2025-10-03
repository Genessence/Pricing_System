import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import {
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from "@mui/icons-material";

interface ErrorDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  severity?: "error" | "warning" | "info";
  errorCode?: string;
  details?: string;
  showRetry?: boolean;
  onRetry?: () => void;
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({
  open,
  onClose,
  title,
  message,
  severity = "error",
  errorCode,
  details,
  showRetry = false,
  onRetry,
}) => {
  const getIcon = () => {
    switch (severity) {
      case "error":
        return <ErrorIcon color="error" sx={{ fontSize: 40 }} />;
      case "warning":
        return <WarningIcon color="warning" sx={{ fontSize: 40 }} />;
      case "info":
        return <InfoIcon color="info" sx={{ fontSize: 40 }} />;
      default:
        return <ErrorIcon color="error" sx={{ fontSize: 40 }} />;
    }
  };

  const getSeverityColor = () => {
    switch (severity) {
      case "error":
        return "error";
      case "warning":
        return "warning";
      case "info":
        return "info";
      default:
        return "error";
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          {getIcon()}
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity={getSeverityColor()} sx={{ mb: 2 }}>
          {message}
        </Alert>

        {errorCode && (
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Error Code: <strong>{errorCode}</strong>
            </Typography>
          </Box>
        )}

        {details && (
          <Box>
            <Typography variant="body2" color="text.secondary">
              <strong>Details:</strong>
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1, fontFamily: "monospace", fontSize: "0.875rem" }}
            >
              {details}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {showRetry && onRetry && (
          <Button onClick={onRetry} variant="contained" color="primary">
            Retry
          </Button>
        )}
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
