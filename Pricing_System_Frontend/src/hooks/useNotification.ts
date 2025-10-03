import { useContext } from "react";
import type { NotificationContextType } from "../context/NotificationContext";
import { NotificationContext } from "../context/NotificationContextInstance";

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};
