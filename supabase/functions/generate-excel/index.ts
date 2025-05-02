
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';
// @ts-ignore: Import Excel for Deno
import * as xlsx from 'https://deno.land/x/sheetjs@v0.18.3/xlsx.mjs';

console.log('Generate Excel function started');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    // Parse the request body to get the extracted data
    const { extractedData } = await req.json();
    
    if (!extractedData) {
      return new Response(
        JSON.stringify({ error: 'No data provided' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Create a worksheet
    const wsData = [];
    
    // Add headers
    const headers = Object.keys(extractedData);
    wsData.push(headers);
    
    // Add values
    const values = Object.values(extractedData);
    wsData.push(values);
    
    // Create a workbook
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet(wsData);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Dados Extraídos');
    
    // Convert to binary Excel format
    const excelBinary = xlsx.write(workbook, { type: 'binary', bookType: 'xlsx' });
    
    // Convert binary to base64
    const base64Excel = btoa(String.fromCharCode.apply(null, new Uint8Array(excelBinary)));
    
    return new Response(
      JSON.stringify({
        success: true,
        excelBase64: base64Excel,
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
    console.error('Error generating Excel:', error);
    
    return new Response(
      JSON.stringify({ error: `Error generating Excel: ${error.message}` }),
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
