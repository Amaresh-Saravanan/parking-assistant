@echo off
echo ========================================
echo  Spotwise AI Backend Setup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

echo ✅ Python detected
echo.

REM Create virtual environment (optional but recommended)
echo 📦 Creating virtual environment...
python -m venv venv
if %errorlevel% neq 0 (
    echo ⚠️  Could not create virtual environment, continuing with global install...
) else (
    echo ✅ Virtual environment created
    echo 🔄 Activating virtual environment...
    call venv\Scripts\activate.bat
)

echo.
echo 🚀 Installing dependencies...
echo.

REM Upgrade pip
echo 📦 Upgrading pip...
python -m pip install --upgrade pip

REM Install PyTorch CPU version
echo 🔥 Installing PyTorch (CPU version)...
python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

REM Install other dependencies
echo 📚 Installing AI libraries...
python -m pip install ultralytics>=8.0.0
python -m pip install opencv-python>=4.8.0
python -m pip install numpy>=1.24.0
python -m pip install websockets>=11.0.0
python -m pip install Pillow>=10.0.0
python -m pip install python-dotenv>=1.0.0
python -m pip install pydantic>=2.0.0

REM Install development tools
echo 🛠️  Installing development tools...
python -m pip install pytest>=7.4.0
python -m pip install black>=23.0.0
python -m pip install flake8>=6.0.0

echo.
echo 🤖 Testing YOLOv8 installation...
python -c "from ultralytics import YOLO; model = YOLO('yolov8n.pt'); print('✅ YOLOv8 model downloaded successfully')"

echo.
echo 🎉 Installation completed!
echo.
echo 📋 Next steps:
echo 1. Place your MP4 video files in this directory
echo 2. Run: python ai_module.py --video your_video.mp4
echo 3. The AI server will start on ws://localhost:8765
echo 4. Go to the web app and navigate to /admin/live-feed
echo.
echo 💡 Example usage:
echo python ai_module.py --video 123.mp4 --fps 30
echo.
pause
