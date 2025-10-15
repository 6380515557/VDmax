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

# ======================== CONFIGURATION ========================
API_KEY = os.getenv("API_KEY", "VDmax-YourSecureKey-2025-ChangeME")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:8081").split(",")

app = FastAPI(
    title="VDmax Video Downloader API",
    description="Universal video downloader with merged audio+video",
    version="1.0.0"
)

# ======================== CORS ========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization", "X-API-Key"],
    max_age=3600,
)

# ======================== SECURITY ========================
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def verify_api_key(api_key: str = Security(api_key_header)):
    if api_key is None or api_key != API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API Key"
        )
    return api_key

# ======================== HELPER ========================
def detect_platform(url: str) -> str:
    platform_patterns = {
        'youtube': r'(youtube\.com|youtu\.be)',
        'instagram': r'instagram\.com',
        'tiktok': r'tiktok\.com',
        'facebook': r'(facebook\.com|fb\.watch)',
        'twitter': r'(twitter\.com|x\.com)',
    }
    
    for platform, pattern in platform_patterns.items():
        if re.search(pattern, url, re.IGNORECASE):
            return platform
    return 'other'

# ======================== MODELS ========================
class VideoURLRequest(BaseModel):
    url: str = Field(..., description="Video URL from any platform")

class VideoFormat(BaseModel):
    format_id: str
    quality: str
    resolution: int
    extension: str
    filesize: int
    filesize_mb: Optional[float]
    url: str
    has_audio: bool
    has_video: bool

class VideoInfoResponse(BaseModel):
    success: bool
    platform: str
    title: str
    thumbnail: Optional[str]
    duration: Optional[int]
    uploader: Optional[str]
    formats: List[VideoFormat]
    timestamp: str

class DownloadURLResponse(BaseModel):
    success: bool
    platform: str
    title: str
    download_url: str
    extension: str
    filesize_mb: Optional[float]
    has_audio: bool
    has_video: bool
    timestamp: str

# ======================== ENDPOINTS ========================
@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "online",
        "service": "VDmax Universal Video Downloader",
        "supported_sites": "1700+",
        "version": "1.0.0"
    }

@app.post("/api/video-info", response_model=VideoInfoResponse, tags=["Video"])
async def get_video_info(
    request: VideoURLRequest,
    api_key: str = Depends(verify_api_key)
):
    """
    Get complete video information with MERGED video+audio formats
    """
    try:
        platform = detect_platform(request.url)
        
        # Updated config for merged formats
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'nocheckcertificate': True,
            'merge_output_format': 'mp4',  # Force MP4 output
            'postprocessors': [{
                'key': 'FFmpegVideoConvertor',
                'preferedformat': 'mp4',
            }],
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=False)
            
            formats = []
            seen = set()
            
            for f in info.get('formats', []):
                # ONLY select formats that have BOTH video AND audio
                vcodec = f.get('vcodec', 'none')
                acodec = f.get('acodec', 'none')
                has_video = vcodec not in ('none', None)
                has_audio = acodec not in ('none', None)
                
                # Skip if missing video or audio
                if not (has_video and has_audio):
                    continue
                
                resolution = f.get('height', 0)
                ext = f.get('ext', 'mp4')
                url = f.get('url')
                
                if url and resolution > 0:
                    key = f"{resolution}_{ext}"
                    if key not in seen:
                        filesize = f.get('filesize') or f.get('filesize_approx', 0)
                        formats.append(VideoFormat(
                            format_id=f.get('format_id'),
                            quality=f"{resolution}p",
                            resolution=resolution,
                            extension=ext,
                            filesize=filesize,
                            filesize_mb=round(filesize / (1024*1024), 2) if filesize else None,
                            url=url,
                            has_audio=has_audio,
                            has_video=has_video
                        ))
                        seen.add(key)
            
            # Sort by quality
            formats.sort(key=lambda x: x.resolution, reverse=True)
            
            return VideoInfoResponse(
                success=True,
                platform=platform,
                title=info.get('title', 'Unknown'),
                thumbnail=info.get('thumbnail'),
                duration=info.get('duration'),
                uploader=info.get('uploader'),
                formats=formats[:15],
                timestamp=datetime.now().isoformat()
            )
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error: {str(e)}")

@app.post("/api/get-download-url", response_model=DownloadURLResponse, tags=["Video"])
async def get_download_url(
    request: VideoURLRequest,
    quality: str = "best",
    api_key: str = Depends(verify_api_key)
):
    """
    Get COMPLETE video URL with merged audio+video
    """
    try:
        platform = detect_platform(request.url)
        
        # CRITICAL: Format selection for MERGED video+audio
        quality_map = {
            '2160': 'bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/best[height<=2160]',
            '1440': 'bestvideo[height<=1440][ext=mp4]+bestaudio[ext=m4a]/best[height<=1440]',
            '1080': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]',
            '720': 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]',
            '480': 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]',
            '360': 'bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360]',
            'best': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best',
        }
        
        ydl_opts = {
            'format': quality_map.get(quality, 'bestvideo+bestaudio/best'),
            'quiet': True,
            'no_warnings': True,
            'nocheckcertificate': True,
            'merge_output_format': 'mp4',  # CRITICAL: Merge to MP4
            'postprocessors': [{  # CRITICAL: FFmpeg merger
                'key': 'FFmpegVideoConvertor',
                'preferedformat': 'mp4',
            }],
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=False)
            
            # Get the selected format
            url = info.get('url')
            filesize = info.get('filesize') or info.get('filesize_approx', 0)
            
            # Check if format has both audio and video
            has_audio = info.get('acodec', 'none') not in ('none', None)
            has_video = info.get('vcodec', 'none') not in ('none', None)
            
            return DownloadURLResponse(
                success=True,
                platform=platform,
                title=info.get('title', 'Unknown'),
                download_url=url,
                extension='mp4',
                filesize_mb=round(filesize / (1024*1024), 2) if filesize else None,
                has_audio=has_audio,
                has_video=has_video,
                timestamp=datetime.now().isoformat()
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
