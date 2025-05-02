
import React, { useState, useCallback } from 'react';
import { Card } from "@/components/ui/card";
import { FileText, Upload, X } from "lucide-react";
import { cn } from '@/lib/utils';

interface PdfDropzoneProps {
  onFileSelect: (file: File) => void;
  className?: string;
}

const PdfDropzone: React.FC<PdfDropzoneProps> = ({ onFileSelect, className }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) {
      setIsDragActive(true);
    }
  }, [isDragActive]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length) {
      const file = files[0];
      if (file.type === 'application/pdf') {
        setSelectedFile(file);
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  return (
    <Card className={cn("mt-4", className)}>
      <div
        className={cn(
          "file-drop-area cursor-pointer",
          isDragActive && "active"
        )}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !selectedFile && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        
        {!selectedFile ? (
          <div className="flex flex-col items-center">
            <Upload className="h-12 w-12 text-brand-600 mb-4" />
            <p className="text-gray-700 font-medium">
              Arraste e solte seu arquivo PDF aqui
            </p>
            <p className="text-gray-500 text-sm mt-1">
              ou clique para selecionar um arquivo
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <FileText className="h-10 w-10 text-brand-600 mr-3" />
              <div>
                <p className="text-gray-700 font-medium truncate max-w-xs">
                  {selectedFile.name}
                </p>
                <p className="text-gray-500 text-sm">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PdfDropzone;
