# ADR 004 – Arquitetura de Microfrontends com Docker + Traefik

**Título:** Adoção de arquitetura modular de microfrontends orquestrada com Docker e Traefik </br>
**Data:** 12/10/2025 </br>
**Status:** Em análise </br>
**Autor:** Equipe de Arquitetura Recicash </br>

## Contexto

O frontend do **Recicash** abrange múltiplos contextos de uso — como o **aplicativo principal do cliente**, o **painel administrativo** e **módulos específicos** (por exemplo, ecopontos).

Com o crescimento do sistema, uma arquitetura de **SPA única** se tornou limitada para escalar equipes, implantações e responsabilidades. Surge, portanto, a necessidade de uma **abordagem modular e independente**, que mantenha integração visual e técnica sob um mesmo domínio.

## Decisão

Adotar uma **arquitetura de microfrontends baseada em múltiplas aplicações independentes**, integradas via **Docker Compose** e roteadas por meio de **Traefik**, utilizando um **monorepo unificado**.

Cada módulo do frontend será uma aplicação isolada, com seu próprio ciclo de build, deploy e versionamento, mas executada sob o mesmo ecossistema local e de produção.

### Estrutura proposta

```text
recicash-frontend/
│
├── apps/
│   ├── web/           ← app principal (usuário final)
│   ├── admin/         ← painel administrativo
│   └── ecoponto/      ← módulo independente
│
├── libs/              ← bibliotecas compartilhadas (UI, hooks, API, utils)
│
├── traefik/
│   └── traefik.yml
│
├── docker-compose.yml
└── package.json
```

### Domínios locais simulados

| App        | Domínio local               | Função                   |
| ---------- | --------------------------- | ------------------------ |
| `web`      | `web.docker.localhost`      | Aplicação principal      |
| `admin`    | `admin.docker.localhost`    | Painel administrativo    |
| `ecoponto` | `ecoponto.docker.localhost` | Módulo funcional isolado |

## Motivações

* **Modularidade:** dividir o frontend em múltiplas SPAs para facilitar o desenvolvimento e manutenção.
* **Escalabilidade:** permitir que diferentes equipes atuem de forma paralela e independente.
* **Isolamento de falhas:** uma aplicação pode ser atualizada sem impactar as demais.
* **Paridade com ambiente real:** Traefik permite simular subdomínios de produção sem alterar `/etc/hosts`.
* **Integração simples:** cada módulo é servido por Docker e unificado via proxy reverso.

## Considerações

### Pontos Positivos

* Permite **deploys independentes** por módulo.
* Facilita o **reuso de componentes** via pastas compartilhadas (`libs/ui`, `libs/api`).
* Reproduz **cenários reais de produção** com múltiplos subdomínios.
* Reduz acoplamento entre times e ciclos de release.

### Pontos Negativos

* Aumenta a **complexidade de setup local** (múltiplos containers).
* Requer atenção em **autenticação compartilhada** (cookies cross-domain).
* Pode gerar **overhead inicial** para pequenos times.
* A comunicação entre módulos deve ser padronizada (API REST, eventos globais, etc.).

## Ferramentas e Tecnologias

* **Build:** Vite / Node.js
* **Orquestração:** Docker Compose + Traefik
* **Gerenciamento de pacotes:** pnpm ou yarn workspaces (monorepo)
* **Design System:** biblioteca compartilhada `libs/ui`
* **Autenticação:** cookies com domínio comum (`.docker.localhost`)
* **Monitoramento:** painel do Traefik (porta 8080)

## Consequências Arquiteturais

* O **frontend** passa a ser estruturado como um **conjunto de microaplicações** integradas por roteamento dinâmico.
* **Deploys independentes** poderão ser implementados futuramente via pipelines Docker separados.
* O **proxy reverso** (Traefik) atua como ponto de entrada e roteador de requisições, simulando DNS local.
* A arquitetura suporta **crescimento incremental** — novos módulos podem ser adicionados com mínima fricção.

## Alternativas Consideradas

| Alternativa                      | Descrição                                                                        | Status                                               |
| -------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **SPAs em múltiplas portas**     | Cada app executa localmente em uma porta diferente (3000, 3001, 3002).           | Simples, mas não reflete ambiente de produção.       |
| **Subcaminhos em uma única SPA** | Painel e módulos servidos como rotas (`/admin`, `/ecoponto`).                    | Viável para apps pequenos.                    |
| **Docker + Traefik**             | Proxy reverso dinâmico com suporte automático a subdomínios `.docker.localhost`. | **Escolhida para análise.**                          |
