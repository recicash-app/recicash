# Google Maps Integration - Recycling Points API

Este documento descreve como usar o novo endpoint de Google Maps para recuperar a localização dos RecyclingPoints.

## Configuração

### 1. Instalar Dependências

A biblioteca `requests` já está no seu `requirements.txt`. Se não estiver, execute:

```bash
pip install requests
```

### 2. Configurar a Chave da API

Configure a chave da API do Google Maps como variável de ambiente:

```bash
export GOOGLE_MAPS_API_KEY="sua_chave_api_aqui"
```

Ou adicione ao seu arquivo `.env`:

```
GOOGLE_MAPS_API_KEY=sua_chave_api_aqui
```

### 3. Obter uma Chave da API do Google Maps

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto
3. Ative as seguintes APIs:
   - **Geocoding API** (para converter endereços em coordenadas)
   - **Places API** (para buscar pontos de reciclagem próximos)
   - **Maps SDK for JavaScript** (opcional, para visualização)
4. Gere uma chave de API (tipo Browser/Server)
5. Configure a chave como variável de ambiente

**Cuidado:** Proteja sua chave! Use restrições de IP e chaves diferentes para dev/prod.

## Endpoints

Todos os endpoints estão sob `/api/v1/recycling-points/`

### 1. Listar Todos os Recycling Points

```http
GET /api/v1/recycling-points/
```

**Resposta:**
```json
[
  {
    "recycling_point_id": 1,
    "name": "Ecoponto Centro",
    "latitude": -15.7942,
    "longitude": -48.0766,
    "cnpj": "12.345.678/0001-90",
    "zip_code": "70000-000"
  },
  ...
]
```

### 2. Recuperar um Recycling Point Específico

```http
GET /api/v1/recycling-points/{id}/
```

**Exemplo:**
```http
GET /api/v1/recycling-points/1/
```

### 3. Encontrar Recycling Points Próximos (Principal Endpoint)

```http
GET /api/v1/recycling-points/nearby/?lat=LATITUDE&lon=LONGITUDE&radius=RAIO&include_google=false
```

**Parâmetros de Query:**
- `lat` (obrigatório): Latitude do usuário (float, -90 a 90)
- `lon` (obrigatório): Longitude do usuário (float, -180 a 180)
- `radius` (opcional): Raio de busca em metros (padrão: 5000, máximo: 50000)
- `include_google` (opcional): Incluir resultados do Google Places API (true/false, padrão: false)

**Exemplo de Requisição:**
```bash
curl -X GET "http://localhost:8000/api/v1/recycling-points/nearby/?lat=-15.7942&lon=-48.0766&radius=10000"
```

**Exemplo de Resposta:**
```json
{
  "count": 3,
  "user_location": {
    "latitude": -15.7942,
    "longitude": -48.0766
  },
  "database_points": [
    {
      "recycling_point_id": 1,
      "name": "Ecoponto Centro",
      "latitude": -15.7938,
      "longitude": -48.0750,
      "cnpj": "12.345.678/0001-90",
      "zip_code": "70000-000",
      "distance_meters": 1450.25,
      "source": "database"
    },
    {
      "recycling_point_id": 2,
      "name": "Ecoponto Norte",
      "latitude": -15.7650,
      "longitude": -48.0800,
      "cnpj": "98.765.432/0001-10",
      "zip_code": "71000-000",
      "distance_meters": 3200.50,
      "source": "database"
    }
  ],
  "google_points": []
}
```

### 4. Geocodificar um Endereço

Converte um endereço em texto para coordenadas (latitude/longitude).

```http
GET /api/v1/recycling-points/geocode/?address=ENDERECO
```

**Parâmetros de Query:**
- `address` (obrigatório): Endereço a ser geocodificado (string)

**Exemplo de Requisição:**
```bash
curl -X GET "http://localhost:8000/api/v1/recycling-points/geocode/?address=Brasília%20DF%20Brasil"
```

**Exemplo de Resposta:**
```json
{
  "address": "Brasília DF Brasil",
  "latitude": -15.7942,
  "longitude": -48.0766
}
```

**Resposta de Erro:**
```json
{
  "error": "Could not geocode the provided address"
}
```

### 5. Obter Localização de um Recycling Point com Link do Google Maps

```http
GET /api/v1/recycling-points/{id}/location/
```

**Exemplo:**
```bash
curl -X GET "http://localhost:8000/api/v1/recycling-points/1/location/"
```

**Resposta:**
```json
{
  "recycling_point_id": 1,
  "name": "Ecoponto Centro",
  "latitude": -15.7942,
  "longitude": -48.0766,
  "cnpj": "12.345.678/0001-90",
  "zip_code": "70000-000",
  "maps_url": "https://www.google.com/maps?q=-15.7942,-48.0766"
}
```

## Exemplos de Uso no Frontend (JavaScript)

### Exemplo 1: Encontrar Pontos Próximos ao Usuário

```javascript
// Obter localização do navegador
navigator.geolocation.getCurrentPosition(async (position) => {
  const { latitude, longitude } = position.coords;
  
  const response = await fetch(
    `/api/v1/recycling-points/nearby/?lat=${latitude}&lon=${longitude}&radius=5000`
  );
  const data = await response.json();
  
  console.log(`Encontrados ${data.count} pontos de reciclagem`);
  data.database_points.forEach(point => {
    console.log(`${point.name}: ${point.distance_meters}m de distância`);
  });
});
```

### Exemplo 2: Geocodificar um Endereço e Encontrar Pontos Próximos

```javascript
async function findRecyclingPointsNearAddress(address) {
  // Primeiro, geocodificar o endereço
  const geocodeResponse = await fetch(
    `/api/v1/recycling-points/geocode/?address=${encodeURIComponent(address)}`
  );
  const geoData = await geocodeResponse.json();
  
  if (geoData.error) {
    console.error('Endereço não encontrado');
    return;
  }
  
  // Depois, buscar pontos próximos
  const nearbyResponse = await fetch(
    `/api/v1/recycling-points/nearby/?lat=${geoData.latitude}&lon=${geoData.longitude}`
  );
  const nearbyData = await nearbyResponse.json();
  
  return nearbyData;
}

// Uso
const points = await findRecyclingPointsNearAddress('Brasília DF');
```

## Tratamento de Erros

### Erros Possíveis

| Código | Erro | Solução |
|--------|------|---------|
| 400 | Missing required parameter | Adicione os parâmetros obrigatórios |
| 400 | Invalid coordinates | Latitude (-90 a 90) e longitude (-180 a 180) |
| 404 | Could not geocode address | Endereço inválido ou muito vago |
| 500 | Server error | Verifique os logs da API |

### Exemplo de Tratamento

```javascript
async function fetchNearbyPoints(lat, lon) {
  try {
    const response = await fetch(
      `/api/v1/recycling-points/nearby/?lat=${lat}&lon=${lon}`
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar pontos próximos:', error.message);
  }
}
```

## Otimizações e Considerações

### 1. Caching
Para evitar chamadas repetidas à API do Google Maps, implemente caching no frontend:

```javascript
const pointsCache = new Map();

async function getCachedPoints(address) {
  if (pointsCache.has(address)) {
    return pointsCache.get(address);
  }
  
  const points = await findRecyclingPointsNearAddress(address);
  pointsCache.set(address, points);
  return points;
}
```

### 2. Usar Apenas Pontos do Banco de Dados
Se seu banco de dados já tem todos os recycling points, use apenas `database_points`:

```javascript
const response = await fetch(
  `/api/v1/recycling-points/nearby/?lat=-15.7942&lon=-48.0766&include_google=false`
);
```

### 3. Buscar com Google Places
Se quiser enriquecer os resultados com dados do Google:

```javascript
const response = await fetch(
  `/api/v1/recycling-points/nearby/?lat=-15.7942&lon=-48.0766&include_google=true`
);
const data = await response.json();
// Combina pontos do BD com sugestões do Google
```

### 4. Performance - Usar PostGIS (Produção)
Para performance com muitos recycling points, use PostGIS:

```python
# No seu settings.py, ative o GeoDjango
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.spatialite',
        # ... outras configurações
    }
}
```

Depois use query GIS no serviço:

```python
from django.contrib.gis.db.models.functions import Distance
from django.contrib.gis.geos import Point

point = Point(longitude, latitude)
nearby = RecyclingPoint.objects.annotate(
    distance=Distance('point_field', point)
).filter(distance__lte=5000).order_by('distance')
```

## Estrutura de Arquivos Adicionados

```
/apps/
  /services/
    google_maps_service.py          # Serviço para integração com Google Maps
  /views/
    recycling_point_view.py         # ViewSet com endpoints
  /entities/
    serializers.py                  # Serializers atualizados
    urls.py                         # URLs atualizadas
```

## Troubleshooting

### Problema: "GOOGLE_MAPS_API_KEY is not configured"
- Certifique-se de que a variável de ambiente está configurada
- Reinicie o servidor após configurar a variável

### Problema: "Could not geocode the provided address"
- Verifique se o endereço é válido
- Tente ser mais específico (incluir cidade, estado, país)

### Problema: Nenhum ponto encontrado mesmo próximo
- Verifique se existem RecyclingPoints no banco de dados
- Aumente o raio de busca
- Use a API de geocodificação para verificar as coordenadas

### Problema: Erro 401 Unauthorized (Google Maps)
- Verifique se a chave de API é válida
- Confirme que as APIs estão ativas no Google Cloud Console
- Verifique as restrições de IP (se configuradas)

---

**Última atualização:** 21 de Novembro de 2025
