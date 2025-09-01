import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Icon from '../../../components/AppIcon';

const PerformanceCharts = () => {
  // Mock data for cost savings over time
  const costSavingsData = [
    { month: 'Jan', savings: 12500, target: 15000 },
    { month: 'Feb', savings: 18200, target: 15000 },
    { month: 'Mar', savings: 16800, target: 15000 },
    { month: 'Apr', savings: 22100, target: 15000 },
    { month: 'May', savings: 19500, target: 15000 },
    { month: 'Jun', savings: 25300, target: 15000 },
    { month: 'Jul', savings: 21800, target: 15000 },
    { month: 'Aug', savings: 28900, target: 15000 }
  ];

  // Mock data for Average TAT analytics
  const averageTATData = [
    { supplier: 'ACME Corp', avgTAT: 3.2, target: 5 },
    { supplier: 'Global Supply', avgTAT: 4.1, target: 5 },
    { supplier: 'Tech Solutions', avgTAT: 2.8, target: 5 },
    { supplier: 'Industrial Parts', avgTAT: 5.2, target: 5 },
    { supplier: 'Quality Materials', avgTAT: 3.9, target: 5 }
  ];

  // Mock data for monthly RFQ trends
  const rfqTrendsData = [
    { month: 'Jan', created: 28, completed: 25, approved: 22 },
    { month: 'Feb', created: 35, completed: 32, approved: 28 },
    { month: 'Mar', created: 42, completed: 38, approved: 35 },
    { month: 'Apr', created: 38, completed: 41, approved: 37 },
    { month: 'May', created: 45, completed: 39, approved: 36 },
    { month: 'Jun', created: 52, completed: 47, approved: 43 },
    { month: 'Jul', created: 48, completed: 51, approved: 46 },
    { month: 'Aug', created: 55, completed: 49, approved: 45 }
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-elevated">
          <p className="text-sm font-medium text-popover-foreground">{label}</p>
          {payload?.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry?.color }}>
              {entry?.name}: {typeof entry?.value === 'number' ? entry?.value?.toLocaleString() : entry?.value}
              {entry?.name?.includes('TAT') ? ' days' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6">
      {/* Cost Savings Chart */}
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Cost Savings Trend</h3>
            <p className="text-sm text-muted-foreground">Monthly savings vs target</p>
          </div>
          <div className="p-2 bg-success/10 text-success rounded-lg">
            <Icon name="TrendingUp" size={20} />
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costSavingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickFormatter={(value) => `$${(value / 1000)?.toFixed(0)}K`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="savings" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Average TAT Analytics */}
      {/* <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Average TAT Analytics</h3>
            <p className="text-sm text-muted-foreground">Turn Around Time performance by supplier</p>
          </div>
          <div className="p-2 bg-accent/10 text-accent rounded-lg">
            <Icon name="Clock" size={20} />
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={averageTATData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                type="number" 
                domain={[0, 6]}
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={{ stroke: '#E2E8F0' }}
                tickFormatter={(value) => `${value}d`}
              />
              <YAxis 
                type="category" 
                dataKey="supplier" 
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={{ stroke: '#E2E8F0' }}
                width={100}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="avgTAT" fill="#F59E0B" name="Avg TAT" />
              <Bar dataKey="target" fill="#E2E8F0" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div> */}

      {/* RFQ Trends */}
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">RFQ Activity Trends</h3>
            <p className="text-sm text-muted-foreground">Monthly RFQ processing</p>
          </div>
          <div className="p-2 bg-primary/10 text-primary rounded-lg">
            <Icon name="Activity" size={20} />
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rfqTrendsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#64748B' }}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="created" 
                stroke="#2563EB" 
                strokeWidth={2}
                dot={{ fill: '#2563EB', strokeWidth: 2, r: 4 }}
                name="Created"
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                name="Completed"
              />
              <Line 
                type="monotone" 
                dataKey="approved" 
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                name="Approved"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PerformanceCharts;