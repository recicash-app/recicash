# Integração com Open Route Service

## Visão Geral

Foi implementada uma integração completa com a API do Open Route Service (ORS) para recuperar e gerenciar a localização dos RecyclingPoints. A solução inclui endpoints para:

- Listar todos os RecyclingPoints
- Encontrar pontos próximos a uma localização (com cálculo de distância Haversine)
- Geocodificar endereços (converter texto em coordenadas)
- Buscar pontos próximos a um endereço (geocodificação automática)
- Obter detalhes de localização com link do Google Maps

---

## Endpoints Disponíveis

### Base URL: `/api/v1/recycling-points/`

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Lista todos os ecopontos |
| GET | `/{id}/` | Recupera um ecoponto específico |
| GET | `/nearby/?latitude=X&longitude=Y` | Encontra pontos próximos usando coordenadas |
| GET | `/nearby/?latitude=X&longitude=Y&radius=R` | Busca com raio customizado (padrão: 5000m) |
| GET | `/nearby-address/?address=...` | Encontra pontos próximos a um endereço |
| GET | `/nearby-address/?address=...&radius=R` | Busca por endereço com raio customizado |

### Exemplos de Uso

Buscar pontos próximos usando coordenadas (5 km padrão):
```bash
curl "http://localhost:8000/api/v1/recycling-points/nearby/?latitude=-23.5505&longitude=-46.6333"
```

Buscar pontos próximos com raio customizado (10 km):
```bash
curl "http://localhost:8000/api/v1/recycling-points/nearby/?latitude=-23.5505&longitude=-46.6333&radius=10000"
```

Buscar pontos próximos a um endereço:
```bash
curl "http://localhost:8000/api/v1/recycling-points/nearby-address/?address=Rua+Augusta+1000,+São+Paulo,+SP"
```

Buscar pontos próximos a um endereço com raio customizado:
```bash
curl "http://localhost:8000/api/v1/recycling-points/nearby-address/?address=Rua+Augusta+1000,+São+Paulo,+SP&radius=10000"
```

---

## Como Configurar

### 1. Variável de Ambiente
Em um arquivo `.env`:
```
ORS_API_KEY=sua_chave_api_do_ors
```

### 2. Obter Chave da API (OpenRouteService)

1. Acesse [OpenRouteService](https://openrouteservice.org/sign-up/) e crie uma conta gratuita.
2. Após o login, vá até o painel de "API Keys".
3. Gere uma nova chave de API.
4. Copie a chave gerada.
5. Configure como variável de ambiente `ORS_API_KEY` no seu arquivo `.env`:

---

## Características Técnicas

### Validação de Parâmetros
- Validação de latitude (-90 a 90)
- Validação de longitude (-180 a 180)
- Limite de raio (máximo 50 km)
- Parâmetros obrigatórios checados
- Mensagens de erro descritivas

### Performance
- Cálculo de distância usando Haversine Formula
- Ordenação automática por distância
- Suporte a caching no frontend (cliente)

### Segurança
- Chave de API em variável de ambiente
- Logging completo de erros
- Tratamento de exceções robusto
- Sem exposição de dados sensíveis


---

## Exemplos de Uso

### JavaScript/Frontend

Buscar pontos próximos ao usuário (obtém localização do navegador):
```javascript
// Obter localização do dispositivo
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    
    // Fazer requisição ao backend
    fetch(
      `/api/v1/recycling-points/nearby/?latitude=${latitude}&longitude=${longitude}&radius=5000`
    )
      .then(res => res.json())
      .then(data => console.log('Pontos próximos:', data))
      .catch(err => console.error('Erro:', err));
  },
  (error) => {
    console.error('Erro ao obter localização:', error);
  }
);
```

Buscar pontos próximos a um endereço digitado:
```javascript
async function findPointsNearAddress(address) {
  const response = await fetch(
    `/api/v1/recycling-points/nearby-address/?address=${encodeURIComponent(address)}`
  );
  const data = await response.json();
  console.log('Pontos próximos:', data);
}

// Uso
findPointsNearAddress("Rua Augusta 1000, São Paulo, SP");
```

## Estrutura do Serviço

```
GoogleMapsService
├── geocode_address()
│   └── Converte endereço em coordenadas (ORS Geocoding API)
├── search_nearby_recycling_points()
│   └── Busca pontos próximos usando latitude/longitude
├── search_nearby_recycling_points_by_address()
│   ├── Geocodifica endereço
│   └── Busca pontos próximos
└── get_recycling_point_details()
    └── Retorna detalhes de um ponto específico
```

---
