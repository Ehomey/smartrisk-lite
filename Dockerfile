# Use official Python runtime as base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy backend files
COPY Files/backend/ ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Expose port (Railway will override with $PORT)
EXPOSE 8000

# Run the application
CMD python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
