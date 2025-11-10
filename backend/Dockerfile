# Usando Python 3.12 oficial
FROM python:3.12-slim

# Diretório de trabalho
WORKDIR /app/src

# Atualiza e instala dependências do sistema para PostgreSQL/PostGIS
RUN apt-get update && apt-get install -y \
    build-essential \
    pkg-config \
    binutils libproj-dev gdal-bin libgdal-dev gcc python3-dev \
    && rm -rf /var/lib/apt/lists/*
    
# Copia arquivos de dependências
COPY requirements.txt ./

# Instala dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copia o restante do código
COPY src/ .  

# Expõe a porta do Django
EXPOSE 8000


