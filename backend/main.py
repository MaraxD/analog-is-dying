import os

import uvicorn
from starlette.middleware.cors import CORSMiddleware

api_key = os.getenv("GOOGLE_API_KEY")

from google import genai
from fastapi import FastAPI

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # your React dev server port
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/gemini")
async def send_prompt(message:str="Explain how AI works in a few words"):
    client = genai.Client(api_key=api_key)

    response = client.models.generate_content(
        model="gemini-3-flash-preview", contents=message
    )
    return {"response": response.text}

