import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const ServiceFooterFields = ({ onFileUpload, signedBOOFile, signedDrawingFile, onFileRemove }) => {
  const fileInputRefs = {
    signedBOO: React.useRef(),
    signedDrawing: React.useRef(),
    fileUpload: React.useRef()
  };

  const handleFileSelect = (type, file) => {
    if (file && (file?.type === 'application/pdf' || file?.type?.startsWith('image/'))) {
      onFileUpload(type, file);
    }
  };

  const createFileInput = (type, accept = '.pdf,.jpg,.jpeg,.png') => {
    if (!fileInputRefs?.[type]?.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.onchange = (e) => handleFileSelect(type, e?.target?.files?.[0]);
      fileInputRefs[type].current = input;
    }
    return fileInputRefs?.[type]?.current;
  };

  const FileUploadSection = ({ label, type, file, mandatory = false }) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Icon name="Upload" size={14} />
        <span className="text-sm font-medium text-foreground">{label}</span>
        {mandatory && <span className="text-xs text-red-500">*</span>}
      </div>
      
      {file ? (
        <div className="flex items-center justify-between p-2 bg-muted rounded border border-border">
          <div className="flex items-center space-x-2 min-w-0">
            <Icon name="FileText" size={12} className="text-primary flex-shrink-0" />
            <span className="text-xs text-foreground truncate" title={file?.name}>
              {file?.name}
            </span>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              iconName="Download"
              onClick={() => {
                const url = URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = url;
                a.download = file?.name;
                a?.click();
                URL.revokeObjectURL(url);
              }}
              className="p-1 h-auto w-auto"
            />
            <Button
              variant="ghost"
              size="sm"
              iconName="Trash2"
              onClick={() => onFileRemove(type)}
              className="text-destructive hover:text-destructive p-1 h-auto w-auto"
            />
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          iconName="Upload"
          iconPosition="left"
          onClick={() => createFileInput(type)?.click()}
          className="w-full h-8 text-xs bg-muted/50 hover:bg-muted border-dashed"
        >
          Upload File
        </Button>
      )}
    </div>
  );

  return (
    <div className="mt-6 bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
          <Icon name="FileText" size={20} />
          <span>Service Documentation</span>
        </h3>
        <div className="text-sm text-muted-foreground">
          Upload required service documents
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FileUploadSection
          label="Signed BOO"
          type="signedBOO"
          file={signedBOOFile}
          mandatory={true}
        />
        
        <FileUploadSection
          label="Signed Drawing"
          type="signedDrawing"
          file={signedDrawingFile}
          mandatory={true}
        />
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Icon name="FolderOpen" size={14} />
            <span className="text-sm font-medium text-foreground">Additional Files</span>
          </div>
          
          <Button
            variant="outline"
            iconName="Plus"
            iconPosition="left"
            onClick={() => createFileInput('fileUpload', '*')?.click()}
            className="w-full h-8 text-xs bg-muted/50 hover:bg-muted border-dashed"
          >
            Upload Additional Files
          </Button>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="AlertTriangle" size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Mandatory Fields
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Signed BOO and Signed Drawing documents are required for service quotations. 
              Please ensure all mandatory documents are uploaded before proceeding.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceFooterFields;