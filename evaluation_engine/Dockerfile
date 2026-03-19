FROM python:3.11-slim

WORKDIR /app

# Install Python dependencies (separate layer for caching)
COPY requirements.txt .
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

# Copy package source
COPY . ./evaluation_engine

# Non-root user for security
RUN useradd --create-home appuser
USER appuser

CMD ["python"]
