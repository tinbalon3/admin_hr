import uvicorn
from app.main import app

if __name__ == "__main__":
    uvicorn.run("main:app", host="", port=8000, log_level="info")
