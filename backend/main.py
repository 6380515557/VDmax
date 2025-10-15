from fastapi import FastAPI, HTTPException, Depends, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field
from typing import Optional, List
import yt_dlp
import os
from datetime import datetime
import re
from dotenv import load_dotenv

load_dotenv()

APIKEY = os.getenv("APIKEY", "VDmax-YourSecureKey-2025-ChangeME")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:8081").split(",")
COOKIES_FILE_PATH = os.getenv("COOKIES_FILE_PATH", "./youtube_cookies.txt")  # Add your cookie file path here

app = FastAPI(
    title="VDmax Video Downloader API",
    description="Universal video downloader with merged audiovideo",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization", "X-API-Key"],
    max_age=3600,
)

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

# Model for input URL
class VideoInfoRequest(BaseModel):
    url: str = Field(..., example="https://www.youtube.com/watch?v=dQw4w9WgXcQ")

# Model for download URL with quality parameter
class DownloadURLRequest(BaseModel):
    url: str = Field(..., example="https://www.youtube.com/watch?v=dQw4w9WgXcQ")
    quality: Optional[str] = Field("bestvideo+bestaudio/best", example="best")

async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key is None or api_key != APIKEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing API Key")

# Endpoint to get video info including formats and metadata
@app.post("/api/video-info", dependencies=[Depends(verify_api_key)])
async def get_video_info(request: VideoInfoRequest):
    ydlopts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "format": "bestvideo+bestaudio/best",
        "nocheckcertificate": True,
        "merge_output_format": "mp4",
        "postprocessors": [
            {
                "key": "FFmpegVideoConvertor",
                "preferredformat": "mp4",
            }
        ],
        "cookiefile": COOKIES_FILE_PATH,  # Added cookiefile option here
    }

    try:
        with ytdlp.YoutubeDL(ydlopts) as ydl:
            info = ydl.extract_info(request.url, download=False)
        return info
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Endpoint to get download URL for requested quality/format
@app.post("/api/get-download-url", dependencies=[Depends(verify_api_key)])
async def get_download_url(request: DownloadURLRequest):
    quality = request.quality or "bestvideo+bestaudio/best"

    ydlopts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "format": quality,
        "nocheckcertificate": True,
        "merge_output_format": "mp4",
        "postprocessors": [
            {
                "key": "FFmpegVideoConvertor",
                "preferredformat": "mp4",
            }
        ],
        "cookiefile": COOKIES_FILE_PATH,  # Added cookiefile option here too
    }

    try:
        with ytdlp.YoutubeDL(ydlopts) as ydl:
            info = ydl.extract_info(request.url, download=False)
            download_url = None

            # If direct URL available
            if "url" in info:
                download_url = info["url"]
            # If playlist or formats available, find matching quality URL
            elif "formats" in info:
                for f in info["formats"]:
                    if f.get("format_id") == quality or f.get("format") == quality:
                        download_url = f.get("url")
                        break
            
            if not download_url:
                raise HTTPException(status_code=404, detail="Download URL not found")

            return {"downloadurl": download_url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
