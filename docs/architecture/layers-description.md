# Descrição das Camadas – Arquitetura em Camadas (Layered Architecture)

O sistema **Recicash** adota o estilo **arquitetônico em camadas**, no qual as responsabilidades são separadas em níveis bem definidos para garantir manutenibilidade, testabilidade e evolução futura.  

A seguir são descritas as camadas principais do **backend (Django)** e a integração com o **frontend (React)**.

## Visão Geral

```text
Frontend (React)
↓ REST / JSON
Backend (Django)
├── Presentation Layer (Views / Controllers)
├── Application Layer (Services / Use Cases)
├── Domain Layer (Entities / Business Rules)
└── Infrastructure Layer (ORM, APIs externas)
````

## 1. Presentation Layer

**Responsabilidade:** Expor a interface de comunicação do sistema (endpoints HTTP, autenticação, tratamento de requests/responses).

**Implementação:**

- Django REST Framework (`views.py`, `serializers.py`)
- Validação de entrada de dados (DTOs e serializers)
- Retorno padronizado de erros e mensagens

**Exemplo:**

```python
# views/ecopoint_view.py
class EcopointView(APIView):
    def get(self, request):
        return Response(EcopointSerializer(EcopointService.list_all()), status=200)
```

## 2. Application Layer

**Responsabilidade:** Contém a lógica de aplicação e orquestra os casos de uso, sem depender de frameworks externos.
Define **services** que coordenam regras, validam fluxos e invocam o domínio ou infraestrutura.

**Implementação:**

- `services/` dentro dos apps Django
- Métodos orientados a casos de uso (ex: `register_coupon`, `get_nearby_ecopoints`)

**Exemplo:**

```python
class EcopointService:
    @staticmethod
    def get_nearby(latitude, longitude):
        coords = GoogleMapsClient.find_nearby(latitude, longitude)
        return EcopointRepository.filter_by_coords(coords)
```

## 3. Domain Layer

**Responsabilidade:** Núcleo da aplicação – entidades, regras de negócio e validações puras (sem dependências externas).

**Implementação:**

- `models.py` (Django ORM como persistência)
- Regras de negócio encapsuladas em métodos de modelo
- Objetos de domínio independentes de APIs externas

**Exemplo:**

```python
class Coupon(models.Model):
    code = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    points = models.IntegerField(default=0)

    def redeem(self):
        if self.points <= 0:
            raise ValueError("Pontos insuficientes.")
        self.user.balance += self.points
        self.user.save()
```

## 4. Infrastructure Layer

**Responsabilidade:** Implementa detalhes técnicos (banco de dados, integrações externas, cache, fila de tarefas).

**Implementação:**

- Repositórios (`repositories/*.py`)
- Clientes de API (`integrations/google_maps.py`)
- Persistência via Django ORM

**Exemplo:**

```python
class GoogleMapsClient:
    @staticmethod
    def find_nearby(lat, lng):
        # Chamada intermediada via requests
        response = requests.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json", ...)
        return response.json()
```

## 5. Integração Frontend (React)

**Responsabilidade:** Consumir as APIs expostas pelo backend, exibir dados e permitir interação com o usuário.

**Implementação:**

- React + Axios para consumo de endpoints REST
- Hooks e componentes reutilizáveis
- Design responsivo (compatível com diferentes dispositivos)

## Benefícios

- **Isolamento de responsabilidades**
- **Alta testabilidade**
- **Fácil manutenção e evolução futura**
- **Camadas independentes e substituíveis (ex: trocar MySQL por Postgres)**
