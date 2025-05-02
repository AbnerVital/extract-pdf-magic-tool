
export interface ExtractionResult {
  [key: string]: string | null;
}

export type DocumentType = 
  | "mateus-slz" 
  | "oi-link" 
  | "sindicato" 
  | "tecban" 
  | "amasp" 
  | "f-oliveira" 
  | "fps-seguranca"
  | "mateus-maraba"
  | "auto-detect";

export interface ResultsData {
  fileName: string;
  documentType: DocumentType;
  extractedData: ExtractionResult;
}
