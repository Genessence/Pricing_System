import React from "react";
import AppIcon from "../../../components/AppIcon";

const AdminQuotationComparisonTable = ({
  suppliers = [],
  items = [],
  quotes = [],
  commodityType = "Provided Data",
  commodityTypeKey = "PROVIDED_DATA", // Passed from parent component
  adminApproval = {},
  onFinalSupplierChange,
  onFinalPriceChange,
  calculateSumAmount,
  quotation,
}) => {
  const getSupplierName = (supplierId) => {
    const supplier = suppliers?.find((s) => s?.id === supplierId);
    return supplier ? supplier?.name : "Unknown Supplier";
  };

  const calculateAmount = (rate, quantity) => {
    return (rate * quantity)?.toFixed(2);
  };

  const calculateTotalAmount = (quoteIndex) => {
    return items?.reduce((total, item) => {
      const quote = quotes?.[quoteIndex];
      const itemQuote = quote?.items?.find((qi) => qi?.itemId === item?.id);
      const rate = itemQuote?.unitPrice || 0;
      return total + rate * item?.quantity;
    }, 0);
  };

  // Footer row configurations (read-only display)
  const footerRows = [
    { label: "Transportation/Freight", key: "transportation_freight" },
    { label: "Packing Charges", key: "packing_charges" },
    { label: "Delivery Lead Time", key: "delivery_lead_time" },
    { label: "Warranty", key: "warranty" },
    { label: "Currency", key: "currency" },
    { label: "Remarks of Quotation", key: "remarks_of_quotation" },
  ];

  if (!items?.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center">
        <AppIcon
          name="Table"
          size={48}
          className="mx-auto mb-4 text-muted-foreground"
        />
        <p className="text-muted-foreground">No quotation data available</p>
      </div>
    );
  }

  // Render different table formats based on commodity type
  const renderProvidedDataTable = () => (
    <table className="w-full min-w-max">
      {/* Table Header */}
      <thead className="bg-muted border-b border-border sticky top-0 z-20">
        <tr>
          {/* Fixed Left Column Headers - Matching user form structure */}
          <th className="p-2 text-left bg-card sticky left-0 z-30 border-r border-border min-w-32">
            <div className="flex items-center space-x-1">
              <AppIcon name="Package" size={14} />
              <span className="text-xs font-semibold text-foreground">
                Item
              </span>
            </div>
          </th>

          <th className="p-2 text-left bg-card sticky left-32 z-30 border-r border-border min-w-48">
            <div className="flex items-center space-x-1">
              <AppIcon name="FileText" size={14} />
              <span className="text-xs font-semibold text-foreground">
                Description
              </span>
            </div>
          </th>

          <th className="p-2 text-left bg-card sticky left-80 z-30 border-r border-border min-w-48">
            <div className="flex items-center space-x-1">
              <AppIcon name="FileText" size={14} />
              <span className="text-xs font-semibold text-foreground">
                Specs
              </span>
            </div>
          </th>

          <th className="p-2 text-left bg-card sticky left-128 z-30 border-r border-border min-w-20">
            <div className="flex items-center space-x-1">
              <AppIcon name="Hash" size={14} />
              <span className="text-xs font-semibold text-foreground">Qty</span>
            </div>
          </th>

          <th className="p-2 text-left bg-card sticky left-148 z-30 border-r border-border min-w-20">
            <div className="flex items-center space-x-1">
              <AppIcon name="Ruler" size={14} />
              <span className="text-xs font-semibold text-foreground">UOM</span>
            </div>
          </th>

          <th className="p-2 text-left bg-card sticky left-168 z-30 border-r border-border min-w-32">
            <div className="flex items-center space-x-1">
              <AppIcon name="DollarSign" size={14} />
              <span className="text-xs font-semibold text-foreground">
                Last Price
              </span>
            </div>
          </th>

          <th className="p-2 text-left bg-card sticky left-200 z-30 border-r border-border min-w-40">
            <div className="flex items-center space-x-1">
              <AppIcon name="Building2" size={14} />
              <span className="text-xs font-semibold text-foreground">
                Last Vendor
              </span>
            </div>
          </th>

          {/* Dynamic Quote Column Headers */}
          {quotes?.map((quote, index) => (
            <th
              key={quote?.name}
              className="p-2 text-left border-r border-border min-w-48"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-1">
                  <AppIcon name="Quote" size={12} className="text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    Quote {index + 1}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {quote?.name}
                </div>
              </div>
            </th>
          ))}

          {/* Admin Final Decision Column */}
          <th className="p-2 text-left bg-muted/20 min-w-48">
            <div className="space-y-1">
              <div className="flex items-center space-x-1">
                <AppIcon
                  name="CheckCircle"
                  size={12}
                  className="text-green-600"
                />
                <span className="text-xs font-semibold text-foreground">
                  Final Decision
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Admin Approval
              </div>
            </div>
          </th>
        </tr>
      </thead>

      {/* Table Body */}
      <tbody>
        {items?.map((item, itemIndex) => (
          <tr
            key={item?.item_code || itemIndex}
            className="border-b border-border hover:bg-muted/50"
          >
            {/* Fixed Left Columns */}
            <td className="p-2 bg-card sticky left-0 z-10 border-r border-border min-w-36">
              <div className="text-xs font-medium text-foreground">
                {item?.item_code}
              </div>
            </td>

            <td className="p-2 bg-card sticky left-36 z-10 border-r border-border min-w-36">
              <div className="text-xs font-medium text-foreground">
                {item?.description}
              </div>
            </td>

            <td className="p-2 bg-card sticky left-144 z-10 border-r border-border min-w-48">
              <div className="text-xs text-muted-foreground">
                {item?.specifications}
              </div>
            </td>

            <td className="p-2 bg-card sticky left-192 z-10 border-r border-border min-w-24">
              <div className="text-xs font-medium text-foreground">
                {item?.quantity}
              </div>
            </td>

            <td className="p-2 bg-card sticky left-216 z-10 border-r border-border min-w-24">
              <div className="text-xs text-muted-foreground">
                {item?.unitOfMeasure}
              </div>
            </td>

            <td className="p-2 bg-card sticky left-240 z-10 border-r border-border min-w-32">
              <div className="text-xs font-medium text-foreground">
                {item?.lastBuyingPrice
                  ? `₹${item?.lastBuyingPrice?.toLocaleString()}`
                  : "N/A"}
              </div>
            </td>

            <td className="p-2 bg-card sticky left-272 z-10 border-r border-border min-w-48">
              <div className="text-xs text-muted-foreground">
                {item?.lastVendor || "N/A"}
              </div>
            </td>

            {/* Dynamic Quote Columns */}
            {quotes?.map((quote, quoteIndex) => {
              const itemQuote = quote?.items?.find(
                (qi) => qi?.itemId === item?.id
              );
              const rate =
                itemQuote?.unitPrice || quote?.rates?.[item?.id] || 0;
              const totalPrice = rate * item?.quantity;
              return (
                <td
                  key={quoteIndex}
                  className="p-2 border-r border-border min-w-48"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-primary">
                      ₹{rate?.toLocaleString() || "0"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total: ₹{totalPrice?.toLocaleString() || "0"}
                    </div>
                    {itemQuote?.deliveryTime && (
                      <div className="text-xs text-muted-foreground">
                        Delivery: {itemQuote.deliveryTime}
                      </div>
                    )}
                    {itemQuote?.warranty && (
                      <div className="text-xs text-muted-foreground">
                        Warranty: {itemQuote.warranty}
                      </div>
                    )}
                  </div>
                </td>
              );
            })}

            {/* Admin Final Decision Column */}
            <td className="p-2 bg-muted/5 min-w-48">
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Final Total Price (₹)
                  </label>
                  <input
                    disabled={quotation.finalDecisions[0]?.status == "APPROVED"}
                    type="number"
                    value={
                      quotation.finalDecisions[0]?.items[itemIndex]
                        .finalTotalPrice
                        ? quotation.finalDecisions[0].items[itemIndex]
                            .finalTotalPrice
                        : adminApproval?.[commodityTypeKey]?.[item?.id]
                            ?.totalPrice || ""
                    }
                    onChange={(e) =>
                      onFinalPriceChange(item?.id, e.target.value)
                    }
                    className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Select Vendor
                  </label>
                  <select
                    value={
                      quotation.finalDecisions[0]?.items[itemIndex].supplierName
                        ? quotation.finalDecisions[0].items[itemIndex]
                            .supplierName
                        : adminApproval?.[commodityTypeKey]?.[item?.id]
                            ?.finalSupplier?.vendorName || ""
                    }
                    disabled={quotation.finalDecisions[0]?.status == "APPROVED"}
                    onChange={(e) => {
                      onFinalSupplierChange(
                        item?.id,
                        "vendorName",
                        e.target.value
                      );
                    }}
                    className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Vendor</option>
                    {suppliers?.map((supplier, index) => (
                      <option
                        key={supplier?.id || index}
                        value={supplier?.name}
                      >
                        {supplier?.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-xs text-muted-foreground">
                  Total: ₹
                  {calculateSumAmount
                    ? calculateSumAmount(item?.id, item?.quantity)
                    : "0"}
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>

      {/* Footer Rows */}
      <tfoot className="bg-muted/20 border-t border-border">
        {/* Transportation/Freight Row */}
        <tr className="bg-muted/30 font-medium">
          <td
            colSpan={7}
            className="p-2 bg-card sticky left-0 z-10 border-r border-border"
          >
            <div className="text-xs text-foreground">
              Transportation/Freight
            </div>
          </td>
          {quotes?.map((quote, index) => (
            <td
              key={index}
              className="p-2 text-center border-r border-border min-w-48"
            >
              <div className="text-xs text-foreground">
                {quote?.footer?.transportation_freight || "-"}
              </div>
            </td>
          ))}
          <td className="p-2 bg-muted/5 min-w-48">
            <div className="text-xs text-foreground">-</div>
          </td>
        </tr>

        {/* Packing Charges Row */}
        <tr className="bg-muted/20 font-medium">
          <td
            colSpan={7}
            className="p-2 bg-card sticky left-0 z-10 border-r border-border"
          >
            <div className="text-xs text-foreground">Packing Charges</div>
          </td>
          {quotes?.map((quote, index) => (
            <td
              key={index}
              className="p-2 text-center border-r border-border min-w-48"
            >
              <div className="text-xs text-foreground">
                {quote?.footer?.packing_charges || "-"}
              </div>
            </td>
          ))}
          <td className="p-2 bg-muted/5 min-w-48">
            <div className="text-xs text-foreground">-</div>
          </td>
        </tr>

        {/* Delivery Lead Time Row */}
        <tr className="bg-muted/30 font-medium">
          <td
            colSpan={7}
            className="p-2 bg-card sticky left-0 z-10 border-r border-border"
          >
            <div className="text-xs text-foreground">Delivery Lead Time</div>
          </td>
          {quotes?.map((quote, index) => (
            <td
              key={index}
              className="p-2 text-center border-r border-border min-w-48"
            >
              <div className="text-xs text-foreground">
                {quote?.footer?.delivery_lead_time || "-"}
              </div>
            </td>
          ))}
          <td className="p-2 bg-muted/5 min-w-48">
            <div className="text-xs text-foreground">-</div>
          </td>
        </tr>

        {/* Warranty Row */}
        <tr className="bg-muted/20 font-medium">
          <td
            colSpan={7}
            className="p-2 bg-card sticky left-0 z-10 border-r border-border"
          >
            <div className="text-xs text-foreground">Warranty</div>
          </td>
          {quotes?.map((quote, index) => (
            <td
              key={index}
              className="p-2 text-center border-r border-border min-w-48"
            >
              <div className="text-xs text-foreground">
                {quote?.footer?.warranty || "-"}
              </div>
            </td>
          ))}
          <td className="p-2 bg-muted/5 min-w-48">
            <div className="text-xs text-foreground">-</div>
          </td>
        </tr>

        {/* Currency Row */}
        <tr className="bg-muted/30 font-medium">
          <td
            colSpan={7}
            className="p-2 bg-card sticky left-0 z-10 border-r border-border"
          >
            <div className="text-xs text-foreground">Currency</div>
          </td>
          {quotes?.map((quote, index) => (
            <td
              key={index}
              className="p-2 text-center border-r border-border min-w-48"
            >
              <div className="text-xs text-foreground">
                {quote?.footer?.currency || "-"}
              </div>
            </td>
          ))}
          <td className="p-2 bg-muted/5 min-w-48">
            <div className="text-xs text-foreground">-</div>
          </td>
        </tr>

        {/* Remarks of Quotation Row */}
        <tr className="bg-muted/20 font-medium">
          <td
            colSpan={7}
            className="p-2 bg-card sticky left-0 z-10 border-r border-border"
          >
            <div className="text-xs text-foreground">Remarks of Quotation</div>
          </td>
          {quotes?.map((quote, index) => (
            <td
              key={index}
              className="p-2 text-center border-r border-border min-w-48"
            >
              <div className="text-xs text-foreground">
                {quote?.footer?.remarks_of_quotation || "-"}
              </div>
            </td>
          ))}
          <td className="p-2 bg-muted/5 min-w-48">
            <div className="text-xs text-foreground">-</div>
          </td>
        </tr>

        {/* Total Amount Row */}
        <tr className="bg-primary/5 font-bold">
          <td
            colSpan={7}
            className="p-2 bg-card sticky left-0 z-10 border-r border-border"
          >
            <div className="text-xs text-foreground">Total Amount</div>
          </td>
          {quotes?.map((quote, quoteIndex) => {
            const totalAmount = items?.reduce((total, item) => {
              const itemQuote = quote?.items?.find(
                (qi) => qi?.itemId === item?.id
              );
              const rate =
                itemQuote?.unitPrice || quote?.rates?.[item?.id] || 0;
              return total + rate * item?.quantity;
            }, 0);
            return (
              <td
                key={quoteIndex}
                className="p-2 text-center border-r border-border min-w-48"
              >
                <div className="text-xs font-semibold text-primary">
                  ₹{totalAmount?.toLocaleString()}
                </div>
              </td>
            );
          })}
          <td className="p-2 bg-muted/5 min-w-48">
            <div className="text-xs font-semibold text-green-600">
              ₹
              {items
                ?.reduce((total, item) => {
                  const typeKey =
                    commodityType?.toLowerCase() === "provided data"
                      ? "PROVIDED_DATA"
                      : 
                      commodityType?.toLowerCase();
                  const finalPrice =
                    adminApproval?.[typeKey]?.[item?.id]?.finalPrice || 0;
                  return total + (parseFloat(finalPrice) * item?.quantity || 0);
                }, 0)
                ?.toLocaleString()}
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  );

  const renderServiceTable = () => (
    <table className="w-full min-w-max">
      {/* Table Header */}
      <thead className="bg-muted border-b border-border sticky top-0 z-20">
        <tr>
          {/* Fixed Left Column Headers - Matching user form structure */}
          <th className="p-2 text-left bg-card sticky left-0 z-30 border-r border-border min-w-36">
            <div className="flex items-center space-x-1">
              <AppIcon name="FileText" size={14} />
              <span className="text-xs font-semibold text-foreground">
                Description
              </span>
            </div>
          </th>

          <th className="p-2 text-left bg-card sticky left-36 z-30 border-r border-border min-w-32">
            <div className="flex items-center space-x-1">
              <AppIcon name="FileText" size={14} />
              <span className="text-xs font-semibold text-foreground">
                Specifications
              </span>
            </div>
          </th>

          <th className="p-2 text-left bg-card sticky left-68 z-30 border-r border-border min-w-16">
            <div className="flex items-center space-x-1">
              <AppIcon name="Ruler" size={14} />
              <span className="text-xs font-semibold text-foreground">UOM</span>
            </div>
          </th>

          <th className="p-2 text-left bg-card sticky left-84 z-30 border-r border-border min-w-16">
            <div className="flex items-center space-x-1">
              <AppIcon name="Hash" size={14} />
              <span className="text-xs font-semibold text-foreground">
                Req Qty
              </span>
            </div>
          </th>

          <th className="p-2 text-left bg-card sticky left-100 z-30 border-r border-border min-w-20">
            <div className="flex items-center space-x-1">
              <AppIcon name="DollarSign" size={14} />
              <span className="text-xs font-semibold text-foreground">
                Rate
              </span>
            </div>
          </th>

          {/* Dynamic Quote Column Headers */}
          {quotes?.map((quote, quoteIndex) => (
            <th
              key={quoteIndex}
              className="p-2 text-center bg-card border-r border-border min-w-48"
            >
              <div className="space-y-1">
                <div className="text-xs font-semibold text-foreground">
                  Quote {quoteIndex + 1}
                </div>
                <div className="text-xs text-muted-foreground">
                  {getSupplierName(quote?.id)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {quote?.footer?.currency || "INR"}
                </div>
              </div>
            </th>
          ))}

          {/* Admin Final Decision Column */}
          <th className="p-2 text-center bg-muted/5 min-w-48">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-green-600">
                Final Decision
              </div>
              <div className="text-xs text-muted-foreground">
                Admin Approval
              </div>
            </div>
          </th>
        </tr>
      </thead>

      {/* Table Body */}
      <tbody className="divide-y divide-border">
        {items?.map((item, itemIndex) => (
          <tr key={item?.id} className="hover:bg-muted/10">
            {/* Fixed Left Columns */}
            <td className="p-2 bg-card sticky left-0 z-10 border-r border-border min-w-36">
              <div className="text-xs text-foreground">
                {item?.description || "N/A"}
              </div>
            </td>

            <td className="p-2 bg-card sticky left-36 z-10 border-r border-border min-w-32">
              <div className="text-xs text-foreground">
                {item?.specifications || "N/A"}
              </div>
            </td>

            <td className="p-2 bg-card sticky left-68 z-10 border-r border-border min-w-16">
              <div className="text-xs text-foreground">
                {item?.unitOfMeasure || "N/A"}
              </div>
            </td>

            <td className="p-2 bg-card sticky left-84 z-10 border-r border-border min-w-16">
              <div className="text-xs text-foreground">
                {item?.quantity || "0"}
              </div>
            </td>

            <td className="p-2 bg-card sticky left-100 z-10 border-r border-border min-w-20">
              <div className="text-xs text-foreground">
                {item?.lastBuyingPrice ? `₹${item?.lastBuyingPrice}` : "N/A"}
              </div>
            </td>

            {/* Dynamic Quote Columns */}
            {quotes?.map((quote, quoteIndex) => {
              const itemRate = quote?.rates?.[item?.id] || 0;
              const amount = calculateAmount(itemRate, item?.quantity || 0);
              return (
                <td
                  key={quoteIndex}
                  className="p-2 border-r border-border min-w-48"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-primary">
                      ₹{itemRate?.toLocaleString() || "0"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total: ₹{amount}
                    </div>
                  </div>
                </td>
              );
            })}

            {/* Admin Final Decision Column */}
            <td className="p-2 bg-muted/5 min-w-48">
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Final Total Price (₹)
                  </label>
                  <input
                    disabled={quotation.finalDecisions[0]?.status == "APPROVED"}
                    type="number"
                    value={
                      quotation.finalDecisions[0]?.items[itemIndex]
                        .finalTotalPrice
                        ? quotation.finalDecisions[0].items[itemIndex]
                            .finalTotalPrice
                        : adminApproval?.[commodityTypeKey]?.[item?.id]
                            ?.totalPrice || ""
                    }
                    onChange={(e) =>
                      onFinalPriceChange(item?.id, e.target.value)
                    }
                    className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Select Vendor
                  </label>
                  <select
                    value={
                      quotation.finalDecisions[0]?.items[itemIndex].supplierName
                        ? quotation.finalDecisions[0].items[itemIndex]
                            .supplierName
                        : adminApproval?.[commodityTypeKey]?.[item?.id]
                            ?.finalSupplier?.vendorName || ""
                    }
                    disabled={quotation.finalDecisions[0]?.status == "APPROVED"}
                    onChange={(e) => {
                      console.log(
                        "Service dropdown changed for item",
                        item?.id,
                        "to value:",
                        e.target.value
                      );
                      onFinalSupplierChange(
                        item?.id,
                        "vendorName",
                        e.target.value
                      );
                    }}
                    className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Vendor</option>
                    {suppliers?.map((supplier, index) => (
                      <option
                        key={supplier?.id || index}
                        value={supplier?.name}
                      >
                        {supplier?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>

      {/* Footer Row */}
      <tfoot className="bg-muted/20 border-t border-border">
        <tr>
          <td
            colSpan={5}
            className="p-2 bg-card sticky left-0 z-10 border-r border-border"
          >
            <div className="text-xs font-semibold text-foreground">
              Total Amount
            </div>
          </td>

          {quotes?.map((quote, quoteIndex) => {
            const totalAmount = items?.reduce((total, item) => {
              const rate = quote?.rates?.[item?.id] || 0;
              const quantity = item?.quantity || 0;
              return total + rate * quantity;
            }, 0);
            return (
              <td
                key={quoteIndex}
                className="p-2 border-r border-border min-w-48"
              >
                <div className="text-xs font-semibold text-primary">
                  ₹{totalAmount?.toLocaleString()}
                </div>
              </td>
            );
          })}

          <td className="p-2 bg-muted/5 min-w-48">
            <div className="text-xs font-semibold text-green-600">
              ₹
              {items
                ?.reduce(
                  (total, item) =>
                    total +
                    (parseFloat(
                      adminApproval?.[commodityTypeKey]?.[item?.id]?.totalPrice
                    ) || 0),
                  0
                )
                ?.toLocaleString()}
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  );

  const renderTransportTable = () => (
    <table className="w-full min-w-max">
      {/* Table Header */}
      <thead className="bg-muted border-b border-border sticky top-0 z-20">
        <tr>
          {/* Fixed Left Column Headers - Matching user form structure */}
          <th className="p-2 text-left bg-card sticky left-0 z-30 border-r border-border min-w-32">
            <div className="flex items-center space-x-1">
              <AppIcon name="MapPin" size={14} />
              <span className="text-xs font-semibold text-foreground">
                From
              </span>
            </div>
          </th>

          <th className="p-2 text-left bg-card sticky left-32 z-30 border-r border-border min-w-32">
            <div className="flex items-center space-x-1">
              <AppIcon name="MapPin" size={14} />
              <span className="text-xs font-semibold text-foreground">To</span>
            </div>
          </th>

          <th className="p-2 text-left bg-card sticky left-64 z-30 border-r border-border min-w-24">
            <div className="flex items-center space-x-1">
              <AppIcon name="Truck" size={14} />
              <span className="text-xs font-semibold text-foreground">
                Vehicle Size
              </span>
            </div>
          </th>

          <th className="p-2 text-left bg-card sticky left-88 z-30 border-r border-border min-w-24">
            <div className="flex items-center space-x-1">
              <AppIcon name="Package" size={14} />
              <span className="text-xs font-semibold text-foreground">
                Load
              </span>
            </div>
          </th>

          <th className="p-2 text-left bg-card sticky left-112 z-30 border-r border-border min-w-28">
            <div className="flex items-center space-x-1">
              <AppIcon name="Ruler" size={14} />
              <span className="text-xs font-semibold text-foreground">
                Dimensions
              </span>
            </div>
          </th>

          <th className="p-2 text-left bg-card sticky left-140 z-30 border-r border-border min-w-20">
            <div className="flex items-center space-x-1">
              <AppIcon name="Repeat" size={14} />
              <span className="text-xs font-semibold text-foreground">
                Frequency
              </span>
            </div>
          </th>

          {/* Dynamic Quote Column Headers */}
          {quotes?.map((quote, quoteIndex) => (
            <th
              key={quoteIndex}
              className="p-2 text-center bg-card border-r border-border min-w-48"
            >
              <div className="space-y-1">
                <div className="text-xs font-semibold text-foreground">
                  Quote {quoteIndex + 1}
                </div>
                <div className="text-xs text-muted-foreground">
                  h{getSupplierName(quote?.id)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {quote?.footer?.currency || "INR"}
                </div>
              </div>
            </th>
          ))}

          {/* Admin Final Decision Column */}
          <th className="p-2 text-center bg-muted/5 min-w-48">
            <div className="space-y-1">
              <div className="text-xs font-semibold text-green-600">
                Final Decision
              </div>
              <div className="text-xs text-muted-foreground">
                Admin Approval
              </div>
            </div>
          </th>
        </tr>
      </thead>

      {/* Table Body */}
      <tbody className="divide-y divide-border">
        {items?.map((item, itemIndex) => (
          <tr key={item?.id} className="hover:bg-muted/10">
            {/* Fixed Left Columns */}
            <td className="p-2 bg-card sticky left-0 z-10 border-r border-border min-w-32">
              <div className="text-xs text-foreground">
                {item?.transportDetails?.fromLocation || "N/A"}
              </div>
            </td>

            <td className="p-2 bg-card sticky left-32 z-10 border-r border-border min-w-32">
              <div className="text-xs text-foreground">
                {item?.transportDetails?.toLocation || "N/A"}
              </div>
            </td>

            <td className="p-2 bg-card sticky left-64 z-10 border-r border-border min-w-24">
              <div className="text-xs text-foreground">
                {item?.transportDetails?.vehicleSize || "N/A"}
              </div>
            </td>

            <td className="p-2 bg-card sticky left-88 z-10 border-r border-border min-w-24">
              <div className="text-xs text-foreground">
                {item?.transportDetails?.load || "N/A"}
              </div>
            </td>

            <td className="p-2 bg-card sticky left-112 z-10 border-r border-border min-w-28">
              <div className="text-xs text-foreground">
                {item?.transportDetails?.dimensions || "N/A"}
              </div>
            </td>

            <td className="p-2 bg-card sticky left-140 z-10 border-r border-border min-w-20">
              <div className="text-xs text-foreground">
                {item?.transportDetails?.frequency || "0"}
              </div>
            </td>

            {/* Dynamic Quote Columns */}
            {quotes?.map((quote, quoteIndex) => {
              const itemRate = quote?.rates?.[item?.id] || 0;
              const frequency = item?.transportDetails?.frequency || 1;
              const amount = calculateAmount(itemRate, frequency);
              return (
                <td
                  key={quoteIndex}
                  className="p-2 border-r border-border min-w-48"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-primary">
                      ₹{itemRate?.toLocaleString() || "0"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Monthly: ₹{amount}
                    </div>
                  </div>
                </td>
              );
            })}

            {/* Admin Final Decision Column */}
            <td className="p-2 bg-muted/5 min-w-48">
              <div className="space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Final Total Price (₹)
                  </label>
                  <input
                    disabled={quotation.finalDecisions[0]?.status == "APPROVED"}
                    type="number"
                    value={
                      quotation.finalDecisions[0]?.items[itemIndex]
                        .finalTotalPrice
                        ? quotation.finalDecisions[0].items[itemIndex]
                            .finalTotalPrice
                        : adminApproval?.[commodityTypeKey]?.[item?.id]
                            ?.totalPrice || ""
                    }
                    onChange={(e) =>
                      onFinalPriceChange(item?.id, e.target.value)
                    }
                    className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Select Vendor
                  </label>
                  <select
                    value={
                      quotation.finalDecisions[0]?.items[itemIndex].supplierName
                        ? quotation.finalDecisions[0].items[itemIndex]
                            .supplierName
                        : adminApproval?.[commodityTypeKey]?.[item?.id]
                            ?.finalSupplier?.vendorName || ""
                    }
                    disabled={quotation.finalDecisions[0]?.status == "APPROVED"}
                    onChange={(e) => {
                      console.log(
                        "Transport dropdown changed for item",
                        item?.id,
                        "to value:",
                        e.target.value
                      );
                      onFinalSupplierChange(
                        item?.id,
                        "vendorName",
                        e.target.value
                      );
                    }}
                    className="w-full px-2 py-1 text-xs border border-border rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Select Vendor</option>
                    {suppliers?.map((supplier, index) => (
                      <option
                        key={supplier?.id || index}
                        value={supplier?.name}
                      >
                        {supplier?.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </td>
          </tr>
        ))}
      </tbody>

      {/* Footer Row */}
      <tfoot className="bg-muted/20 border-t border-border">
        <tr>
          <td
            colSpan={6}
            className="p-2 bg-card sticky left-0 z-10 border-r border-border"
          >
            <div className="text-xs font-semibold text-foreground">
              Total Monthly Cost
            </div>
          </td>

          {quotes?.map((quote, quoteIndex) => {
            const totalAmount = items?.reduce((total, item) => {
              const rate = quote?.rates?.[item?.id] || 0;
              const frequency = item?.transportDetails?.frequency || 1;
              return total + rate * frequency;
            }, 0);
            return (
              <td
                key={quoteIndex}
                className="p-2 border-r border-border min-w-48"
              >
                <div className="text-xs font-semibold text-primary">
                  ₹{totalAmount?.toLocaleString()}
                </div>
              </td>
            );
          })}

          <td className="p-2 bg-muted/5 min-w-48">
            <div className="text-xs font-semibold text-green-600">
              {quotation.finalDecisions?.[0]?.status === "APPROVED"
                ? quotation.finalDecisions?.[0]?.items
                    ?.reduce(
                      (total, item) => total + parseFloat(item.finalTotalPrice),
                      0
                    )
                    ?.toLocaleString()
                : items
                    ?.reduce(
                      (total, item) =>
                        total +
                        (parseFloat(
                          adminApproval?.[commodityTypeKey]?.[item?.id]
                            ?.totalPrice
                        ) || 0),
                      0
                    )
                    ?.toLocaleString()}
            </div>
          </td>
        </tr>
      </tfoot>
    </table>
  );

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        {(commodityType === "Provided Data" ||
          commodityType === "provided_data") &&
          renderProvidedDataTable()}
        {(commodityType === "Service" || commodityType === "service") &&
          renderServiceTable()}
        {(commodityType === "Transport" || commodityType === "transport") &&
          renderTransportTable()}
      </div>
    </div>
  );
};

export default AdminQuotationComparisonTable;
