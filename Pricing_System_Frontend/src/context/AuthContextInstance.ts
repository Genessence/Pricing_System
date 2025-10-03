import { createContext } from "react";
import type { AuthContextType } from "../types";

// Create context
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
