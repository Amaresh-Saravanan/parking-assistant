#!/usr/bin/env python3
"""
Startup script for the camera system with your 3 videos
"""

import os
import sys
import subprocess
import time
from pathlib import Path

def check_videos():
    """Check if the video files exist"""
    video_dir = Path("../public/videos")
    videos = [
        "123.mp4",
        "WhatsApp Video 2025-10-13 at 8.04.43 PM.mp4", 
        "WhatsApp Video 2025-10-13 at 20.04.43_d2fc0054.mp4"
    ]
    
    print("🎥 Checking for video files...")
    
    if not video_dir.exists():
        print(f"❌ Video directory not found: {video_dir}")
        print("📁 Please create the directory: public/videos/")
        return False
    
    missing_videos = []
    for video in videos:
        video_path = video_dir / video
        if video_path.exists():
            print(f"✅ Found: {video}")
        else:
            print(f"❌ Missing: {video}")
            missing_videos.append(video)
    
    if missing_videos:
        print(f"\n📋 Please add these videos to {video_dir}:")
        for video in missing_videos:
            print(f"   - {video}")
        return False
    
    return True

def start_ai_server(video_path=None):
    """Start the AI server"""
    print("🚀 Starting AI Camera Analytics Server...")
    
    cmd = ["python", "ai_module.py"]
    if video_path:
        cmd.extend(["--video", video_path])
    
    try:
        process = subprocess.Popen(cmd, 
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.PIPE,
                                 text=True)
        
        print("✅ AI Server started successfully!")
        print("🌐 Server running on: ws://localhost:8765")
        print("📱 Open your web app and navigate to: /admin/live-feed")
        print("\n🎮 Controls:")
        print("   - Upload videos in the Media Configuration tab")
        print("   - Connect to Analytics Engine")
        print("   - Start real-time vehicle detection")
        print("\n⏹️  Press Ctrl+C to stop the server")
        
        # Keep the process running
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n🛑 Stopping AI Server...")
            process.terminate()
            process.wait()
            print("✅ Server stopped successfully!")
            
    except FileNotFoundError:
        print("❌ Error: ai_module.py not found")
        print("📁 Make sure you're in the backend directory")
        return False
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return False
    
    return True

def main():
    print("=" * 60)
    print("🎯 ParkVision AI - Camera Analytics System")
    print("=" * 60)
    
    # Check if we're in the right directory
    if not os.path.exists("ai_module.py"):
        print("❌ Please run this script from the backend directory")
        print("📁 cd backend")
        print("🐍 python start_camera_system.py")
        return
    
    # Check for video files
    if not check_videos():
        print("\n💡 Quick Setup:")
        print("1. Create folder: public/videos/")
        print("2. Copy your 3 MP4 files to that folder")
        print("3. Run this script again")
        return
    
    # Check dependencies
    try:
        import cv2
        import ultralytics
        import websockets
        print("✅ All dependencies installed")
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("📦 Run: pip install -r requirements.txt")
        return
    
    # Start the server
    print("\n🎬 All videos found! Starting camera system...")
    start_ai_server()

if __name__ == "__main__":
    main()
