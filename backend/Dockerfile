# Using official Python 3.12 image
FROM python:3.12-slim

# Working directory
WORKDIR /app/src

# Update and install system dependencies for PostgreSQL/PostGIS
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    binutils libproj-dev gdal-bin libgdal-dev gcc python3-dev \
    && rm -rf /var/lib/apt/lists/*
    
# Copy dependency files
COPY requirements.txt ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the code
COPY src/ .  

# Expose Django port
EXPOSE 8000


