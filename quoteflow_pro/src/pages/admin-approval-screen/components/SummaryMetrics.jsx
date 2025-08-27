import React from 'react';
import Icon from '../../../components/AppIcon';

const SummaryMetrics = ({ lowestQuote, highestQuote, averageQuote, suppliersCount }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })?.format(amount);
  };

  const calculateSavings = () => {
    const savings = highestQuote - lowestQuote;
    const percentage = ((savings / highestQuote) * 100)?.toFixed(1);
    return { amount: savings, percentage };
  };

  const savings = calculateSavings();

  const metrics = [
    {
      title: 'Lowest Quote',
      value: formatCurrency(lowestQuote),
      icon: 'TrendingDown',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Best price received'
    },
    {
      title: 'Highest Quote',
      value: formatCurrency(highestQuote),
      icon: 'TrendingUp',
      iconColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'Highest price received'
    },
    {
      title: 'Average Quote',
      value: formatCurrency(averageQuote),
      icon: 'BarChart3',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'Mean of all quotes'
    },
    {
      title: 'Potential Savings',
      value: formatCurrency(savings?.amount),
      icon: 'DollarSign',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: `${savings?.percentage}% savings vs highest`,
      highlight: true
    }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Quote Analysis Summary</h3>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Users" size={16} />
          <span>{suppliersCount} suppliers compared</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics?.map((metric, index) => (
          <div 
            key={index}
            className={`
              relative p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md
              ${metric?.bgColor} ${metric?.borderColor}
              ${metric?.highlight ? 'ring-2 ring-green-200 ring-opacity-50' : ''}
            `}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${metric?.bgColor}`}>
                <Icon name={metric?.icon} size={20} className={metric?.iconColor} />
              </div>
              {metric?.highlight && (
                <div className="flex items-center space-x-1">
                  <Icon name="Award" size={16} className="text-green-600" />
                  <span className="text-xs font-medium text-green-600">BEST</span>
                </div>
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {metric?.title}
              </p>
              <p className="text-xl font-bold text-foreground mb-1">
                {metric?.value}
              </p>
              <p className="text-xs text-muted-foreground">
                {metric?.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      {/* Additional Insights */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
              <Icon name="Target" size={16} className="text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Recommendation</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Consider the lowest quote if quality and delivery terms are acceptable. 
                Potential savings of {formatCurrency(savings?.amount)} compared to highest quote.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Icon name="AlertTriangle" size={16} className="text-yellow-600" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground">Risk Assessment</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {savings?.percentage > 20 
                  ? 'High price variance detected. Verify scope and quality differences.'
                  : 'Price variance is within acceptable range for market competition.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryMetrics;