@echo off
echo ========================================
echo  Video File Renaming Script
echo ========================================
echo.

REM Create the public/videos directory
if not exist "public" mkdir "public"
if not exist "public\videos" mkdir "public\videos"

echo 🔍 Looking for video files...
echo.

REM Check if files exist and copy/rename them
if exist "123.mp4" (
    copy "123.mp4" "public\videos\123.mp4" >nul 2>&1
    echo ✅ Copied: 123.mp4
) else (
    echo ❌ Not found: 123.mp4
)

if exist "WhatsApp Video 2025-10-13 at 8.04.43 PM.mp4" (
    copy "WhatsApp Video 2025-10-13 at 8.04.43 PM.mp4" "public\videos\whatsapp-video-1.mp4" >nul 2>&1
    echo ✅ Copied and renamed: WhatsApp Video 8:04 PM → whatsapp-video-1.mp4
) else (
    echo ❌ Not found: WhatsApp Video 2025-10-13 at 8.04.43 PM.mp4
)

if exist "WhatsApp Video 2025-10-13 at 20.04.43_d2fc0054.mp4" (
    copy "WhatsApp Video 2025-10-13 at 20.04.43_d2fc0054.mp4" "public\videos\whatsapp-video-2.mp4" >nul 2>&1
    echo ✅ Copied and renamed: WhatsApp Video 20:04 → whatsapp-video-2.mp4
) else (
    echo ❌ Not found: WhatsApp Video 2025-10-13 at 20.04.43_d2fc0054.mp4
)

echo.
echo 📁 Checking final structure:
if exist "public\videos\123.mp4" (
    echo ✅ public\videos\123.mp4
) else (
    echo ❌ public\videos\123.mp4
)

if exist "public\videos\whatsapp-video-1.mp4" (
    echo ✅ public\videos\whatsapp-video-1.mp4
) else (
    echo ❌ public\videos\whatsapp-video-1.mp4
)

if exist "public\videos\whatsapp-video-2.mp4" (
    echo ✅ public\videos\whatsapp-video-2.mp4
) else (
    echo ❌ public\videos\whatsapp-video-2.mp4
)

echo.
echo 🎉 Video setup complete!
echo.
echo 📋 Next steps:
echo 1. Open your web app at: http://localhost:5173
echo 2. Go to Admin Dashboard  
echo 3. Click "Setup Video Cameras" button
echo 4. Navigate to Camera Management to see your 3 video cameras
echo.
pause
