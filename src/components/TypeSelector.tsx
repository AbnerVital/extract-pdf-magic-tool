
import React from 'react';
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DocumentType } from '@/types/extraction';

interface TypeSelectorProps {
  selectedType: DocumentType;
  onTypeChange: (type: DocumentType) => void;
  disabled?: boolean;
}

const documentTypeOptions: { label: string; value: DocumentType }[] = [
  { label: "Auto Detectar", value: "auto-detect" },
  { label: "Mateus Eletrônica - São Luís", value: "mateus-slz" },
  { label: "Mateus Eletrônica - Marabá", value: "mateus-maraba" },
  { label: "OI Link", value: "oi-link" },
  { label: "Sindicato", value: "sindicato" },
  { label: "TecBan", value: "tecban" },
  { label: "AMASP", value: "amasp" },
  { label: "F de Oliveira", value: "f-oliveira" },
  { label: "FPS Segurança", value: "fps-seguranca" },
];

const TypeSelector: React.FC<TypeSelectorProps> = ({ selectedType, onTypeChange, disabled = false }) => {
  return (
    <Card className="p-4 mt-4">
      <div className="space-y-2">
        <label htmlFor="document-type" className="text-sm font-medium text-gray-700">Tipo de Documento</label>
        <Select
          disabled={disabled}
          value={selectedType}
          onValueChange={(value) => onTypeChange(value as DocumentType)}
        >
          <SelectTrigger id="document-type" className="w-full">
            <SelectValue placeholder="Selecione o tipo de documento" />
          </SelectTrigger>
          <SelectContent>
            {documentTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Card>
  );
};

export default TypeSelector;
