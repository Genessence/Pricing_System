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
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
} from "@mui/icons-material";

interface ServerErrorPopupProps {
  open: boolean;
  onClose: () => void;
  errorCode: number;
  errorMessage?: string;
  details?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
}

export const ServerErrorPopup: React.FC<ServerErrorPopupProps> = ({
  open,
  onClose,
  errorCode,
  errorMessage,
  details,
  onRetry,
  onGoHome,
}) => {
  const getErrorInfo = (code: number) => {
    switch (code) {
      case 400:
        return {
          title: "Bad Request",
          description: "The request was invalid or cannot be processed.",
          color: "warning" as const,
        };
      case 401:
        return {
          title: "Unauthorized",
          description: "You need to be logged in to access this resource.",
          color: "error" as const,
        };
      case 403:
        return {
          title: "Forbidden",
          description: "You don't have permission to access this resource.",
          color: "error" as const,
        };
      case 404:
        return {
          title: "Not Found",
          description: "The requested resource was not found.",
          color: "info" as const,
        };
      case 408:
        return {
          title: "Request Timeout",
          description: "The request took too long to complete.",
          color: "warning" as const,
        };
      case 429:
        return {
          title: "Too Many Requests",
          description:
            "You've made too many requests. Please wait before trying again.",
          color: "warning" as const,
        };
      case 500:
        return {
          title: "Internal Server Error",
          description:
            "Something went wrong on our end. Please try again later.",
          color: "error" as const,
        };
      case 502:
        return {
          title: "Bad Gateway",
          description:
            "The server received an invalid response from another server.",
          color: "error" as const,
        };
      case 503:
        return {
          title: "Service Unavailable",
          description:
            "The service is temporarily unavailable. Please try again later.",
          color: "error" as const,
        };
      case 504:
        return {
          title: "Gateway Timeout",
          description: "The server took too long to respond.",
          color: "error" as const,
        };
      default:
        return {
          title: "Server Error",
          description: "An unexpected error occurred. Please try again.",
          color: "error" as const,
        };
    }
  };

  const errorInfo = getErrorInfo(errorCode);
  const isRetryable = [408, 429, 500, 502, 503, 504].includes(errorCode);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <ErrorIcon color="error" sx={{ fontSize: 40 }} />
            <Typography variant="h6" component="div">
              {errorInfo.title}
            </Typography>
          </Box>
          <Chip
            label={`${errorCode}`}
            color={errorInfo.color}
            variant="outlined"
            size="small"
          />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity={errorInfo.color} sx={{ mb: 2 }}>
          <Typography variant="body1" fontWeight="medium">
            {errorMessage || errorInfo.description}
          </Typography>
        </Alert>

        {details && (
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2" fontWeight="medium">
                Technical Details
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {details}
              </Typography>
            </AccordionDetails>
          </Accordion>
        )}

        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            <strong>What you can do:</strong>
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            {isRetryable && (
              <Box component="li">
                <Typography variant="body2" color="text.secondary">
                  Try the action again in a few moments
                </Typography>
              </Box>
            )}
            <Box component="li">
              <Typography variant="body2" color="text.secondary">
                Check your internet connection
              </Typography>
            </Box>
            <Box component="li">
              <Typography variant="body2" color="text.secondary">
                Contact support if the problem persists
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        {onGoHome && (
          <Button
            onClick={onGoHome}
            variant="outlined"
            startIcon={<HomeIcon />}
            color="primary"
          >
            Go Home
          </Button>
        )}
        {isRetryable && onRetry && (
          <Button
            onClick={onRetry}
            variant="contained"
            startIcon={<RefreshIcon />}
            color="primary"
          >
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
