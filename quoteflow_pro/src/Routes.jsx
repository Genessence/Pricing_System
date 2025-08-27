import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import LoginScreen from './pages/login-screen';

import QuotationComparisonTable from './pages/quotation-comparison-table';
import ProcurementDashboard from './pages/procurement-dashboard';
import AdminApprovalScreen from './pages/admin-approval-screen';
import AdminQuotationDetail from './pages/admin-approval-screen/components/AdminQuotationDetail';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<LoginScreen />} />
        <Route path="/login-screen" element={<LoginScreen />} />

        <Route path="/quotation-comparison-table" element={<QuotationComparisonTable />} />
        <Route path="/procurement-dashboard" element={<ProcurementDashboard />} />
        <Route path="/admin-approval-screen" element={<AdminApprovalScreen />} />
        <Route path="/admin-approval-screen/:quotationId" element={<AdminQuotationDetail />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;