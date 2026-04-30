from fastapi import File, HTTPException, UploadFile


def pdf_file(file: UploadFile = File(...)) -> UploadFile:
    if not file.filename:
        raise HTTPException(400, "Filename is required")

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(400, "File must be a PDF")

    if file.content_type != "application/pdf":
        raise HTTPException(400, "Invalid MIME type")

    return file
