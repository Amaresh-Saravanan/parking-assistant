@echo off
echo ========================================
echo  Setting up Video Folder Structure
echo ========================================
echo.

REM Create the public/videos directory
if not exist "public" (
    mkdir "public"
    echo ✅ Created public directory
) else (
    echo ✅ Public directory already exists
)

if not exist "public\videos" (
    mkdir "public\videos"
    echo ✅ Created public/videos directory
) else (
    echo ✅ Videos directory already exists
)

echo.
echo 📁 Folder structure ready!
echo.
echo 📋 Next steps:
echo 1. Copy your 3 MP4 files to: public\videos\ and rename them:
echo    - 123.mp4 (keep as is)
echo    - Rename "WhatsApp Video 2025-10-13 at 8.04.43 PM.mp4" to "whatsapp-video-1.mp4"
echo    - Rename "WhatsApp Video 2025-10-13 at 20.04.43_d2fc0054.mp4" to "whatsapp-video-2.mp4"
echo.
echo 2. Open your web app at: http://localhost:5173
echo 3. Go to Admin Dashboard
echo 4. Click "Setup Video Cameras" button
echo 5. Navigate to Camera Management to see your 3 video cameras
echo.
echo 🎉 Your videos will now work as camera feeds!
echo.
pause
