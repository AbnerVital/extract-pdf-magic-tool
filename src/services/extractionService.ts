
import { DocumentType, ExtractionResult } from '@/types/extraction';

// This is a mock service that simulates the backend processing
// In a real implementation, this would make API calls to your Python backend
export async function extractDataFromPdf(file: File, documentType: DocumentType): Promise<ExtractionResult> {
  return new Promise((resolve, reject) => {
    // Simulate processing time
    setTimeout(() => {
      try {
        // Mock results based on document type
        const mockResults = getMockResults(documentType, file.name);
        resolve(mockResults);
      } catch (error) {
        reject(new Error('Falha ao extrair dados do PDF'));
      }
    }, 2000);
  });
}

export async function downloadExcelFile(extractedData: ExtractionResult): Promise<void> {
  return new Promise((resolve) => {
    // In a real implementation, this would trigger a file download from the backend
    setTimeout(() => {
      console.log('Downloading Excel with data:', extractedData);
      alert('Em um ambiente real, o arquivo Excel seria baixado agora.');
      resolve();
    }, 1000);
  });
}

// Mock function to generate results based on document type
function getMockResults(documentType: DocumentType, fileName: string): ExtractionResult {
  switch (documentType) {
    case 'mateus-slz':
      return {
        'Arquivo': fileName,
        'CPF/CNPJ': '12.345.678/0001-90',
        'Número da Nota': '12345678',
        'Recolhimento': 'NORMAL',
        'VALOR TOTAL DA NOTA': 'R$ 1.234,56',
        'Valor ISS': 'R$ 61,73'
      };
    case 'oi-link':
      return {
        'Arquivo': fileName,
        'Linha Digitável': '12345 12345 12345 12345 12345 12345 12345 1',
        'Valor a Pagar': '2.468,79',
        'Fatura N.': '87654321'
      };
    case 'sindicato':
      return {
        'Arquivo': fileName,
        'CNPJ do Pagador': '23.456.789/0001-23',
        'Linha Digitável': '12345.12345 12345.123456 12345.123456 1 12345678901234',
        'Nosso Número': '54321',
        'Valor do Documento': '3.567,89'
      };
    case 'tecban':
      return {
        'Arquivo': fileName,
        'Código de Barras': '12345.12345 12345.123456 12345.123456 1 12345678901234',
        'Número da Nota': '98765432',
        'CNPJ': '34.567.890/0001-45',
        'Valor Total': 'R$ 5.678,90',
        'Valor Líquido': 'R$ 5.500,00'
      };
    case 'amasp':
      return {
        'Arquivo': fileName,
        'CNPJ do Pagador': '45.678.901/0001-56',
        'Linha Digitável': '12345.12345 12345.123456 12345.123456 1 12345678901234',
        'Nosso Número': '87654',
        'Valor do Documento': '7.890,12'
      };
    case 'f-oliveira':
      return {
        'Arquivo': fileName,
        'Número da Nota': '123456789012345',
        'CNPJ do Tomador': '56.789.012/0001-67',
        'Valor dos Serviços (R$)': '8.901,23',
        'Valor Líquido (R$)': '8.500,00',
        'Total Retenções (R$)': '401,23',
        'ISS Retido': '289,78',
        'Linha Digitável / Código': '123451234512345123451234512345123451234512345'
      };
    case 'fps-seguranca':
      return {
        'Arquivo': fileName,
        'Número da Nota': '987654321098765',
        'CNPJ Tomador': '67.890.123/0001-78',
        'Valor dos Serviços (R$)': '9.012,34',
        'Valor Líquido (R$)': '8.950,00',
        'Total Retenções (R$)': '62,34'
      };
    case 'mateus-maraba':
      return {
        'Arquivo': fileName,
        'CNPJ do Tomador': '78.901.234/0001-89',
        'Número da Nota': '567890123456789',
        'Valor dos Serviços (R$)': '10.123,45',
        'Valor Líquido (R$)': '9.800,00'
      };
    case 'auto-detect':
    default:
      // For auto-detect, choose a random type for the mock
      const types: DocumentType[] = [
        'mateus-slz', 'oi-link', 'sindicato', 'tecban', 
        'amasp', 'f-oliveira', 'fps-seguranca', 'mateus-maraba'
      ];
      const randomType = types[Math.floor(Math.random() * types.length)];
      return getMockResults(randomType, fileName);
  }
}
