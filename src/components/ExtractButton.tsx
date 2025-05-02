
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { DocumentType } from '@/types/extraction';

interface ExtractButtonProps {
  onExtract: () => void;
  isLoading: boolean;
  disabled: boolean;
  fileSelected: boolean;
  documentType: DocumentType;
}

const ExtractButton: React.FC<ExtractButtonProps> = ({ 
  onExtract, 
  isLoading, 
  disabled,
  fileSelected,
  documentType
}) => {
  let buttonText = "Extrair Dados";
  
  if (isLoading) {
    buttonText = "Extraindo...";
  } else if (!fileSelected) {
    buttonText = "Selecione um arquivo";
  } else if (documentType === "auto-detect") {
    buttonText = "Extrair e Detectar Automaticamente";
  }

  return (
    <Button 
      onClick={onExtract}
      disabled={disabled || isLoading}
      className="w-full mt-4 py-6 text-base font-medium bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800"
    >
      {isLoading && <Loader className="mr-2 h-5 w-5 animate-spin" />}
      {buttonText}
    </Button>
  );
};

export default ExtractButton;
