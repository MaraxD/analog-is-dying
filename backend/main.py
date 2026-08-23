import os
import json
from datetime import datetime
import uvicorn
from starlette.middleware.cors import CORSMiddleware
import serial
import serial.tools.list_ports
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")

from google import genai
from google.genai import types

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize serial connection
arduino_serial = None
try:
    # Attempt to find the Arduino port automatically across OS
    ports = list(serial.tools.list_ports.comports())
    arduino_port = None
    for p in ports:
        # Match Mac/Linux (usbmodem, ttyACM, ttyUSB) and Windows (Arduino, CH340, CP210x, or standard COM ports)
        if "usbmodem" in p.device or "ttyACM" in p.device or "ttyUSB" in p.device:
            arduino_port = p.device
            break
        # Windows typically lists the manufacturer description.
        # "Arduino", "CH340" (common clone chip), or "CP210x" are standard.
        if p.description and ("Arduino" in p.description or "CH340" in p.description or "CP210" in p.description):
            arduino_port = p.device
            break
        # Fallback for Windows if it just says "USB Serial Device (COM3)"
        if "COM" in p.device and "USB" in p.description:
            arduino_port = p.device
            break
    
    if arduino_port:
        # On Windows, using DTR/RTS manipulation sometimes bypasses port locking issues
        arduino_serial = serial.Serial()
        arduino_serial.port = arduino_port
        arduino_serial.baudrate = 9600
        arduino_serial.timeout = 1
        
        # Disable hardware flow control before opening to prevent locking on some Windows drivers
        arduino_serial.setDTR(False)
        arduino_serial.setRTS(False)
        
        arduino_serial.open()
        print(f"Connected to Arduino on {arduino_port}")
    else:
        print("No Arduino found. Running without motor support.")
except Exception as e:
    print(f"Error connecting to Arduino: {e}")

@app.post("/reset-motor")
async def reset_motor():
    """Reset the motor state back to level 0 when the frontend times out or reloads.
    Does NOT clear the conversation log - that only happens when the user explicitly
    creates a new chat.
    """
    if arduino_serial and arduino_serial.is_open:
        try:
            arduino_serial.write(b'0')
            return {"status": "success", "message": "Motor reset to level 0"}
        except Exception as e:
            return {"status": "error", "message": f"Error writing to serial: {e}"}
    return {"status": "error", "message": "Arduino not connected"}

@app.post("/clear-log")
async def clear_log():
    """Since logs are now stored per-session in the logs/ folder, we no longer delete them.
    This endpoint remains to not break frontend compatibility when 'New Chat' is clicked.
    """
    return {"status": "success", "message": "Logs are now preserved per-session."}

def log_conversation(session_id, user_msg, ai_msg, level):
    """Appends the interaction to a session-specific JSON log file."""
    logs_dir = "logs"
    if not os.path.exists(logs_dir):
        os.makedirs(logs_dir)
        
    log_file = os.path.join(logs_dir, f"conversation_{session_id}.json")
    
    entry = {
        "timestamp": datetime.now().isoformat(),
        "level": level,
        "user": user_msg,
        "ai": ai_msg
    }
    
    logs = []
    if os.path.exists(log_file):
        try:
            with open(log_file, "r") as f:
                logs = json.load(f)
        except:
            pass
            
    logs.append(entry)
    with open(log_file, "w") as f:
        json.dump(logs, f, indent=2)

class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []
    system_prompt: str = ""
    level: int = 0
    session_id: str = "default"

@app.post("/gemini")
async def send_prompt(request: ChatRequest):
    
    # Send the current AI "craziness" level to the Arduino motor
    if arduino_serial and arduino_serial.is_open:
        try:
            # We send the level as a string ('0', '1', '2', '3')
            arduino_serial.write(str(request.level).encode('utf-8'))
        except Exception as e:
            print(f"Error writing to serial: {e}")

    client = genai.Client(api_key=api_key)

    # Convert frontend history to Gemini format
    formatted_contents = []
    
    # We must ensure that system_instruction is handled cleanly
    # And we must filter out empty messages to avoid API errors
    for msg in request.history:
        role = "model" if msg.get("role") == "ai" else "user"
        text = msg.get("text", "").strip()
        
        # Gemini API crashes if it receives empty text parts in history
        if text:
            formatted_contents.append({
                "role": role,
                "parts": [{"text": text}]
            })
            
    # Add current message
    formatted_contents.append({
        "role": "user",
        "parts": [{"text": request.message.strip()}]
    })

    #todo based on a timer i guess, the system prompts will change, making it more deranged

    def stream():
        try:
            # Map the craziness level to the model's temperature
            # Level 0: 0.3 (Very focused/predictable)
            # Level 1: 0.8 (Standard/Slightly creative)
            # Level 2: 1.2 (Erratic but coherent)
            # Level 3: 1.8 (Highly chaotic, maximum hallucination)
            temperatures = [0.3, 0.8, 1.2, 1.8]
            current_temp = temperatures[request.level] if 0 <= request.level < len(temperatures) else 1.8

            # We use a high max_output_tokens for ALL levels to ensure the API 
            # never artificially cuts off sentences mid-word.
            # We rely entirely on the system prompts to control the length.
            current_tokens = 1000

            # get the response in chunks rather than one at once
            # Using the standard SDK way to start a chat session with history
            chat = client.chats.create(
                model="gemini-2.5-flash",
                config=types.GenerateContentConfig(
                    system_instruction=request.system_prompt,
                    temperature=current_temp,
                    max_output_tokens=current_tokens # Dynamically scales up at the end
                ),
                history=formatted_contents[:-1] # Everything except the current message
            )
            
            full_ai_response = ""
            for chunk in chat.send_message_stream(formatted_contents[-1]["parts"][0]["text"]):
                if chunk.text:
                    full_ai_response += chunk.text
                    yield chunk.text
            
            # Log the completed interaction to the file
            log_conversation(request.session_id, request.message, full_ai_response, request.level)
                    
        except Exception as e:
            print(f"Error during generation: {e}")
            yield f"Error: {str(e)}"

    return StreamingResponse(stream(), media_type="text/plain")

