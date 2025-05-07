from fastapi import FastAPI
from app.routes import pdf

app = FastAPI(title="PDF Extract API")

app.include_router(pdf.router, prefix="/pdf")
