import React from 'react';
import Icon from '../../../components/AppIcon';

const ItemsTable = ({ items }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
              currency: 'INR'
    })?.format(amount);
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Machinery': 'bg-blue-100 text-blue-800',
      'Safety Equipment': 'bg-red-100 text-red-800',
      'Electronics': 'bg-green-100 text-green-800',
      'Raw Materials': 'bg-yellow-100 text-yellow-800',
      'Office Supplies': 'bg-purple-100 text-purple-800'
    };
    return colors?.[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Item Code
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Description
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Category
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Quantity
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Specifications
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Est. Budget
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items?.map((item, index) => (
              <tr key={item?.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="Package" size={16} className="text-primary" />
                    </div>
                    <span className="font-medium text-foreground text-sm">
                      {item?.itemCode}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item?.description}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getCategoryColor(item?.category)}`}>
                    {item?.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <span className="font-semibold text-foreground">
                      {item?.quantity?.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground ml-1">
                      {item?.unitOfMeasure}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item?.specifications}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-foreground">
                    {formatCurrency(item?.estimatedBudget)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary Row */}
      <div className="bg-muted/30 px-6 py-4 border-t border-border">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Icon name="Calculator" size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              Total Items: {items?.length}
            </span>
          </div>
          <div className="text-right">
            <span className="text-sm text-muted-foreground">Total Estimated Budget: </span>
            <span className="text-lg font-bold text-foreground">
              {formatCurrency(items?.reduce((sum, item) => sum + item?.estimatedBudget, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemsTable;