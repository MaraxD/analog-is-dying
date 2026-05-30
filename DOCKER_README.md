# Analog Is Dying (Gemini Glitch Project)

This project contains a React frontend and a FastAPI backend. It's fully containerized using Docker so you can easily run it on any machine without needing to install Node or Python locally.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Running the project

1. Create a `.env` file in the root directory (where `docker-compose.yml` is) and add your Google API Key:
   ```bash
   GOOGLE_API_KEY=your_api_key_here
   ```

2. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:8000](http://localhost:8000)

## Stopping the project

To stop the containers, press `Ctrl+C` in the terminal where they are running, or run:
```bash
docker-compose down
```
