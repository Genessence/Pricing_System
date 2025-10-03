import { useContext } from "react";
import type { AuthContextType } from "../types";
import { AuthContext } from "../context/AuthContextInstance";

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
