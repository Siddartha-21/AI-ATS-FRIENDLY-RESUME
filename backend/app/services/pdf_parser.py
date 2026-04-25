import io
from pypdf import PdfReader

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts text from PDF bytes using PyPDF."""
    text = ""
    try:
        reader = PdfReader(io.BytesIO(file_bytes))
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return ""
    return text.strip()
