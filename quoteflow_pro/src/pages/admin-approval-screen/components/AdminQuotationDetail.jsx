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
import { cn } from "../../../utils/cn";
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
    PROVIDED_DATA: {},
    SERVICE: {},
    TRANSPORT: {},
  });

  // Use authenticated user data
  const currentUser = user;

  // Helper functions for color coding
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getCommodityTypeColor = (type) => {
    switch (type) {
      case "provided_data":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "service":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "transport":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

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
  const items = quotationData?.items || [];

  // Load existing final decisions if any
  useEffect(() => {
    if (
      quotationData?.finalDecisions &&
      quotationData.finalDecisions.length > 0
    ) {
      const latestDecision =
        quotationData.finalDecisions[quotationData.finalDecisions.length - 1];
      if (latestDecision?.items) {
        const decisionState = {
          PROVIDED_DATA: {},
          SERVICE: {},
          TRANSPORT: {},
        };
        latestDecision.items.forEach((item) => {
          const commodityTypeRaw =
            quotationData?.commodityTypeRaw || "CommodityType.PROVIDED_DATA";
          const commodityType = commodityTypeRaw.includes(".")
            ? commodityTypeRaw.split(".")[1]
            : commodityTypeRaw;
          if (!decisionState[commodityType]) {
            decisionState[commodityType] = {};
          }
          decisionState[commodityType][item.itemId] = {
            finalPrice: item.finalUnitPrice,
            finalSupplier: {
              vendorCode: item.supplierCode,
              vendorName: item.supplierName,
              supplierId: null, // Will be populated if needed
              quotationId: null, // Will be populated if needed
            },
          };
        });
        console.log("Loading existing final decisions:", decisionState);
        setAdminApproval(decisionState);
      }
    }
  }, [quotationData]);

  // Debug: Log current adminApproval state and data
  useEffect(() => {
    console.log("=== COMPONENT DATA DEBUG ===");
    console.log("quotationData:", quotationData);
    console.log("items:", items);
    console.log("Current adminApproval state:", adminApproval);
    console.log(
      "quotationData?.commodityTypeRaw:",
      quotationData?.commodityTypeRaw
    );
    console.log("=== END COMPONENT DATA DEBUG ===");
  }, [adminApproval, quotationData, items]);

  const handleApprove = async () => {
    try {
      // Prepare final decision data
      const finalDecisionData = {
        rfq_id: parseInt(quotationId),
        status: "APPROVED",
        total_approved_amount:
          items?.reduce((total, item) => {
            const commodityTypeRaw =
              quotationData?.commodityTypeRaw || "CommodityType.PROVIDED_DATA";
            const commodityType = commodityTypeRaw.includes(".")
              ? commodityTypeRaw.split(".")[1]
              : commodityTypeRaw;
            const totalPrice =
              adminApproval?.[commodityType]?.[item?.id]?.totalPrice || 0;
            return total + parseFloat(totalPrice);
          }, 0) || 0,
        currency: quotationData?.currency || "INR",
        approval_notes: "Approved by admin",
        items:
          items?.map((item) => {
            const commodityTypeRaw =
              quotationData?.commodityTypeRaw || "CommodityType.PROVIDED_DATA";
            const commodityType = commodityTypeRaw.includes(".")
              ? commodityTypeRaw.split(".")[1]
              : commodityTypeRaw;
            const finalPrice =
              adminApproval?.[commodityType]?.[item?.id]?.finalPrice || 0;
            const totalPrice =
              adminApproval?.[commodityType]?.[item?.id]?.totalPrice || 0;
            const supplierData =
              adminApproval?.[commodityType]?.[item?.id]?.finalSupplier || {};

            return {
              rfq_item_id: parseInt(item?.id) || 0,
              selected_supplier_id: supplierData?.supplierId
                ? parseInt(supplierData.supplierId)
                : null,
              selected_quotation_id: supplierData?.quotationId
                ? parseInt(supplierData.quotationId)
                : null,
              final_unit_price: parseFloat(finalPrice) || 0,
              final_total_price: parseFloat(totalPrice) || 0,
              supplier_code: supplierData?.vendorCode.toString() || "",
              supplier_name: supplierData?.vendorName || "",
              decision_notes: `Approved with total price: ${totalPrice}`,
            };
          }) || [],
      };

      // Debug logging
      console.log("Final decision data being sent:", finalDecisionData);
      console.log("Items being sent:", finalDecisionData.items);

      // Call API to create final decision
      const response = await apiService.createFinalDecision(
        parseInt(quotationId),
        finalDecisionData
      );

      console.log("Final decision created:", response);
      alert("Quotation has been approved successfully!");
      navigate("/admin-approval-screen");
    } catch (error) {
      console.error("Error approving quotation:", error);
      alert("Error approving quotation. Please try again.");
    }
  };

  const handleReject = () => {
    setIsRejectModalOpen(true);
  };

  const handleRejectConfirm = async (rejectionReason) => {
    try {
      // Prepare final decision data for rejection
      const finalDecisionData = {
        rfq_id: parseInt(quotationId),
        status: "REJECTED",
        total_approved_amount: 0,
        currency: quotationData?.currency || "INR",
        rejection_reason: rejectionReason,
        items:
          items?.map((item) => ({
            rfq_item_id: item?.id,
            selected_supplier_id: null,
            selected_quotation_id: null,
            final_unit_price: 0,
            final_total_price: 0,
            supplier_code: "",
            supplier_name: "",
            decision_notes: `Rejected: ${rejectionReason}`,
          })) || [],
      };

      // Call API to create final decision
      const response = await apiService.createFinalDecision(
        parseInt(quotationId),
        finalDecisionData
      );

      console.log("Final decision created:", response);
      setIsRejectModalOpen(false);
      alert("Quotation has been rejected with reason: " + rejectionReason);
      navigate("/admin-approval-screen");
    } catch (error) {
      console.error("Error rejecting quotation:", error);
      alert("Error rejecting quotation. Please try again.");
    }
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
        transportation_freight:
          supplier?.transportationFreight || "Included in quote",
        packing_charges: supplier?.packagingCharges || "Extra as applicable",
        delivery_lead_time: supplier?.deliveryLeadTime || "As per agreement",
        warranty: supplier?.warranty || "Standard warranty",
        currency: supplier?.currency || "INR",
        remarks_of_quotation:
          supplier?.termsConditions || "All terms as per RFQ",
      },
    })) || [];

  // Add handlers for admin approval fields
  const handleFinalSupplierChange = (itemId, field, value) => {
    // Extract commodity type from the raw format (e.g., "CommodityType.PROVIDED_DATA" -> "PROVIDED_DATA")
    const commodityTypeRaw =
      quotationData?.commodityTypeRaw || "CommodityType.PROVIDED_DATA";
    const commodityType = commodityTypeRaw.includes(".")
      ? commodityTypeRaw.split(".")[1]
      : commodityTypeRaw;

    console.log("=== handleFinalSupplierChange DEBUG ===");
    console.log("itemId:", itemId);
    console.log("field:", field);
    console.log("value:", value);
    console.log("commodityType:", commodityType);
    console.log("Current adminApproval:", adminApproval);
    console.log("quotationData suppliers:", quotationData?.suppliers);

    // If selecting a vendor, automatically populate price and supplier details
    if (field === "vendorName" && value) {
      const selectedSupplier = quotationData?.suppliers?.find(
        (s) => s?.name === value
      );
      console.log("Selected supplier:", selectedSupplier);

      if (selectedSupplier) {
        const supplierItem = selectedSupplier?.items?.find(
          (item) => item?.itemId === itemId
        );
        console.log("Supplier item for this RFQ item:", supplierItem);

        const unitPrice = supplierItem?.unitPrice || 0;
        const quantity =
          items?.find((i) => i?.id === itemId)?.quantity ||
          items?.find((i) => i?.id === itemId)?.requiredQuantity ||
          1;
        const totalPrice = unitPrice * quantity;

        console.log("Calculated values:", { unitPrice, quantity, totalPrice });

        setAdminApproval((prev) => {
          const newState = {
            ...prev,
            [commodityType]: {
              ...prev?.[commodityType],
              [itemId]: {
                ...prev?.[commodityType]?.[itemId],
                finalSupplier: {
                  vendorCode: selectedSupplier?.id || "",
                  vendorName: value,
                  supplierId: selectedSupplier?.id,
                  quotationId: null,
                },
                finalPrice: unitPrice,
                totalPrice: totalPrice,
              },
            },
          };
          console.log("NEW STATE AFTER UPDATE:", newState);
          return newState;
        });
      }
    } else {
      // Handle other fields
      setAdminApproval((prev) => {
        const newState = {
          ...prev,
          [commodityType]: {
            ...prev?.[commodityType],
            [itemId]: {
              ...prev?.[commodityType]?.[itemId],
              finalSupplier: {
                ...prev?.[commodityType]?.[itemId]?.finalSupplier,
                [field]: value,
              },
            },
          },
        };
        console.log("NEW STATE (other field):", newState);
        return newState;
      });
    }
    console.log("=== END DEBUG ===");
  };

  const handleFinalPriceChange = (itemId, value) => {
    // Extract commodity type from the raw format (e.g., "CommodityType.PROVIDED_DATA" -> "PROVIDED_DATA")
    const commodityTypeRaw =
      quotationData?.commodityTypeRaw || "CommodityType.PROVIDED_DATA";
    const commodityType = commodityTypeRaw.includes(".")
      ? commodityTypeRaw.split(".")[1]
      : commodityTypeRaw;

    const quantity =
      items?.find((i) => i?.id === itemId)?.quantity ||
      items?.find((i) => i?.id === itemId)?.requiredQuantity ||
      1;
    const unitPrice = parseFloat(value) / quantity; // Convert total price back to unit price

    setAdminApproval((prev) => {
      const newState = {
        ...prev,
        [commodityType]: {
          ...prev?.[commodityType],
          [itemId]: {
            ...prev?.[commodityType]?.[itemId],
            finalPrice: unitPrice,
            totalPrice: parseFloat(value) || 0,
          },
        },
      };
      return newState;
    });
  };

  // Check if all items have vendors selected
  const areAllVendorsSelected = () => {
    // Extract commodity type from the raw format (e.g., "CommodityType.PROVIDED_DATA" -> "PROVIDED_DATA")
    const commodityTypeRaw =
      quotationData?.commodityTypeRaw || "CommodityType.PROVIDED_DATA";
    const commodityType = commodityTypeRaw.includes(".")
      ? commodityTypeRaw.split(".")[1]
      : commodityTypeRaw;

    console.log("=== areAllVendorsSelected DEBUG ===");
    console.log("commodityTypeRaw:", commodityTypeRaw);
    console.log("commodityType:", commodityType);
    console.log("items:", items);
    console.log("adminApproval:", adminApproval);

    const result = items?.every((item) => {
      const itemApproval = adminApproval?.[commodityType]?.[item?.id];
      const hasVendor =
        itemApproval?.finalSupplier?.vendorName &&
        itemApproval?.finalSupplier?.vendorName.trim() !== "";
      console.log(`Item ${item?.id}:`, {
        itemApproval,
        vendorName: itemApproval?.finalSupplier?.vendorName,
        hasVendor,
      });
      return hasVendor;
    });

    console.log("Final result:", result);
    console.log("=== END areAllVendorsSelected DEBUG ===");
    return result;
  };

  // Calculate sum amount based on total price
  const calculateSumAmount = (itemId, quantity) => {
    // Extract commodity type from the raw format (e.g., "CommodityType.PROVIDED_DATA" -> "PROVIDED_DATA")
    const commodityTypeRaw =
      quotationData?.commodityTypeRaw || "CommodityType.PROVIDED_DATA";
    const commodityType = commodityTypeRaw.includes(".")
      ? commodityTypeRaw.split(".")[1]
      : commodityTypeRaw;
    const totalPrice =
      adminApproval?.[commodityType]?.[itemId]?.totalPrice || 0;
    return parseFloat(totalPrice)?.toFixed(2);
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

          {/* Quotation Overview */}
          <div className="px-6 mb-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <AppIcon name="Hash" size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Request ID
                    </p>
                    <p className="text-lg font-semibold text-foreground">
                      {quotationData?.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <AppIcon
                      name="Package"
                      size={20}
                      className="text-purple-600"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Commodity Type
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1",
                        getCommodityTypeColor(quotationData?.commodityType)
                      )}
                    >
                      {quotationData?.commodityType}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <AppIcon
                      name="CheckCircle"
                      size={20}
                      className="text-green-600"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Status
                    </p>
                    <span
                      className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1",
                        getStatusColor(quotationData?.status)
                      )}
                    >
                      {quotationData?.status}
                    </span>
                  </div>
                </div>
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
                    Object.keys(quotationData.attachments.quoteFiles).length >
                      0 && (
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
              commodityTypeKey={
                quotationData?.commodityTypeRaw?.includes(".")
                  ? quotationData.commodityTypeRaw.split(".")[1]
                  : quotationData?.commodityTypeRaw || "PROVIDED_DATA"
              }
              adminApproval={adminApproval}
              onFinalSupplierChange={handleFinalSupplierChange}
              onFinalPriceChange={handleFinalPriceChange}
              calculateSumAmount={calculateSumAmount}
              quotation={quotation}
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
          {quotation.finalDecisions[0]?.status == "APPROVED" ? (
            <></>
          ) : (
            <div className="px-6">
              <div className="sticky bottom-6 bg-card border border-border rounded-lg p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {areAllVendorsSelected()
                        ? "Ready for Decision"
                        : "Select Vendors for All Items"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {areAllVendorsSelected()
                        ? "All vendors selected. Review all quotation details above before making your decision"
                        : `Please select vendors for ${
                            items?.length -
                            items?.filter((item) => {
                              const commodityTypeRaw =
                                quotationData?.commodityTypeRaw ||
                                "CommodityType.PROVIDED_DATA";
                              const commodityType = commodityTypeRaw.includes(
                                "."
                              )
                                ? commodityTypeRaw.split(".")[1]
                                : commodityTypeRaw;
                              const itemApproval =
                                adminApproval?.[commodityType]?.[item?.id];
                              return (
                                itemApproval?.finalSupplier?.vendorName &&
                                itemApproval?.finalSupplier?.vendorName.trim() !==
                                  ""
                              );
                            }).length
                          } remaining item(s)`}
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
                      disabled={!areAllVendorsSelected()}
                    >
                      Approve
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
