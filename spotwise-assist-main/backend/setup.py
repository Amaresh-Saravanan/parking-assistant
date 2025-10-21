#!/usr/bin/env python3
"""
Setup script for Spotwise AI Backend
Installs all required dependencies for the live camera feed simulator
"""

import subprocess
import sys
import os

def run_command(command):
    """Run a command and return success status"""
    try:
        print(f"Running: {command}")
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ Success: {command}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error running {command}: {e}")
        print(f"Output: {e.output}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
    return True

def install_dependencies():
    """Install all required dependencies"""
    print("🚀 Installing Spotwise AI Backend Dependencies...")
    
    # Check Python version
    if not check_python_version():
        return False
    
    # Upgrade pip first
    print("\n📦 Upgrading pip...")
    if not run_command(f"{sys.executable} -m pip install --upgrade pip"):
        return False
    
    # Install PyTorch (CPU version for compatibility)
    print("\n🔥 Installing PyTorch...")
    if not run_command(f"{sys.executable} -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu"):
        return False
    
    # Install other dependencies
    dependencies = [
        "ultralytics>=8.0.0",
        "opencv-python>=4.8.0", 
        "numpy>=1.24.0",
        "websockets>=11.0.0",
        "Pillow>=10.0.0",
        "python-dotenv>=1.0.0",
        "pydantic>=2.0.0"
    ]
    
    print("\n📚 Installing AI and Computer Vision libraries...")
    for dep in dependencies:
        if not run_command(f"{sys.executable} -m pip install {dep}"):
            print(f"⚠️  Failed to install {dep}, continuing...")
    
    # Download YOLOv8 model
    print("\n🤖 Downloading YOLOv8 model...")
    try:
        from ultralytics import YOLO
        model = YOLO('yolov8n.pt')  # This will download the model
        print("✅ YOLOv8 nano model downloaded successfully")
    except Exception as e:
        print(f"⚠️  Could not download YOLOv8 model: {e}")
    
    print("\n🎉 Installation completed!")
    print("\n📋 Next steps:")
    print("1. Place your MP4 video files in the backend directory")
    print("2. Run: python ai_module.py --video your_video.mp4")
    print("3. The server will start on ws://localhost:8765")
    
    return True

if __name__ == "__main__":
    success = install_dependencies()
    if not success:
        print("\n❌ Installation failed. Please check the errors above.")
        sys.exit(1)
    else:
        print("\n✅ All dependencies installed successfully!")
