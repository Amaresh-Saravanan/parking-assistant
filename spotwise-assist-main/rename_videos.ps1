# PowerShell script to rename WhatsApp videos for the camera system

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Video File Renaming Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Create videos directory if it doesn't exist
$videosDir = "public\videos"
if (!(Test-Path $videosDir)) {
    New-Item -ItemType Directory -Path $videosDir -Force
    Write-Host "✅ Created $videosDir directory" -ForegroundColor Green
} else {
    Write-Host "✅ Videos directory already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔍 Looking for video files to rename..." -ForegroundColor Yellow

# Define the original and new filenames
$videoMappings = @{
    "WhatsApp Video 2025-10-13 at 8.04.43 PM.mp4" = "whatsapp-video-1.mp4"
    "WhatsApp Video 2025-10-13 at 20.04.43_d2fc0054.mp4" = "whatsapp-video-2.mp4"
}

# Check current directory for video files
$foundFiles = @()
foreach ($originalName in $videoMappings.Keys) {
    if (Test-Path $originalName) {
        $foundFiles += $originalName
        Write-Host "✅ Found: $originalName" -ForegroundColor Green
    } else {
        Write-Host "❌ Not found: $originalName" -ForegroundColor Red
    }
}

# Check if 123.mp4 exists
if (Test-Path "123.mp4") {
    Write-Host "✅ Found: 123.mp4" -ForegroundColor Green
    $foundFiles += "123.mp4"
} else {
    Write-Host "❌ Not found: 123.mp4" -ForegroundColor Red
}

if ($foundFiles.Count -eq 0) {
    Write-Host ""
    Write-Host "❌ No video files found in current directory!" -ForegroundColor Red
    Write-Host "📁 Please make sure your MP4 files are in this folder:" -ForegroundColor Yellow
    Write-Host "   $(Get-Location)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Expected files:" -ForegroundColor Cyan
    Write-Host "   - 123.mp4" -ForegroundColor White
    Write-Host "   - WhatsApp Video 2025-10-13 at 8.04.43 PM.mp4" -ForegroundColor White
    Write-Host "   - WhatsApp Video 2025-10-13 at 20.04.43_d2fc0054.mp4" -ForegroundColor White
    Read-Host "Press Enter to exit"
    exit
}

Write-Host ""
Write-Host "🚀 Starting file operations..." -ForegroundColor Cyan

# Copy and rename files
foreach ($originalName in $videoMappings.Keys) {
    if (Test-Path $originalName) {
        $newName = $videoMappings[$originalName]
        $destinationPath = Join-Path $videosDir $newName
        
        try {
            Copy-Item $originalName $destinationPath -Force
            Write-Host "✅ Copied and renamed: $originalName → $newName" -ForegroundColor Green
        } catch {
            Write-Host "❌ Failed to copy $originalName`: $_" -ForegroundColor Red
        }
    }
}

# Copy 123.mp4 if it exists
if (Test-Path "123.mp4") {
    $destinationPath = Join-Path $videosDir "123.mp4"
    try {
        Copy-Item "123.mp4" $destinationPath -Force
        Write-Host "✅ Copied: 123.mp4" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to copy 123.mp4: $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📁 Final video structure:" -ForegroundColor Cyan
if (Test-Path "$videosDir\123.mp4") {
    Write-Host "   ✅ $videosDir\123.mp4" -ForegroundColor Green
} else {
    Write-Host "   ❌ $videosDir\123.mp4" -ForegroundColor Red
}

if (Test-Path "$videosDir\whatsapp-video-1.mp4") {
    Write-Host "   ✅ $videosDir\whatsapp-video-1.mp4" -ForegroundColor Green
} else {
    Write-Host "   ❌ $videosDir\whatsapp-video-1.mp4" -ForegroundColor Red
}

if (Test-Path "$videosDir\whatsapp-video-2.mp4") {
    Write-Host "   ✅ $videosDir\whatsapp-video-2.mp4" -ForegroundColor Green
} else {
    Write-Host "   ❌ $videosDir\whatsapp-video-2.mp4" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Video setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Open your web app at: http://localhost:5173" -ForegroundColor White
Write-Host "2. Go to Admin Dashboard" -ForegroundColor White
Write-Host "3. Click 'Setup Video Cameras' button" -ForegroundColor White
Write-Host "4. Navigate to Camera Management to see your 3 video cameras" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to exit"
