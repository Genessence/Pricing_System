import React, { useState } from "react";
import type { ReactNode } from "react";
import { Snackbar, Alert } from "@mui/material";
import type { AlertColor } from "@mui/material";
import { NotificationContext } from "./NotificationContextInstance";

interface NotificationState {
  open: boolean;
  message: string;
  severity: AlertColor;
  autoHideDuration?: number;
}

export interface NotificationContextType {
  showNotification: (
    message: string,
    severity: AlertColor,
    autoHideDuration?: number
  ) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
  hideNotification: () => void;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: "",
    severity: "info",
    autoHideDuration: 6000,
  });

  const showNotification = (
    message: string,
    severity: AlertColor,
    autoHideDuration = 6000
  ) => {
    setNotification({
      open: true,
      message,
      severity,
      autoHideDuration,
    });
  };

  const showSuccess = (message: string) => {
    showNotification(message, "success", 4000);
  };

  const showError = (message: string) => {
    showNotification(message, "error", 8000);
  };

  const showWarning = (message: string) => {
    showNotification(message, "warning", 6000);
  };

  const showInfo = (message: string) => {
    showNotification(message, "info", 5000);
  };

  const hideNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const contextValue: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <Snackbar
        open={notification.open}
        autoHideDuration={notification.autoHideDuration}
        onClose={hideNotification}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={hideNotification}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};
