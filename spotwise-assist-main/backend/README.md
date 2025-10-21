# Spotwise AI Backend

Live camera feed simulation with YOLOv8 car detection using OpenCV frame extraction.

## 🚀 Quick Installation

### Option 1: Automated Installation (Recommended)

**Windows Batch File:**
```bash
# Double-click or run in Command Prompt
install_dependencies.bat
```

**PowerShell Script:**
```powershell
# Run in PowerShell
.\install_dependencies.ps1
```

**Python Setup Script:**
```bash
python setup.py
```

### Option 2: Manual Installation

1. **Install Python 3.8+** (if not already installed)
   - Download from https://python.org
   - Make sure to add Python to PATH

2. **Create Virtual Environment** (recommended)
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. **Install Dependencies**
   ```bash
   # Upgrade pip
   python -m pip install --upgrade pip
   
   # Install PyTorch (CPU version)
   pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
   
   # Install AI libraries
   pip install -r requirements.txt
   ```

## 📦 Dependencies

- **ultralytics** - YOLOv8 object detection
- **opencv-python** - Computer vision and video processing  
- **numpy** - Numerical computing
- **torch & torchvision** - PyTorch deep learning framework
- **websockets** - Real-time communication
- **Pillow** - Image processing
- **python-dotenv** - Environment variables
- **pydantic** - Data validation

## 🎥 Usage

### Basic Usage
```bash
# Start AI server with your video
python ai_module.py --video path/to/your/video.mp4
```

### Advanced Options
```bash
# Custom settings
python ai_module.py \
  --video 123.mp4 \
  --model yolov8s.pt \
  --host localhost \
  --port 8765 \
  --fps 30
```

### Command Line Arguments
- `--video` - Path to input MP4 video file (required)
- `--model` - YOLOv8 model file (default: yolov8n.pt)
- `--host` - WebSocket server host (default: localhost)
- `--port` - WebSocket server port (default: 8765)
- `--fps` - Simulation frame rate (default: 30)

## 🔧 Configuration

### YOLOv8 Models
- **yolov8n.pt** - Nano (6MB, fastest)
- **yolov8s.pt** - Small (22MB, balanced)  
- **yolov8m.pt** - Medium (50MB, accurate)
- **yolov8l.pt** - Large (87MB, most accurate)

### Supported Video Formats
- MP4, AVI, MOV, WebM
- H.264, H.265 codecs
- Various resolutions (720p, 1080p, 4K)

## 🌐 Frontend Integration

1. **Start the AI server** (this backend)
2. **Open the web application**
3. **Navigate to** `/admin/live-feed`
4. **Upload your MP4 video**
5. **Connect to AI server** and start detection

## 🐛 Troubleshooting

### Common Issues

**"ModuleNotFoundError: No module named 'cv2'"**
```bash
pip install opencv-python
```

**"Could not find a version that satisfies the requirement torch"**
```bash
# Install CPU version explicitly
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
```

**"WebSocket connection failed"**
- Check if the AI server is running
- Verify the port (default: 8765) is not blocked
- Try restarting the server

**"Video file not found"**
- Use absolute path to video file
- Check file permissions
- Ensure video format is supported

### Performance Tips

1. **Use smaller YOLOv8 models** (yolov8n.pt) for faster processing
2. **Reduce FPS** for lower CPU usage
3. **Use lower resolution videos** for better performance
4. **Close other applications** to free up system resources

## 📊 System Requirements

- **Python**: 3.8 or higher
- **RAM**: 4GB minimum, 8GB recommended
- **CPU**: Multi-core processor recommended
- **Storage**: 2GB free space for models and dependencies
- **OS**: Windows 10+, macOS 10.14+, Ubuntu 18.04+

## 🔗 API Reference

### WebSocket Messages

**Frame Data:**
```json
{
  "type": "frame",
  "frame": "base64_encoded_image",
  "detections": {
    "detections": [...],
    "count": 5,
    "frame_number": 1234,
    "timestamp": 1697123456.789
  },
  "fps": 30,
  "resolution": {"width": 1920, "height": 1080}
}
```

**Detection Object:**
```json
{
  "class_id": 2,
  "class_name": "car",
  "confidence": 0.85,
  "bbox": {
    "x1": 100, "y1": 200,
    "x2": 300, "y2": 400
  }
}
```

## 📄 License

This project is part of the Spotwise parking management system.
