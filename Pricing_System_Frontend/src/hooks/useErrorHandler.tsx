import { useState, useCallback, useMemo } from "react";
import { useNotification } from "./useNotification";
import { ErrorDialog } from "../components/common/ErrorDialog";
import { ServerErrorPopup } from "../components/common/ServerErrorPopup";

interface ErrorHandlerOptions {
  showDialog?: boolean;
  showNotification?: boolean;
  showServerPopup?: boolean;
  autoHideDuration?: number;
}

export const useErrorHandler = () => {
  const { showError, showWarning, showInfo } = useNotification();
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    title: "",
    message: "",
    severity: "error" as "error" | "warning" | "info",
    errorCode: "",
    details: "",
  });
  const [serverErrorPopup, setServerErrorPopup] = useState({
    open: false,
    errorCode: 500,
    errorMessage: "",
    details: "",
  });

  const handleError = useCallback(
    (error: Error | string, options: ErrorHandlerOptions = {}) => {
      const {
        showDialog = false,
        showNotification = true,
        showServerPopup = false,
      } = options;

      const errorMessage = typeof error === "string" ? error : error.message;
      const errorName = typeof error === "string" ? "Error" : error.name;

      // Show notification by default
      if (showNotification) {
        showError(errorMessage);
      }

      // Show dialog for major errors
      if (showDialog) {
        setErrorDialog({
          open: true,
          title: errorName,
          message: errorMessage,
          severity: "error",
          errorCode: "",
          details: typeof error === "object" ? error.stack || "" : "",
        });
      }

      // Show server error popup for server errors
      if (showServerPopup) {
        setServerErrorPopup({
          open: true,
          errorCode: 500,
          errorMessage: errorMessage,
          details: typeof error === "object" ? error.stack || "" : "",
        });
      }
    },
    [showError]
  );

  const handleServerError = useCallback(
    (
      errorCode: number,
      errorMessage: string,
      details?: string,
      options: ErrorHandlerOptions = {}
    ) => {
      const { showNotification = true, showServerPopup = true } = options;

      // Show notification
      if (showNotification) {
        showError(`Server Error ${errorCode}: ${errorMessage}`);
      }

      // Show server error popup for server errors
      if (showServerPopup) {
        setServerErrorPopup({
          open: true,
          errorCode,
          errorMessage,
          details: details || "",
        });
      }
    },
    [showError]
  );

  const handleWarning = useCallback(
    (message: string, options: ErrorHandlerOptions = {}) => {
      const { showDialog = false, showNotification = true } = options;

      if (showNotification) {
        showWarning(message);
      }

      if (showDialog) {
        setErrorDialog({
          open: true,
          title: "Warning",
          message,
          severity: "warning",
          errorCode: "",
          details: "",
        });
      }
    },
    [showWarning]
  );

  const handleInfo = useCallback(
    (message: string, options: ErrorHandlerOptions = {}) => {
      const { showDialog = false, showNotification = true } = options;

      if (showNotification) {
        showInfo(message);
      }

      if (showDialog) {
        setErrorDialog({
          open: true,
          title: "Information",
          message,
          severity: "info",
          errorCode: "",
          details: "",
        });
      }
    },
    [showInfo]
  );

  const closeErrorDialog = useCallback(() => {
    setErrorDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const closeServerErrorPopup = useCallback(() => {
    setServerErrorPopup((prev) => ({ ...prev, open: false }));
  }, []);

  const retryAction = useCallback(() => {
    // This can be overridden by the caller
    window.location.reload();
  }, []);

  const ErrorDialogComponent = useMemo(
    () => (
      <ErrorDialog
        {...errorDialog}
        onClose={closeErrorDialog}
        onRetry={retryAction}
        showRetry={true}
      />
    ),
    [errorDialog, closeErrorDialog, retryAction]
  );

  const ServerErrorPopupComponent = useMemo(
    () => (
      <ServerErrorPopup
        {...serverErrorPopup}
        onClose={closeServerErrorPopup}
        onRetry={retryAction}
        onGoHome={() => (window.location.href = "/dashboard")}
      />
    ),
    [serverErrorPopup, closeServerErrorPopup, retryAction]
  );

  return {
    handleError,
    handleServerError,
    handleWarning,
    handleInfo,
    closeErrorDialog,
    closeServerErrorPopup,
    retryAction,
    errorDialog,
    serverErrorPopup,
    ErrorDialogComponent,
    ServerErrorPopupComponent,
  };
};
