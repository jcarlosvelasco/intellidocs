import os
import shutil
import tempfile

from fastapi import UploadFile


def create_temp_file(file: UploadFile) -> str:
    if not file.filename:
        raise ValueError("No file name provided")

    temp_dir = tempfile.mkdtemp()
    temp_file_path = os.path.join(temp_dir, file.filename)
    try:
        with open(temp_file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        return temp_file_path
    except Exception as e:
        raise e


def remove_temp_file(temp_file_path: str):
    if os.path.exists(temp_file_path):
        os.remove(temp_file_path)
