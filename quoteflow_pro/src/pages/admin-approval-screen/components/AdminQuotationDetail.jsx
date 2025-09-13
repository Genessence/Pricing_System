import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import TopNavigationBar from "../../../components/ui/TopNavigationBar";
import BreadcrumbTrail from "../../../components/ui/BreadcrumbTrail";
import Button from "../../../components/ui/Button";
import SummaryMetrics from "./SummaryMetrics";
import RejectModal from "./RejectModal";
import StatusIndicator from "./StatusIndicator";
import AdminQuotationComparisonTable from "./AdminQuotationComparisonTable";
import AppIcon from "../../../components/AppIcon";
import apiService from "../../../services/api";

const AdminQuotationDetail = () => {
  const navigate = useNavigate();
  const { quotationId } = useParams();
  const { user } = useAuth();
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add admin approval state
  const [adminApproval, setAdminApproval] = useState({
    provided_data: {},
    service: {},
    transport: {},
  });

  // Use authenticated user data
  const currentUser = user;

  // Load RFQ data from API
  useEffect(() => {
    const loadQuotation = async () => {
      try {
        console.log("Loading quotation with ID:", quotationId);
        const quotationData = await apiService.getRFQ(quotationId);
        console.log("Found quotation data:", quotationData);
        setQuotation(quotationData);
      } catch (error) {
        console.error("Error loading quotation:", error);
        // Quotation not found or error occurred
      } finally {
        setLoading(false);
      }
    };

    if (quotationId) {
      loadQuotation();
    }
  }, [quotationId]);

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: "info",
      title: "Quotation Awaiting Review",
      message: `${quotationId} requires your approval`,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      read: false,
    },
  ];

  // Use real quotation data from API
  const quotationData = quotation;

  const handleApprove = () => {
    // Handle approval logic
    console.log("Quotation approved:", quotationData?.id);
    alert("Quotation has been approved successfully!");
    navigate("/admin-approval-screen");
  };

  const handleReject = () => {
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = (rejectionReason) => {
    console.log(
      "Quotation rejected:",
      quotationData?.id,
      "Reason:",
      rejectionReason
    );
    setIsRejectModalOpen(false);
    alert("Quotation has been rejected with reason: " + rejectionReason);
    navigate("/admin-approval-screen");
  };

  const handleLogout = () => {
    navigate("/login-screen");
  };

  const totalEstimatedValue =
    quotationData?.suppliers?.reduce(
      (sum, supplier) => sum + supplier?.totalQuote,
      0
    ) || 0;
  const lowestQuote = Math.min(
    ...(quotationData?.suppliers?.map((s) => s?.totalQuote) || [0])
  );
  const highestQuote = Math.max(
    ...(quotationData?.suppliers?.map((s) => s?.totalQuote) || [0])
  );
  const averageQuote =
    totalEstimatedValue / (quotationData?.suppliers?.length || 1);

  // Transform quotation data for the comparison table format
  const transformedSuppliers =
    quotationData?.suppliers?.map((supplier, index) => ({
      id: supplier?.id || `supplier-${index}`,
      name: supplier?.name || `Supplier ${index + 1}`,
      contact: supplier?.contact || `contact@supplier${index + 1}.com`,
      rating: supplier?.rating || 4.5,
    })) || [];

  const transformedQuotes =
    quotationData?.suppliers?.map((supplier) => ({
      id: supplier?.id,
      name: supplier?.name,
      contact: supplier?.contact,
      items: supplier?.items || [],
      rates:
        supplier?.items?.reduce((acc, item) => {
          acc[item?.itemId] = item?.unitPrice || 0;
          return acc;
        }, {}) || {},
      footer: {
        transportation_freight: supplier?.transportationFreight || "Included in quote",
        packing_charges: supplier?.packagingCharges || "Extra as applicable",
        delivery_lead_time: supplier?.deliveryLeadTime || "As per agreement",
        warranty: supplier?.warranty || "Standard warranty",
        currency: supplier?.currency || "INR",
        remarks_of_quotation: supplier?.termsConditions || "All terms as per RFQ",
      },
    })) || [];

  // Add handlers for admin approval fields
  const handleFinalSupplierChange = (itemId, field, value) => {
    const commodityType =
      quotationData?.commodityTypeRaw || "provided_data";
    console.log("handleFinalSupplierChange called:", {
      itemId,
      field,
      value,
      commodityType,
    });
    setAdminApproval((prev) => ({
      ...prev,
      [commodityType]: {
        ...prev?.[commodityType],
        [itemId]: {
          ...prev?.[commodityType]?.[itemId],
          finalSupplier: value,
        },
      },
    }));
  };

  const handleFinalPriceChange = (itemId, value) => {
    const commodityType =
      quotationData?.commodityTypeRaw || "provided_data";
    console.log("handleFinalPriceChange called:", {
      itemId,
      value,
      commodityType,
    });
    console.log("Current adminApproval state:", adminApproval);
    setAdminApproval((prev) => {
      const newState = {
        ...prev,
        [commodityType]: {
          ...prev?.[commodityType],
          [itemId]: {
            ...prev?.[commodityType]?.[itemId],
            finalPrice: value,
          },
        },
      };
      console.log("New adminApproval state:", newState);
      return newState;
    });
  };

  // Calculate sum amount based on quantity and final price
  const calculateSumAmount = (itemId, quantity) => {
    const commodityType =
      quotationData?.commodityTypeRaw || "provided_data";
    const finalPrice =
      adminApproval?.[commodityType]?.[itemId]?.finalPrice || 0;
    return (parseFloat(finalPrice) * quantity)?.toFixed(2);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigationBar user={currentUser} />
        <div className="flex items-center justify-center h-screen">
          <div className="flex items-center space-x-2">
            <AppIcon
              name="Loader"
              size={24}
              className="animate-spin text-primary"
            />
            <span className="text-muted-foreground">
              Loading quotation details...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Error state - quotation not found
  if (!quotation) {
    return (
      <div className="min-h-screen bg-background">
        <TopNavigationBar user={currentUser} />
        <div className="pt-20">
          <div className="container mx-auto px-6 py-8">
            <div className="text-center">
              <AppIcon
                name="AlertCircle"
                size={48}
                className="mx-auto text-red-500 mb-4"
              />
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Quotation Not Found
              </h1>
              <p className="text-muted-foreground mb-6">
                The quotation you're looking for doesn't exist or has been
                removed.
              </p>
              <button
                onClick={() => navigate("/admin-approval-screen")}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <AppIcon name="ArrowLeft" size={16} className="mr-2" />
                Back to Approval Screen
              </button>
            </div>
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
      <div className="pt-20">
        <BreadcrumbTrail
          customBreadcrumbs={[
            {
              label: "Dashboard",
              path: "/procurement-dashboard",
              icon: "BarChart3",
            },
            {
              label: "Quotation Requests",
              path: "/admin-approval-screen",
              icon: "FileText",
            },
            {
              label: `Review ${quotationId}`,
              path: `/admin-approval-screen/${quotationId}`,
              icon: "Eye",
              current: true,
            },
          ]}
        />
        <div className="pt-4 pb-8">
          {/* Header Section */}
          <div className="px-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Review Quotation
                </h1>
                <p className="text-muted-foreground">
                  Review quotation details and make approval decisions
                </p>
              </div>
              <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                <Button
                  variant="outline"
                  iconName="ArrowLeft"
                  onClick={() => navigate("/admin-approval-screen")}
                >
                  Back to Requests
                </Button>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="px-6 mb-6">
            <StatusIndicator
              status={quotationData?.status}
              submissionTime={quotationData?.submissionTime}
            />
          </div>

          {/* Attached Documents Section */}
          {(quotationData?.attachments?.boqFile ||
            quotationData?.attachments?.drawingFile ||
            quotationData?.attachments?.quoteFiles) && (
            <div className="px-6 mb-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  Attached Documents
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Service Documents */}
                  {quotationData?.commodityType === "Service" && (
                    <>
                      {quotationData?.attachments?.boqFile && (
                        <div className="p-4 border border-border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <AppIcon
                              name="FileText"
                              size={16}
                              className="text-blue-600"
                            />
                            <span className="text-sm font-medium text-foreground">
                              Signed BOQ
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {quotationData.attachments.boqFile.name}
                          </p>
                        </div>
                      )}
                      {quotationData?.attachments?.drawingFile && (
                        <div className="p-4 border border-border rounded-lg">
                          <div className="flex items-center space-x-2 mb-2">
                            <AppIcon
                              name="FileText"
                              size={16}
                              className="text-green-600"
                            />
                            <span className="text-sm font-medium text-foreground">
                              Signed Drawing
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {quotationData.attachments.drawingFile.name}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Quote Files */}
                  {quotationData?.attachments?.quoteFiles &&
                    Object.keys(quotationData.attachments.quoteFiles)
                      .length > 0 && (
                      <div className="p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <AppIcon
                            name="FileText"
                            size={16}
                            className="text-purple-600"
                          />
                          <span className="text-sm font-medium text-foreground">
                            Quote Attachments
                          </span>
                        </div>
                        <div className="space-y-1">
                          {Object.entries(
                            quotationData.attachments.quoteFiles
                          ).map(([index, file]) => (
                            <p
                              key={index}
                              className="text-xs text-muted-foreground"
                            >
                              Quote {parseInt(index) + 1}: {file.name}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Quotation Comparison Table */}
          <div className="px-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Quotation Comparison
              </h2>
              <span className="text-sm text-muted-foreground">
                Same view as created by quotation requesting team
              </span>
            </div>
            <AdminQuotationComparisonTable
              suppliers={transformedSuppliers}
              items={quotationData?.items}
              quotes={transformedQuotes}
              commodityType={quotationData?.commodityType}
              adminApproval={adminApproval}
              onFinalSupplierChange={handleFinalSupplierChange}
              onFinalPriceChange={handleFinalPriceChange}
              calculateSumAmount={calculateSumAmount}
            />
          </div>

          {/* <div className="px-6 mb-6">
          <SummaryMetrics 
            lowestQuote={lowestQuote}
            highestQuote={highestQuote}
            averageQuote={averageQuote}
            suppliersCount={mockQuotationData?.suppliers?.length}
          />
        </div> */}

          {/* Action Buttons */}
          <div className="px-6">
            <div className="sticky bottom-6 bg-card border border-border rounded-lg p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Ready for Decision
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Review all quotation details above before making your
                    decision
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="destructive"
                    iconName="X"
                    onClick={handleReject}
                    className="px-8"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="default"
                    iconName="Check"
                    onClick={handleApprove}
                    className="px-8"
                  >
                    Approve
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
        quotationId={quotationData?.id}
      />
    </div>
  );
};

export default AdminQuotationDetail;
