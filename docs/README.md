# Documentação – Recicash

Este diretório concentra a **documentação técnica do sistema Recicash**, incluindo descrições arquiteturais, decisões de design e guias de referência para desenvolvedores.
O conteúdo foi elaborado de forma incremental, seguindo princípios de **transparência, rastreabilidade e evolução contínua da arquitetura**.

## Objetivo

A documentação busca:

* Descrever a **estrutura e o funcionamento do sistema Recicash**;
* Registrar **decisões arquiteturais e técnicas** tomadas durante o desenvolvimento;
* Apoiar a **manutenção e evolução do código** por novos colaboradores;
* Promover **clareza e rastreabilidade** das escolhas de design e padrões aplicados.

## Organização dos Documentos

| Caminho                                                                       | Conteúdo Principal                                                                               |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [`/architecture`](./architecture)                                             | Descrição geral da arquitetura e seus componentes.                                               |
| [`/architecture/diagrams`](./architecture/diagrams)                           | Diagramas C4 (Context, Container e Component).                                                   |
| [`/architecture/layers-description.md`](./architecture/layers-description.md) | Explicação detalhada das camadas do backend (Presentation, Application, Domain, Infrastructure). |
| [`/architecture/quality-attributes.md`](./architecture/quality-attributes.md) | Atributos de qualidade considerados.                                                             |
| [`/adr`](./adr)                                                               | *Architecture Decision Records (ADRs)* – decisões técnicas documentadas e justificadas.          |
| [`/tech-stack.md`](./tech-stack.md)                                           | Tecnologias e frameworks utilizados no sistema.                                                  |

## Visão Geral da Arquitetura

O **Recicash** adota uma arquitetura **em camadas no backend** e **modular no frontend**, visando **manutenibilidade**, **testabilidade**, **segurança** e **escalabilidade**.

As comunicações externas (como chamadas à **Google Maps API**) são tratadas exclusivamente pelo **backend**, garantindo proteção de chaves e centralização das integrações.

### Backend

O backend é baseado em **Django**, estruturado em camadas conforme o padrão **arquitetura em camadas (layered architecture)** definido na ADR 002.

```text
Backend (Django)
├── Presentation Layer (Views / Controllers)
├── Application Layer (Services / Use Cases)
├── Domain Layer (Entities / Business Rules)
└── Infrastructure Layer (ORM, APIs externas, PostGIS)
```

### Frontend

O frontend segue uma **abordagem modular inspirada em microfrontends** (ADR 004), separando os diferentes contextos de uso do sistema — **Cliente**, **Ecoponto** e **Administrativo** — em aplicações independentes, mas que compartilham bibliotecas comuns para manter consistência visual e lógica.

```text
Frontend (React)
├── apps/
│   ├── cliente/
│   ├── ecoponto/
│   └── admin/
└── shared/
    ├── ui/        (componentes visuais reutilizáveis)
    ├── hooks/     (lógica compartilhada)
    ├── utils/     (funções auxiliares)
    └── styles/    (tokens, temas, variáveis, CSS global)
```

Essa estrutura permite **desenvolvimento paralelo** entre equipes, **implantação independente** dos módulos e **reuso** de componentes compartilhados, mantendo uma **identidade visual e funcional unificada**.

## Tipos de Usuário

Esta seção descreve os **perfis de usuário** e seus acessos ao sistema, servindo como referência para entender **fluxos, permissões e casos de uso**.

### Usuário Visitante

* **Descrição:** Acessa apenas a landing page e funcionalidades de cadastro/login.
* **Exemplos de ações:** Visualizar informações institucionais; criar conta ou fazer login.

### Usuário Cliente

* **Descrição:** Acessa funcionalidades principais do sistema.
* **Exemplos de ações:** Visualizar mapa de ecopontos; acompanhar carteira de pontos; resgatar benefícios; acessar mural de posts educativos.

### Usuário Administrador

* **Descrição:** Responsável pela manutenção do sistema.
* **Exemplos de ações:** CRUD de posts; gerenciar empresas parceiras; cadastrar e gerenciar benefícios.

### Usuário Ecoponto

* **Descrição:** Contribuidor que registra descartes feitos pelos clientes.
* **Exemplos de ações:** Cadastrar descartes; gerar cupom correspondente para entrega ao cliente.

## Stack

| Categoria          | Tecnologias e Ferramentas                              |
| ------------------ | ------------------------------------------------------ |
| **Backend**        | Python, Django, Django REST Framework                  |
| **Banco de Dados** | PostgreSQL (suporte a dados geoespaciais via PostGIS)  |
| **Frontend**       | React, Material UI, Axios                              |
| **Ambiente**       | Docker, Docker Compose                                 |
| **Prototipação**   | Figma                                                  |
| **APIs externas**  | Google Maps API                                        |

## Padrões e Boas Práticas

* Separação de responsabilidades por camadas
* Comunicação controlada entre componentes
* Documentação de decisões via **ADRs**
* Modelagem visual segundo o **C4 Model**
* Acompanhamento dos **atributos de qualidade (RNFs)** definidos em reuniões técnicas

## Evolução da Documentação

Esta documentação está em **constante evolução** e será expandida conforme:

* Novas decisões arquiteturais forem registradas;
* Mudanças significativas ocorrerem na infraestrutura ou nos componentes;
* O sistema Recicash avançar em funcionalidades e integrações.

> [!IMPORTANT]
> Desenvolvedores são encorajados a atualizar esta documentação ao propor novas decisões ou alterações estruturais significativas.
