
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, FileText } from "lucide-react";
import { ResultsData } from "@/types/extraction";

interface ResultsDisplayProps {
  results: ResultsData | null;
  onDownload: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onDownload }) => {
  if (!results) {
    return null;
  }

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case "mateus-slz": return "Mateus Eletrônica - São Luís";
      case "mateus-maraba": return "Mateus Eletrônica - Marabá";
      case "oi-link": return "OI Link";
      case "sindicato": return "Sindicato";
      case "tecban": return "TecBan";
      case "amasp": return "AMASP";
      case "f-oliveira": return "F de Oliveira";
      case "fps-seguranca": return "FPS Segurança";
      case "auto-detect": return "Auto Detectado";
      default: return type;
    }
  };

  const extractedEntries = Object.entries(results.extractedData).filter(([key]) => 
    key !== "Arquivo" && results.extractedData[key] !== null && results.extractedData[key] !== undefined
  );

  return (
    <Card className="mt-6 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-brand-500 to-brand-600 text-white">
        <CardTitle className="flex items-center">
          <FileText className="mr-2 h-5 w-5" />
          Resultados da Extração
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-4 bg-brand-50 border-b">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 font-medium">Arquivo</p>
              <p className="font-semibold truncate">{results.fileName}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Tipo de Documento</p>
              <p className="font-semibold">{getDocumentTypeName(results.documentType)}</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Campo</TableHead>
                <TableHead>Valor Extraído</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {extractedEntries.length > 0 ? (
                extractedEntries.map(([key, value]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">{key}</TableCell>
                    <TableCell>{value}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-4 text-gray-500">
                    Nenhum dado extraído
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 p-4 flex justify-end">
        <Button 
          onClick={onDownload}
          className="flex items-center"
        >
          <Download className="mr-2 h-4 w-4" />
          Baixar Excel
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResultsDisplay;
