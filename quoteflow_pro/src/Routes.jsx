import React from "react";
import {
  BrowserRouter,
  Routes as RouterRoutes,
  Route,
  Navigate,
} from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import ProtectedRoute from "components/ProtectedRoute";
import LoginScreen from "./pages/login-screen";

import QuotationComparisonTable from "./pages/quotation-comparison-table";
import ProcurementDashboard from "./pages/procurement-dashboard";
import AdminApprovalScreen from "./pages/admin-approval-screen";
import AdminQuotationDetail from "./pages/admin-approval-screen/components/AdminQuotationDetail";
import UserDashboard from "./pages/user-dashboard";
import UserQuotationDetail from "./pages/user-dashboard/components/UserQuotationDetail";

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginScreen />} />

          {/* Protected Routes - User Access */}
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute allowedUserTypes={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-dashboard/:quotationId"
            element={
              <ProtectedRoute allowedUserTypes={["user"]}>
                <UserQuotationDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotation-comparison-table"
            element={
              <ProtectedRoute
                allowedUserTypes={[
                  "user",
                  "admin",
                  "super_admin",
                  "pricing_team",
                ]}
              >
                <QuotationComparisonTable />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes - Admin and Super Admin Only */}
          <Route
            path="/procurement-dashboard"
            element={
              <ProtectedRoute
                allowedUserTypes={["admin", "super_admin", "pricing_team"]}
              >
                <ProcurementDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-approval-screen"
            element={
              <ProtectedRoute
                allowedUserTypes={["admin", "super_admin", "pricing_team"]}
              >
                <AdminApprovalScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-approval-screen/:quotationId"
            element={
              <ProtectedRoute
                allowedUserTypes={["admin", "super_admin", "pricing_team"]}
              >
                <AdminQuotationDetail />
              </ProtectedRoute>
            }
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
