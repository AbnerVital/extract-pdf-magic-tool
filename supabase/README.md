
# PDF Magic Extractor - Backend

This directory contains the backend code for the PDF Magic Extractor application. The backend is implemented as Supabase Edge Functions.

## Edge Functions

1. **extract-pdf**: Handles PDF uploads, extracts data using Python code, and returns the extracted data
2. **generate-excel**: Generates Excel files from extracted data

## Deployment Instructions

### Prerequisites

1. Install Supabase CLI: https://supabase.com/docs/guides/cli
2. Login to Supabase: `supabase login`
3. Link your project: `supabase link --project-ref <project-id>`

### Deploy Edge Functions

1. Navigate to the root of your project
2. Deploy the Edge Functions:
   ```
   supabase functions deploy extract-pdf --no-verify-jwt
   supabase functions deploy generate-excel --no-verify-jwt
   ```

### Configure Environment Variables

In your frontend project, add the following environment variables:

```
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## Dependencies

The backend requires the following dependencies:

- PyMuPDF (fitz) for PDF processing
- pandas for data manipulation
- openpyxl for Excel file generation

These dependencies are automatically installed in the Supabase Edge Functions environment.

## Testing

You can test the Edge Functions locally using:

```
supabase functions serve extract-pdf --no-verify-jwt
```

Then send a POST request with a PDF file to `http://localhost:54321/functions/v1/extract-pdf`.

## Notes

- The Edge Functions are configured to allow cross-origin requests (CORS)
- The Python code has been adapted from the provided notebook to work in a serverless environment
