import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ExportControls = ({ onExportCSV, onExportPDF, isExporting }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <Icon name="Download" size={16} className="text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Export:</span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        iconName="FileSpreadsheet"
        iconPosition="left"
        onClick={onExportCSV}
        disabled={isExporting}
        loading={isExporting}
      >
        CSV
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        iconName="FileText"
        iconPosition="left"
        onClick={onExportPDF}
        disabled={isExporting}
        loading={isExporting}
      >
        PDF
      </Button>
    </div>
  );
};

export default ExportControls;