import subprocess
import sys
import os

def install_dependencies():
    print("Installing dependencies with the correct versions...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    print("Dependencies installed successfully!")

def check_environment():
    try:
        import flask
        import werkzeug
        from flask_socketio import SocketIO
        print("All required packages are installed!")
        print(f"Flask version: {flask.__version__}")
        print(f"Werkzeug version: {werkzeug.__version__}")
        return True
    except ImportError as e:
        print(f"Missing dependency: {e}")
        return False

def run_server():
    print("Starting Flask server...")
    try:
        subprocess.Popen([sys.executable, "scores.py"])
        print("Flask server started successfully!")
        return True
    except Exception as e:
        print(f"Error starting Flask server: {e}")
        return False

if __name__ == "__main__":
    print("Setting up Kelime Tahmin Oyunu...")
    
    install_dependencies()
    
    if check_environment():
        run_server()
        print("\nServer is running! Open index.html in your browser to play the game.")
        print("You can press Ctrl+C to stop the server when you're done.")
    else:
        print("Environment check failed. Please fix the issues above and try again.")
