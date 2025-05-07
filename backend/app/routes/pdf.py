from fastapi import APIRouter, UploadFile, File
from fastapi.responses import FileResponse
from app.services.extract import extract_pdf_data
from app.utils.file_handler import save_pdf, generate_excel
import uuid
import os

router = APIRouter()

@router.post("/extract")
async def extract(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    input_path = save_pdf(file, file_id)
    
    extracted_data = extract_pdf_data(input_path)
    
    output_path = generate_excel(extracted_data, file_id)
    
    return FileResponse(path=output_path, filename="resultado.xlsx", media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
