import { createContext } from "react";
import type { NotificationContextType } from "./NotificationContext";

// Create context
export const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);
