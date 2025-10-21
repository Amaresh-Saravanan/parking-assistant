# Spotwise AI Backend Setup Script
# PowerShell version for Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Spotwise AI Backend Setup" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ $pythonVersion detected" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.8+ from https://python.org" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Function to run commands with error handling
function Invoke-SafeCommand {
    param([string]$Command, [string]$Description)
    
    Write-Host "🔄 $Description..." -ForegroundColor Yellow
    try {
        Invoke-Expression $Command
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $Description completed" -ForegroundColor Green
            return $true
        } else {
            Write-Host "⚠️  $Description failed with exit code $LASTEXITCODE" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Error during $Description`: $_" -ForegroundColor Red
        return $false
    }
}

# Create virtual environment (optional)
Write-Host "📦 Setting up virtual environment..." -ForegroundColor Cyan
if (Invoke-SafeCommand "python -m venv venv" "Creating virtual environment") {
    Write-Host "🔄 Activating virtual environment..." -ForegroundColor Yellow
    & ".\venv\Scripts\Activate.ps1"
    Write-Host "✅ Virtual environment activated" -ForegroundColor Green
} else {
    Write-Host "⚠️  Continuing with global Python installation..." -ForegroundColor Yellow
}

Write-Host ""

# Upgrade pip
Invoke-SafeCommand "python -m pip install --upgrade pip" "Upgrading pip"

# Install PyTorch CPU version
Write-Host ""
Write-Host "🔥 Installing PyTorch (CPU version)..." -ForegroundColor Cyan
Invoke-SafeCommand "python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu" "Installing PyTorch"

# Install AI and Computer Vision libraries
Write-Host ""
Write-Host "📚 Installing AI and Computer Vision libraries..." -ForegroundColor Cyan

$dependencies = @(
    "ultralytics>=8.0.0",
    "opencv-python>=4.8.0", 
    "numpy>=1.24.0",
    "websockets>=11.0.0",
    "Pillow>=10.0.0",
    "python-dotenv>=1.0.0",
    "pydantic>=2.0.0"
)

foreach ($dep in $dependencies) {
    Invoke-SafeCommand "python -m pip install $dep" "Installing $dep"
}

# Install development tools
Write-Host ""
Write-Host "🛠️  Installing development tools..." -ForegroundColor Cyan
$devDeps = @("pytest>=7.4.0", "black>=23.0.0", "flake8>=6.0.0")
foreach ($dep in $devDeps) {
    Invoke-SafeCommand "python -m pip install $dep" "Installing $dep"
}

# Test YOLOv8 installation
Write-Host ""
Write-Host "🤖 Testing YOLOv8 installation..." -ForegroundColor Cyan
try {
    python -c "from ultralytics import YOLO; model = YOLO('yolov8n.pt'); print('✅ YOLOv8 model downloaded successfully')"
    Write-Host "✅ YOLOv8 installation successful" -ForegroundColor Green
} catch {
    Write-Host "⚠️  YOLOv8 test failed: $_" -ForegroundColor Red
}

# Display completion message
Write-Host ""
Write-Host "🎉 Installation completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Place your MP4 video files in this directory" -ForegroundColor White
Write-Host "2. Run: python ai_module.py --video your_video.mp4" -ForegroundColor White  
Write-Host "3. The AI server will start on ws://localhost:8765" -ForegroundColor White
Write-Host "4. Go to the web app and navigate to /admin/live-feed" -ForegroundColor White
Write-Host ""
Write-Host "💡 Example usage:" -ForegroundColor Cyan
Write-Host "python ai_module.py --video 123.mp4 --fps 30" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to exit"
