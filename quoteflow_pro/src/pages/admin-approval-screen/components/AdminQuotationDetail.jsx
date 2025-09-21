import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import TopNavigationBar from "../../../components/ui/TopNavigationBar";
import BreadcrumbTrail from "../../../components/ui/BreadcrumbTrail";
import Button from "../../../components/ui/Button";
import SummaryMetrics from "./SummaryMetrics";
import ApproveRejectModal from "./ApproveRejectModal";
import StatusIndicator from "./StatusIndicator";
import AdminQuotationComparisonTable from "./AdminQuotationComparisonTable";
import AppIcon from "../../../components/AppIcon";
import { cn } from "../../../utils/cn";
import apiService from "../../../services/api";
import { Icon } from "lucide-react";

const AdminQuotationDetail = () => {
  const navigate = useNavigate();
  const { quotationId } = useParams();
  const { user, userType } = useAuth();
  const [isApproveRejectModalOpen, setIsApproveRejectModalOpen] =
    useState(false);
  const [approveRejectModalMode, setapproveRejectModalMode] = useState("");
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add admin approval state
  const [adminApproval, setAdminApproval] = useState({
    PROVIDED_DATA: {},
    SERVICE: {},
    TRANSPORT: {},
  });

  // Add APD state for pricing team
  const [apdNumber, setApdNumber] = useState("");
  const [isUpdatingAPD, setIsUpdatingAPD] = useState(false);

  // Use authenticated user data
  const currentUser = user;

  // Helper functions for color coding
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border border-green-200";
      case "admin_approved":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "super_admin_approved":
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
            totalPrice: item.finalTotalPrice,
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
    } else if (quotationData?.items) {
      // If no finalDecisions, initialize adminApproval with empty state for all items
      const commodityTypeRaw =
        quotationData?.commodityTypeRaw || "CommodityType.PROVIDED_DATA";
      const commodityType = commodityTypeRaw.includes(".")
        ? commodityTypeRaw.split(".")[1]
        : commodityTypeRaw;

      const decisionState = {
        PROVIDED_DATA: {},
        SERVICE: {},
        TRANSPORT: {},
      };

      quotationData.items.forEach((item) => {
        if (!decisionState[commodityType]) {
          decisionState[commodityType] = {};
        }
        decisionState[commodityType][item.id] = {
          finalPrice: 0,
          totalPrice: 0,
          finalSupplier: {
            vendorCode: "",
            vendorName: "",
            supplierId: null,
            quotationId: null,
          },
        };
      });

      console.log("Initializing adminApproval for new items:", decisionState);
      setAdminApproval(decisionState);
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
    console.log("quotationData?.apd_number:", quotationData?.apd_number);
    console.log("userType:", userType);
    console.log("=== END COMPONENT DATA DEBUG ===");
  }, [adminApproval, quotationData, items, userType]);

  const handleApprove = () => {
    setIsApproveRejectModalOpen(true);
    setapproveRejectModalMode("approve");
  };

  const handleApproveConfirm = async (approveComment) => {
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
        approval_notes: approveComment || "Approved by admin",
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

      // Call appropriate API based on user type and RFQ status
      let response;
      if (
        userType === "super_admin" &&
        quotationData?.status === "Admin Approved"
      ) {
        // Use super admin approval API for high-value RFQs
        response = await apiService.superAdminApproval(
          parseInt(quotationId),
          finalDecisionData
        );
      } else {
        // Use regular final decision API for admin approval
        response = await apiService.createFinalDecision(
          parseInt(quotationId),
          finalDecisionData
        );
      }

      console.log("Final decision created:", response);
      alert("Quotation has been approved successfully!");
      navigate("/admin-approval-screen");
    } catch (error) {
      console.error("Error approving quotation:", error);
      alert("Error approving quotation. Please try again.");
    }
  };

  const handleReject = () => {
    setIsApproveRejectModalOpen(true);
    setapproveRejectModalMode("reject");
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

      // Call appropriate API based on user type and RFQ status
      let response;
      if (
        userType === "super_admin" &&
        quotationData?.status === "admin_approved"
      ) {
        // Use super admin approval API for high-value RFQs
        response = await apiService.superAdminApproval(
          parseInt(quotationId),
          finalDecisionData
        );
      } else {
        // Use regular final decision API for admin approval
        response = await apiService.createFinalDecision(
          parseInt(quotationId),
          finalDecisionData
        );
      }

      console.log("Final decision created:", response);
      setIsApproveRejectModalOpen(false);
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

  // Handle APD number update for pricing team
  const handleAPDAttach = async () => {
    if (!apdNumber.trim()) {
      alert("Please enter an APD number");
      return;
    }

    setIsUpdatingAPD(true);
    try {
      const response = await apiService.updateRFQAPD(
        parseInt(quotationId),
        apdNumber.trim()
      );
      console.log("APD update response:", response);
      alert("APD number attached successfully!");

      // Update the quotation state with the response data
      setQuotation(response);
      setApdNumber(""); // Clear the input

      console.log("Updated quotation data:", response);
      console.log("APD number in response:", response?.apd_number);
    } catch (error) {
      console.error("Error updating APD:", error);
      alert("Error updating APD number. Please try again.");
    } finally {
      setIsUpdatingAPD(false);
    }
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

        // Auto-save changes for super admin
        if (
          userType === "super_admin" &&
          quotation.status === "admin_approved"
        ) {
          saveSupplierChanges(newState);
        }

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

      // Auto-save changes for super admin
      if (userType === "super_admin" && quotation.status === "admin_approved") {
        saveSupplierChanges(newState);
      }

      return newState;
    });
  };

  // Save supplier changes to backend for super admin
  const saveSupplierChanges = async (updatedAdminApproval) => {
    try {
      const items = Object.values(updatedAdminApproval).flatMap(
        (commodityItems) =>
          Object.entries(commodityItems).map(([itemId, itemData]) => ({
            rfq_item_id: parseInt(itemId),
            selected_supplier_id: itemData.finalSupplier?.supplierId || null,
            selected_quotation_id: itemData.finalSupplier?.quotationId || null,
            final_unit_price: itemData.finalPrice || 0,
            final_total_price: itemData.totalPrice || 0,
            supplier_code: itemData.finalSupplier?.vendorCode?.toString() || "",
            supplier_name: itemData.finalSupplier?.vendorName || "",
            decision_notes: `Updated by super admin: ${
              itemData.finalSupplier?.vendorName || "No supplier selected"
            }`,
          }))
      );

      const updateData = {
        items: items,
      };

      console.log("Saving supplier changes:", updateData);
      await apiService.updateFinalDecision(parseInt(quotationId), updateData);
      console.log("Supplier changes saved successfully");
    } catch (error) {
      console.error("Error saving supplier changes:", error);
      // Don't show alert for auto-save errors to avoid interrupting user
    }
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

          {/* User Remarks Section */}
          <div className="px-6 mb-6">
            <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <AppIcon
                    name="MessageSquare"
                    size={20}
                    className="text-blue-600"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    User Remarks
                  </p>
                  <div className="mt-2">
                    {quotationData?.user_remarks &&
                    quotationData.user_remarks.trim() !== "" ? (
                      <p className="text-sm text-foreground whitespace-pre-line">
                        {quotationData.user_remarks}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No user remarks was attached to the quotation
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
              userType={userType}
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
          <div className="mb-6">
            {" "}
            {/* Status Display Based on User Type and Approval Status */}
            {(() => {
              // Admin user logic
              if (userType === "admin") {
                if (quotation.status === "Pending") {
                  return (
                    <div className="px-6 mt-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 shadow-md">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-100">
                            <AppIcon
                              name="Clock"
                              size={20}
                              className="text-blue-600"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-blue-700">
                              Pending for Approval from Admin
                            </h3>
                            <p className="text-sm text-blue-600">
                              This RFQ is waiting for your approval decision.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else if (quotation.status === "Admin Approved") {
                  return (
                    <div className="px-6 mt-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6 shadow-md">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
                            <AppIcon
                              name="CheckCircle"
                              size={20}
                              className="text-green-600"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-green-700">
                              Approved by Admin
                            </h3>
                            <p className="text-sm text-green-600">
                              This RFQ has been approved by you and is pending
                              super admin review.
                            </p>
                          </div>
                        </div>
                        {/* Comment Section */}
                        {quotation.finalDecisions?.[0]?.approvalNotes && (
                          <div className="bg-muted rounded-lg p-4 border border-border mt-4">
                            <p className="text-sm text-foreground whitespace-pre-line">
                              {quotation.finalDecisions?.[0]?.approvalNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else if (quotation.status === "Super Admin Approved") {
                  return (
                    <div className="px-6 mt-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6 shadow-md">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
                            <AppIcon
                              name="CheckCircle"
                              size={20}
                              className="text-green-600"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-green-700">
                              Approved by Super Admin as well
                            </h3>
                            <p className="text-sm text-green-600">
                              This RFQ has been approved by both admin and super
                              admin.
                            </p>
                          </div>
                        </div>
                        {/* Comment Section */}
                        {quotation.finalDecisions?.[0]?.approvalNotes && (
                          <div className="bg-muted rounded-lg p-4 border border-border mt-4">
                            <p className="text-sm text-foreground whitespace-pre-line">
                              {quotation.finalDecisions?.[0]?.approvalNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              }

              // Super Admin user logic
              if (userType === "super_admin") {
                if (quotation.status === "Admin Approved") {
                  return (
                    <div className="px-6 mt-6">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 shadow-md">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-yellow-100">
                            <AppIcon
                              name="Clock"
                              size={20}
                              className="text-yellow-600"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-yellow-700">
                              Waiting for Final Approval
                            </h3>
                            <p className="text-sm text-yellow-600">
                              This RFQ has been approved by admin and is waiting
                              for your final approval.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else if (quotation.status === "Super Admin Approved") {
                  return (
                    <div className="px-6 mt-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6 shadow-md">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
                            <AppIcon
                              name="CheckCircle"
                              size={20}
                              className="text-green-600"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-green-700">
                              Approved by Super Admin as well
                            </h3>
                            <p className="text-sm text-green-600">
                              This RFQ has been approved by both admin and super
                              admin.
                            </p>
                          </div>
                        </div>
                        {/* Comment Section */}
                        {quotation.finalDecisions?.[0]?.approvalNotes && (
                          <div className="bg-muted rounded-lg p-4 border border-border mt-4">
                            <p className="text-sm text-foreground whitespace-pre-line">
                              {quotation.finalDecisions?.[0]?.approvalNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              }

              // Pricing Team user logic
              if (userType === "pricing_team") {
                console.log("=== PRICING TEAM STATUS DEBUG ===");
                console.log(
                  "quotationData?.apd_number:",
                  quotationData?.apd_number
                );
                console.log(
                  "APD check result:",
                  !quotationData?.apd_number || quotationData.apd_number === ""
                );
                console.log("=== END PRICING TEAM STATUS DEBUG ===");

                if (
                  !quotationData?.apd_number ||
                  quotationData.apd_number === ""
                ) {
                  return (
                    <div className="px-6 mt-6">
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 shadow-md">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-orange-100">
                            <AppIcon
                              name="FileText"
                              size={20}
                              className="text-orange-600"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-orange-700">
                              APD Number Not Assigned
                            </h3>
                            <p className="text-sm text-orange-600">
                              Please assign an APD number to this RFQ.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div className="px-6 mt-6">
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6 shadow-md">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-100">
                            <AppIcon
                              name="CheckCircle"
                              size={20}
                              className="text-green-600"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-green-700">
                              APD Number Assigned
                            </h3>
                            <p className="text-sm text-green-600">
                              APD Number:{" "}
                              <strong>{quotationData.apd_number}</strong>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              }

              // Rejected status for both user types
              if (quotation.finalDecisions?.[0]?.status === "REJECTED") {
                return (
                  <div className="px-6 mt-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-md">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-100">
                          <AppIcon
                            name="XCircle"
                            size={20}
                            className="text-red-600"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-red-700">
                            Quotation Rejected
                          </h3>
                          <p className="text-sm text-red-600">
                            This RFQ has been rejected.
                          </p>
                        </div>
                      </div>
                      {/* Comment Section */}
                      {quotation.finalDecisions?.[0]?.rejectionReason && (
                        <div className="bg-muted rounded-lg p-4 border border-border mt-4">
                          <p className="text-sm text-foreground whitespace-pre-line">
                            {quotation.finalDecisions?.[0]?.rejectionReason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return null;
            })()}
          </div>

          {/* Action Buttons */}
          {(() => {
            // Admin user logic
            if (userType === "admin") {
              // Show buttons only for pending status
              return quotation.status === "Pending";
            }

            // Super Admin user logic
            if (userType === "super_admin") {
              // Show buttons only for admin approved status
              return quotation.status === "Admin Approved";
            }

            // Pricing Team user logic
            if (userType === "pricing_team") {
              // Show APD input only if APD is not assigned
              const shouldShowAPDInput =
                !quotationData?.apd_number || quotationData.apd_number === "";
              console.log("=== PRICING TEAM ACTION DEBUG ===");
              console.log(
                "quotationData?.apd_number:",
                quotationData?.apd_number
              );
              console.log("shouldShowAPDInput:", shouldShowAPDInput);
              console.log("=== END PRICING TEAM ACTION DEBUG ===");
              return shouldShowAPDInput;
            }

            return false;
          })() && (
            <div className="px-6">
              <div className="sticky bottom-6 bg-card border border-border rounded-lg p-6 shadow-lg">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    {userType === "pricing_team" ? (
                      <>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          Assign APD Number
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Enter the APD number for this RFQ to complete the
                          process.
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-foreground mb-1">
                          {quotation.status == "admin_approved" &&
                          userType === "super_admin"
                            ? areAllVendorsSelected()
                              ? "Ready for Super Admin Decision"
                              : "Review and Select Final Vendors"
                            : areAllVendorsSelected()
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
                                  const commodityType =
                                    commodityTypeRaw.includes(".")
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
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {userType === "pricing_team" ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={apdNumber}
                            onChange={(e) => setApdNumber(e.target.value)}
                            placeholder="Enter APD Number"
                            className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            maxLength={50}
                          />
                          <Button
                            variant="default"
                            iconName="Paperclip"
                            onClick={handleAPDAttach}
                            className="px-6"
                            disabled={isUpdatingAPD || !apdNumber.trim()}
                          >
                            {isUpdatingAPD ? "Attaching..." : "Attach APD"}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      <ApproveRejectModal
        isOpen={isApproveRejectModalOpen}
        onClose={() => setIsApproveRejectModalOpen(false)}
        onRejectConfirm={handleRejectConfirm}
        onApproveConfirm={handleApproveConfirm}
        quotationId={quotationData?.id}
        mode={approveRejectModalMode}
      />
    </div>
  );
};

export default AdminQuotationDetail;

const StatusIcon = ({ status }) => {
  let iconSrc = "";
  let colorClass = "";

  switch (status) {
    case "APPROVED":
      iconSrc =
        "https://img.icons8.com/?size=100&id=sz8cPVwzLrMP&format=png&color=000000";
      colorClass = "text-green-600";
      break;
    case "REJECTED":
      iconSrc =
        "https://img.icons8.com/?size=100&id=T9nkeADgD3z6&format=png&color=000000";
      colorClass = "text-red-600";
      break;
    default:
      iconSrc =
        "https://img.icons8.com/?size=100&id=lzICmAiUWSkI&format=png&color=000000";
      colorClass = "text-gray-500";
  }

  return <img src={iconSrc} alt={status} className={`w-5 h-5 ${colorClass}`} />;
};
