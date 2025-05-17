# Activate virtual environment if it exists
if (Test-Path "venv") {
    .\venv\Scripts\Activate.ps1
}

# Install dependencies if requirements.txt exists
if (Test-Path "requirements.txt") {
    pip install -r requirements.txt
}

# Run the FastAPI server
uvicorn main:app --host 0.0.0.0 --port 3001 --reload 