import os

import uvicorn
from starlette.middleware.cors import CORSMiddleware

api_key = os.getenv("GOOGLE_API_KEY")

from google import genai
from google.genai import types

from fastapi import FastAPI
from fastapi.responses import StreamingResponse

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

system_prompt="You are a large language model, don't use '*' around words or emojis for example."

@app.post("/gemini")
async def send_prompt(message:str="Explain how AI works in a few words"):
    client = genai.Client(api_key=api_key)

    #todo based on a timer i guess, the system prompts will change, making it more deranged

    def stream():
        # get the response in chunks rather than one at once
        for chunk in client.models.generate_content_stream(
            model="gemini-2.5-flash", contents=message,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt),
        ):
            if chunk.text:
                yield chunk.text

    return StreamingResponse(stream(), media_type="text/plain")

