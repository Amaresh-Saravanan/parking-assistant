# 🎥 Video Setup Guide for Camera System

## 📁 Step 1: Create Video Directory

Create this folder structure in your project:
```
spotwise-assist-main/
├── public/
│   └── videos/          ← Create this folder
│       ├── 123.mp4
│       ├── WhatsApp Video 2025-10-13 at 8.04.43 PM.mp4
│       └── WhatsApp Video 2025-10-13 at 20.04.43_d2fc0054.mp4
├── backend/
└── src/
```

## 📋 Step 2: Add Your Videos

Copy your 3 MP4 files to the `public/videos/` folder:

1. **123.mp4**
2. **WhatsApp Video 2025-10-13 at 8.04.43 PM.mp4**
3. **WhatsApp Video 2025-10-13 at 20.04.43_d2fc0054.mp4**

## 🚀 Step 3: Start the System

### Option A: Easy Startup (Recommended)
```bash
cd backend
python start_camera_system.py
```

### Option B: Manual Startup
```bash
cd backend
pip install -r requirements.txt
python ai_module.py
```

## 🌐 Step 4: Use the Web Interface

1. **Open your web application**
2. **Navigate to**: `/admin/live-feed`
3. **Go to "Media Configuration" tab**
4. **Select one of your videos** from the Demo Content Library
5. **Switch to "Analytics Dashboard" tab**
6. **Click "Initialize Analytics Engine"**
7. **Click "Begin Analysis"**

## 🎯 Features Available

### 📱 Media Configuration Tab
- ✅ Upload new video files
- ✅ Select from your 3 demo videos
- ✅ Preview selected videos

### 📊 Analytics Dashboard Tab  
- ✅ Real-time vehicle detection
- ✅ Live video feed with bounding boxes
- ✅ Detection statistics (FPS, vehicle count)
- ✅ Frame-by-frame analysis

### 📚 Resources Tab
- ✅ Download sample videos
- ✅ AI model information
- ✅ Setup instructions

## 🔧 Troubleshooting

### Videos Not Loading?
- ✅ Check file paths match exactly
- ✅ Ensure videos are in `public/videos/` folder
- ✅ Verify file names have no special characters

### AI Server Not Starting?
```bash
# Install dependencies
pip install opencv-python ultralytics websockets numpy pillow

# Check if Python can find the files
python -c "import cv2, ultralytics; print('Dependencies OK')"
```

### Connection Issues?
- ✅ Make sure AI server is running on port 8765
- ✅ Check firewall settings
- ✅ Try restarting the server

## 📞 Quick Commands

```bash
# Check if videos exist
ls public/videos/

# Start AI server with specific video
python ai_module.py --video "../public/videos/123.mp4"

# Start with custom settings
python ai_module.py --video "../public/videos/123.mp4" --fps 30 --port 8765
```

## 🎉 Success Indicators

When everything is working correctly, you should see:

1. **✅ AI Server Console**: "Server running on ws://localhost:8765"
2. **✅ Web Interface**: Green "Active" status badge
3. **✅ Video Feed**: Live video with detection boxes
4. **✅ Statistics**: Real-time FPS and vehicle counts

Your camera system is now ready for AI-powered vehicle detection! 🚗🤖
