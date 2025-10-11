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

| Caminho                                                                                                                                                  | Conteúdo Principal                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| [`/architecture`](./architecture)                                             | Descrição geral da arquitetura e seus componentes.                                               |
| [`/architecture/diagrams`](./architecture/diagrams)                           | Diagramas C4 (Context, Container e Component).                                                   |
| [`/architecture/layers-description.md`](./architecture/layers-description.md) | Explicação detalhada das camadas do backend (Presentation, Application, Domain, Infrastructure). |
| [`/architecture/quality-attributes.md`](./architecture/quality-attributes.md) | Atributos de qualidade considerados.                                 |
| [`/adr`](./adr)                                                               | *Architecture Decision Records (ADRs)* – decisões técnicas documentadas e justificadas.          |
| [`/tech-stack.md`](./tech-stack.md)                                           | Tecnologias e frameworks utilizados no sistema.                                                  |

## Visão Geral da Arquitetura

O **Recicash** segue o estilo **arquitetônico em camadas**, priorizando **manutenibilidade, testabilidade e segurança**.
As comunicações externas, como chamadas à **Google Maps API**, são tratadas exclusivamente pelo backend.

```text
Backend (Django)
├── Presentation Layer (Views / Controllers)
├── Application Layer (Services / Use Cases)
├── Domain Layer (Entities / Business Rules)
└── Infrastructure Layer (ORM, APIs externas)
```

## Stack

| Categoria          | Tecnologias e Ferramentas                              |
| ------------------ | ------------------------------------------------------ |
| **Backend**        | Python, Django, Django REST Framework                  |
| **Banco de Dados** | MySQL (com suporte a dados geoespaciais via GeoDjango) |
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
