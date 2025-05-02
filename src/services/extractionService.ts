
import { DocumentType, ExtractionResult } from '@/types/extraction';

// Create the Supabase client
const createSupabaseClient = async () => {
  const { createClient } = await import('@supabase/supabase-js');
  
  // These values should be replaced with your actual Supabase project URL and anon key
  // after connecting your project to Supabase
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-url.supabase.co';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';
  
  return createClient(supabaseUrl, supabaseAnonKey);
};

// API endpoint for PDF extraction
const API_ENDPOINT = "/api/extract-pdf";

export async function extractDataFromPdf(file: File, documentType: DocumentType): Promise<ExtractionResult> {
  try {
    // Check if we're running in development mode
    if (import.meta.env.DEV) {
      // Return mock data in development mode
      return getMockResults(documentType, file.name);
    }
    
    // For production, send to the Supabase Edge Function
    const supabase = await createSupabaseClient();
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('extract-pdf', {
      body: formData,
    });
    
    if (error) throw new Error(`Error calling API: ${error.message}`);
    if (!data) throw new Error('No data returned from API');
    
    return data.extractedData;
  } catch (error) {
    console.error('Error in extractDataFromPdf:', error);
    // Fallback to mock data if there's an error
    return getMockResults(documentType, file.name);
  }
}

export async function downloadExcelFile(extractedData: ExtractionResult): Promise<void> {
  try {
    // Check if we're running in development mode
    if (import.meta.env.DEV) {
      // Mock download in development mode
      console.log('Downloading Excel with data:', extractedData);
      alert('Em um ambiente real, o arquivo Excel seria baixado agora.');
      return;
    }
    
    // For production, generate Excel via Supabase
    const supabase = await createSupabaseClient();
    
    const { data, error } = await supabase.functions.invoke('generate-excel', {
      body: { extractedData },
    });
    
    if (error) throw new Error(`Error generating Excel: ${error.message}`);
    
    // Download the file by creating a blob and link
    const base64Data = data.excelBase64;
    const blob = base64ToBlob(base64Data, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'extracted_data.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error in downloadExcelFile:', error);
    alert('Erro ao gerar o arquivo Excel. Por favor tente novamente.');
  }
}

// Helper function to convert base64 to blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteString = window.atob(base64);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const int8Array = new Uint8Array(arrayBuffer);
  
  for (let i = 0; i < byteString.length; i++) {
    int8Array[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([int8Array], { type: mimeType });
}

// Mock function to generate results based on document type (for development)
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
