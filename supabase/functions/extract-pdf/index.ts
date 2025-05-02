
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

// Import the Python script via Deno FFI
import { extract_data_from_pdf } from './pdf_extraction.py';

console.log('PDF extraction function started');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Parse the form data from the request
    const formData = await req.formData();
    const file = formData.get('file');
    const documentType = formData.get('document_type') || 'auto-detect';
    
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'No PDF file uploaded' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Read file as array buffer
    const fileBytes = await file.arrayBuffer();
    
    // Call the Python extraction function
    const extractedData = await extract_data_from_pdf(fileBytes, documentType);
    
    // Return the extracted data
    return new Response(
      JSON.stringify({ 
        success: true,
        fileName: file.name,
        documentType,
        extractedData
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error processing PDF:', error);
    
    return new Response(
      JSON.stringify({ error: `Error processing PDF: ${error.message}` }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
