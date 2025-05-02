
import React, { useState } from 'react';
import PdfDropzone from '@/components/PdfDropzone';
import TypeSelector from '@/components/TypeSelector';
import ExtractButton from '@/components/ExtractButton';
import ResultsDisplay from '@/components/ResultsDisplay';
import { extractDataFromPdf, downloadExcelFile } from '@/services/extractionService';
import { DocumentType, ExtractionResult, ResultsData } from '@/types/extraction';
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("auto-detect");
  const [isExtracting, setIsExtracting] = useState(false);
  const [results, setResults] = useState<ResultsData | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setResults(null);
  };

  const handleTypeChange = (type: DocumentType) => {
    setDocumentType(type);
  };

  const handleExtract = async () => {
    if (!selectedFile) return;

    setIsExtracting(true);
    try {
      const extractedData = await extractDataFromPdf(selectedFile, documentType);
      
      setResults({
        fileName: selectedFile.name,
        documentType,
        extractedData
      });
      
      toast({
        title: "Extração completa",
        description: "Os dados foram extraídos com sucesso!",
      });
    } catch (error) {
      console.error("Erro ao extrair dados:", error);
      toast({
        title: "Erro na extração",
        description: "Não foi possível extrair os dados do PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDownload = async () => {
    if (!results) return;
    
    try {
      await downloadExcelFile(results.extractedData);
      toast({
        title: "Download iniciado",
        description: "O arquivo Excel está sendo baixado.",
      });
    } catch (error) {
      console.error("Erro ao baixar Excel:", error);
      toast({
        title: "Erro ao baixar",
        description: "Não foi possível baixar o arquivo Excel.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-brand-50">
      <div className="container py-8 md:py-12">
        <header className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-brand-100 rounded-full mb-4">
            <FileText className="h-8 w-8 text-brand-700" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-brand-700 to-brand-900 text-transparent bg-clip-text">
            PDF Magic Extractor
          </h1>
          <p className="mt-3 text-gray-600 max-w-lg mx-auto">
            Faça upload dos seus arquivos PDF e extraia dados estruturados com facilidade
          </p>
        </header>

        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <PdfDropzone onFileSelect={handleFileSelect} />
            </div>
            <div>
              <TypeSelector 
                selectedType={documentType}
                onTypeChange={handleTypeChange}
                disabled={isExtracting}
              />
            </div>
          </div>
          
          <ExtractButton 
            onExtract={handleExtract} 
            isLoading={isExtracting}
            disabled={!selectedFile || isExtracting}
            fileSelected={!!selectedFile}
            documentType={documentType}
          />
          
          {results && (
            <ResultsDisplay 
              results={results} 
              onDownload={handleDownload} 
            />
          )}
        </div>
        
        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>© 2023 PDF Magic Extractor - Todos os direitos reservados</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
