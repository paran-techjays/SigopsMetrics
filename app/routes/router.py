from fastapi import APIRouter, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import os
import mimetypes

router = APIRouter()

# Ensure JavaScript files are served with the correct MIME type
mimetypes.add_type("application/javascript", ".js")
mimetypes.add_type("text/css", ".css")

# Get the absolute path to the frontend/dist directory
frontend_dist_path = Path(__file__).parent.parent.parent / "frontend" / "dist"

# Instead of mounting, serve each file type directly
@router.get("/assets/{file_path:path}", include_in_schema=False)
async def serve_static(file_path: str):
    file_full_path = frontend_dist_path / "assets" / file_path
    
    # Check if file exists
    if not os.path.isfile(file_full_path):
        return {"error": "File not found"}
    
    # Get the appropriate MIME type based on file extension
    file_extension = os.path.splitext(file_full_path)[1].lower()
    
    # Explicit handling for common file types
    if file_extension == ".js":
        media_type = "application/javascript"
    elif file_extension == ".css":
        media_type = "text/css"
    elif file_extension == ".png":
        media_type = "image/png"
    elif file_extension == ".svg":
        media_type = "image/svg+xml"
    elif file_extension == ".jpg" or file_extension == ".jpeg":
        media_type = "image/jpeg"
    else:
        # Use Python's mimetypes as fallback
        media_type = mimetypes.guess_type(file_full_path)[0] or "application/octet-stream"
    
    return FileResponse(str(file_full_path), media_type=media_type)

# Serve the index.html file for all routes to support client-side routing
@router.get("/", include_in_schema=False)
@router.get("/{full_path:path}", include_in_schema=False)
async def serve_frontend(request: Request, full_path: str = ""):
    # Skip asset paths (they should be handled by serve_static)
    if full_path.startswith("assets/"):
        return {"error": "File not found"}
    
    return FileResponse(str(frontend_dist_path / "index.html"), media_type="text/html")



