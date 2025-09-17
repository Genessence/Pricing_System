import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import TopNavigationBar from "../../components/ui/TopNavigationBar";
import BreadcrumbTrail from "../../components/ui/BreadcrumbTrail";
import Button from "../../components/ui/Button";
import Icon from "../../components/AppIcon";
import apiService from "../../services/api";

const AdminApprovalScreen = () => {
  const navigate = useNavigate();
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  // Mock user data
  const currentUser = {
    id: 1,
    name: "Admin User",
    email: "admin@company.com",
    role: "Administrator",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  };

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: "info",
      title: "New Quotation Request",
      message: "RFQ-2024-008 requires your approval",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      read: false,
    },
    {
      id: 2,
      type: "warning",
      title: "High Value Transaction",
      message: "Quotation exceeds $200K threshold",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      read: false,
    },
  ];

  // Get quotation requests from backend API
  const [quotationRequests, setQuotationRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuotationRequests = async () => {
      try {
        setLoading(true);
        console.log("🔍 Loading RFQs from API for admin approval...");
        const rfqsData = await apiService.getRFQs();
        console.log("🔍 RFQs loaded for admin approval:", {
          count: rfqsData?.length || 0,
          data: rfqsData,
        });
        setQuotationRequests(rfqsData);
      } catch (error) {
        console.error("Error loading RFQs for admin approval:", error);
        setQuotationRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadQuotationRequests();

    // Refresh data every 30 seconds to catch new submissions
    const interval = setInterval(loadQuotationRequests, 30000);

    return () => clearInterval(interval);
  }, [refreshKey]);

  // Use the quotationRequests state that's loaded from localStorage
  const allQuotationRequests =
    quotationRequests.length > 0 ? quotationRequests : [];
  console.log("All quotation requests:", allQuotationRequests);

  // Force re-render when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshKey((prev) => prev + 1);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    navigate("/login-screen");
  };

  const handleViewQuotation = (quotationId) => {
    // Navigate to detailed approval screen
    navigate(`/admin-approval-screen/${quotationId}`);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleClearData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all quotation data? This is for testing purposes only."
      )
    ) {
      localStorage.removeItem("quotationRequests");
      setQuotationRequests([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending Approval":
      case "pending":
        return "bg-orange-50 text-orange-700 border border-orange-200";
      case "Approved":
      case "approved":
        return "bg-green-50 text-green-700 border border-green-200";
      case "Rejected":
      case "rejected":
        return "bg-red-50 text-red-700 border border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const getCommodityTypeColor = (commodityType) => {
    switch (commodityType) {
      case "Provided Data":
      case "provided_data":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Service":
      case "service":
        return "bg-green-50 text-green-700 border border-green-200";
      case "Transport":
      case "transport":
        return "bg-purple-50 text-purple-700 border border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  // Filter quotations based on search and status
  const filteredQuotations = allQuotationRequests.filter((quotation) => {
    const matchesSearch =
      !searchTerm ||
      quotation.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.rfq_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.user?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      quotation.user?.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      quotation.site?.site_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      quotation.site?.site_code
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      quotation.commodity_type
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      quotation.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      quotation.status === statusFilter ||
      (statusFilter === "Pending Approval" && quotation.status === "pending") ||
      (statusFilter === "Approved" && quotation.status === "approved") ||
      (statusFilter === "Rejected" && quotation.status === "rejected");

    return matchesSearch && matchesStatus;
  });

  const pendingCount = allQuotationRequests.filter(
    (q) => q.status === "Pending Approval" || q.status === "pending"
  ).length;
  const approvedCount = allQuotationRequests.filter(
    (q) => q.status === "Approved" || q.status === "approved"
  ).length;
  const rejectedCount = allQuotationRequests.filter(
    (q) => q.status === "Rejected" || q.status === "rejected"
  ).length;

  // Debug logging for admin approval screen
  React.useEffect(() => {
    console.log("🔍 Admin Approval Screen Debug:", {
      totalRFQs: allQuotationRequests?.length || 0,
      filteredRFQs: filteredQuotations?.length || 0,
      searchTerm,
      statusFilter,
      loading,
    });

    // Log first RFQ structure to understand data format
    if (allQuotationRequests && allQuotationRequests.length > 0) {
      console.log("🔍 First RFQ Data Structure (Admin):", {
        rfq: allQuotationRequests[0],
        user: allQuotationRequests[0]?.user,
        site: allQuotationRequests[0]?.site,
        quotations: allQuotationRequests[0]?.quotations,
        status: allQuotationRequests[0]?.status,
        commodity_type: allQuotationRequests[0]?.commodity_type,
      });
    }
  }, [
    allQuotationRequests,
    filteredQuotations,
    searchTerm,
    statusFilter,
    loading,
  ]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigationBar
          user={currentUser}
          notifications={notifications}
          onLogout={handleLogout}
          onNotificationRead={() => {}}
          onNotificationClear={() => {}}
        />
        <BreadcrumbTrail />
        <div className="flex items-center justify-center h-screen">
          <div className="flex items-center space-x-2">
            <Icon
              name="Loader"
              size={24}
              className="animate-spin text-primary"
            />
            <span className="text-muted-foreground">
              Loading admin approval screen...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavigationBar
        user={currentUser}
        notifications={notifications}
        onLogout={handleLogout}
        onNotificationRead={() => {}}
        onNotificationClear={() => {}}
      />
      <BreadcrumbTrail />
      <div className="pt-20 pb-8">
        {/* Header Section */}
        <div className="px-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Quotation Requests
              </h1>
              <p className="text-muted-foreground">
                Review and approve quotation requests submitted by plant members
              </p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <Button
                variant="outline"
                iconName="RefreshCw"
                onClick={handleRefresh}
                className="mr-2"
              >
                Refresh
              </Button>
              <Button
                variant="outline"
                iconName="Trash2"
                onClick={handleClearData}
                className="mr-2 text-red-600 border-red-300 hover:bg-red-50"
              >
                Clear Data
              </Button>
              <Button
                variant="outline"
                iconName="ArrowLeft"
                onClick={() => navigate("/procurement-dashboard")}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-elevated transition-smooth">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Total Requests
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {allQuotationRequests.length}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-100 text-blue-800 border border-blue-200">
                  <Icon name="FileText" size={24} strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-elevated transition-smooth">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Pending Approval
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {pendingCount}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-100 text-orange-800 border border-orange-200">
                  <Icon name="Clock" size={24} strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-elevated transition-smooth">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Approved
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {approvedCount}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-100 text-green-800 border border-green-200">
                  <Icon name="Check" size={24} strokeWidth={2} />
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 shadow-soft hover:shadow-elevated transition-smooth">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Rejected
                  </p>
                  <p className="text-2xl font-semibold text-foreground">
                    {rejectedCount}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-red-100 text-red-800 border border-red-200">
                  <Icon name="X" size={24} strokeWidth={2} />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8 shadow-soft">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Search Quotations
                </label>
                <div className="relative">
                  <Icon
                    name="Search"
                    size={20}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Search by RFQ ID, title, requester, or commodity type..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="w-full pl-12 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                  />
                </div>
              </div>
              <div className="flex flex-col lg:flex-row gap-3">
                <label className="block text-sm font-medium text-foreground mb-2 lg:mb-0 lg:mr-3 lg:self-end">
                  Filter by Status:
                </label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={statusFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusFilter("all")}
                    className="px-4 py-2 text-sm font-medium"
                  >
                    All ({allQuotationRequests.length})
                  </Button>
                  <Button
                    variant={
                      statusFilter === "Pending Approval"
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleStatusFilter("Pending Approval")}
                    className="px-4 py-2 text-sm font-medium"
                  >
                    Pending ({pendingCount})
                  </Button>
                  <Button
                    variant={
                      statusFilter === "Approved" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleStatusFilter("Approved")}
                    className="px-4 py-2 text-sm font-medium"
                  >
                    Approved ({approvedCount})
                  </Button>
                  <Button
                    variant={
                      statusFilter === "Rejected" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleStatusFilter("Rejected")}
                    className="px-4 py-2 text-sm font-medium"
                  >
                    Rejected ({rejectedCount})
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quotation Requests Table */}
        <div className="px-6">
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                      RFQ Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                      Requester
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                      Commodity Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredQuotations.reverse().map((quotation) => (
                    <tr
                      key={quotation.id}
                      className="hover:bg-muted/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-5">
                        <div>
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-sm font-bold text-foreground bg-muted px-3 py-1 rounded-lg">
                              {quotation.rfq_number || quotation.id}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-foreground mb-2 leading-tight">
                            {quotation.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {quotation.description || "No description"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            {quotation.user?.full_name ||
                              quotation.user?.username ||
                              "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {quotation.site?.site_name ||
                              quotation.site?.site_code ||
                              "Unknown Site"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {quotation.created_at
                              ? new Date(
                                  quotation.created_at
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "Unknown Date"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`px-3 py-2 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusColor(
                            quotation.status
                          )}`}
                        >
                          {quotation.status === "pending"
                            ? "Pending Review"
                            : quotation.status === "approved"
                            ? "Approved"
                            : quotation.status === "rejected"
                            ? "Rejected"
                            : quotation.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`px-3 py-2 text-xs font-semibold rounded-full whitespace-nowrap ${getCommodityTypeColor(
                            quotation.commodity_type
                          )}`}
                        >
                          {quotation.commodity_type === "provided_data"
                            ? "Provided Data"
                            : quotation.commodity_type === "service"
                            ? "Service"
                            : quotation.commodity_type === "transport"
                            ? "Transport"
                            : quotation.commodity_type || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-foreground">
                            ₹{(quotation.total_value || 0).toLocaleString()}
                          </p>
                          {/*     <p className="text-xs text-muted-foreground">{quotation.quotations?.length || 0} supplier{(quotation.quotations?.length || 0) !== 1 ? 's' : ''}</p> */}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-2">
                          {(quotation.status === "Pending Approval" ||
                            quotation.status === "pending") && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleViewQuotation(quotation.id)}
                              className="px-4 py-2 text-sm font-medium"
                            >
                              Review & Approve
                            </Button>
                          )}
                          {(quotation.status === "Approved" ||
                            quotation.status === "approved" ||
                            quotation.status === "Rejected" ||
                            quotation.status === "rejected") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewQuotation(quotation.id)}
                              className="px-4 py-2 text-sm font-medium"
                            >
                              View Details
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredQuotations.length === 0 && (
              <div className="text-center py-16">
                <div className="bg-muted rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Icon
                    name="FileText"
                    size={32}
                    className="text-muted-foreground"
                  />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No quotation requests found
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria to find what you're looking for."
                    : "No quotation requests have been submitted yet. Check back later for new requests."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminApprovalScreen;
