# Backend – Nova Estrutura e Localização dos Arquivos

Resumo

- Refatoração para arquitetura em camadas conforme ADR 002.
- Objetivo: organizar o código em Domain, Application, Presentation e Infrastructure para reduzir acoplamento e clarificar responsabilidades.

Estrutura principal

```bash
core/
├── domain/          # Entidades e regras do domínio
├── application/     # Casos de uso e orquestração
├── presentation/    # Endpoints, views/controllers e roteamento
└── infrastructure/  # Integrações externas, ORM, sinais, permissões, migrations
```

## Mapeamento de arquivos

Observação: caminhos à esquerda são os locais anteriores; à direita, os novos locais dentro de `core/`.

### 1. Domain — Entidades e lógica essencial

| Antes                            | Agora                                      |
|----------------------------------|--------------------------------------------|
| `apps/entities/models.py`        | `core/domain/entities/`                    |
| `apps/entities/message.py`       | `core/domain/entities/message.py`          |
| `apps/entities/authentication.py`| `core/domain/entities/authentication.py`   |

### 2. Application — Casos de uso e regras de aplicação

| Antes                             | Agora                                            |
|-----------------------------------|--------------------------------------------------|
| `apps/services/blog_service.py`   | `core/application/use_cases/blog_search_service.py` |
| `apps/services/hello_service.py`  | `core/application/use_cases/health_check_service.py` |
| `apps/services/paginator_service.py` | `core/application/use_cases/pagination_service.py`   |

### 3. Presentation — HTTP / API / Roteamento

| Antes                         | Agora                                  |
|-------------------------------|----------------------------------------|
| `apps/views/blog_view.py`     | `core/presentation/api/blog_view.py`   |
| `apps/views/hello_view.py`    | `core/presentation/api/hello_view.py`  |
| `apps/views/user_view.py`     | `core/presentation/api/user_view.py`   |
| `apps/entities/urls.py`       | `core/presentation/routers/api.py`     |

### 4. Infrastructure — Integrações e infra local

| Antes                         | Agora                                  |
|-------------------------------|----------------------------------------|
| `apps/entities/serializers.py`| `core/infrastructure/serializers/`     |
| `apps/entities/signals.py`    | `core/infrastructure/signals/`         |
| `apps/entities/permissions.py`| `core/infrastructure/permissions/`     |
| `apps/entities/migrations/`   | `core/infrastructure/migrations/`      |
| `apps/entities/management/`   | `core/infrastructure/management/`      |
| Integrations                   | `core/infrastructure/integrations/`    |

### Testes

| Antes               | Agora   |
|---------------------|---------|
| `apps/tests/`       | `tests/`|

## Benefícios

- Clareza: responsabilidades bem definidas por camada.
- Baixo acoplamento entre camadas.
- Facilita onboarding e manutenção.
- Melhora rastreabilidade e documentação.

## Guia rápido — onde adicionar novo código

- Novo endpoint: `core/presentation/api/`
- Novo caso de uso: `core/application/use_cases/`
- Nova regra de negócio: `core/domain/`
- Nova integração externa: `core/infrastructure/integrations/`
- Novo comando/management: `core/infrastructure/management/commands/`

> [!NOTE]
>
> - Mantenha dependências unidirecionais (p. ex. Presentation -> Application -> Domain; Infrastructure fornece implementações).
> - Atualize referências e imports ao mover arquivos.
> - Para dúvidas sobre um mapeamento específico, consulte o histórico de commits ou abra uma issue no repositório.