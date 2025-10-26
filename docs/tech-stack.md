# Recicash – Tech Stack

## Backend

| Tecnologia                      | Motivo                                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| **Python + Django**             | Framework robusto, com autenticação, ORM e administração nativos.                        |
| **Django REST Framework (DRF)** | Facilita a criação de APIs RESTful, com serialização e controle de permissões.           |
| **GeoDjango**        | Integração com o banco de dados espacial (PostGIS) e manipulação de dados geográficos.             |

## Frontend

| Tecnologia             | Motivo                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------- |
| **React (JavaScript)** | Biblioteca amplamente utilizada, permite construção modular e responsiva da interface.   |
| **Axios**              | Biblioteca leve para comunicação HTTP entre frontend e backend.                          |
| **React Router**       | Gerenciamento de rotas e navegação entre páginas.                                        |
| **MUI (Material UI)**  | Componentes com design system moderno, consistente e acessível. Interfaces responsivas. |

## Banco de Dados

| Tecnologia                    | Motivo                                                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| **PostgreSQL**                     | Banco de dados relacional robusto e escalável, com excelente integração ao Django ORM.                    |
| **PostGIS (Extensão do PostgreSQL)** | Suporte avançado a tipos e consultas espaciais, ideal para funcionalidades de geolocalização (ecopontos, distâncias, coordenadas). |

## Ambiente de Desenvolvimento

| Tecnologia         | Motivo                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------- |
| **Docker**         | Criação de ambientes isolados e replicáveis, evitando conflitos de dependências.          |
| **Docker Compose** | Orquestração de múltiplos serviços (frontend, backend, banco de dados) localmente.        |

## Prototipação e APIs

| Tecnologia          | Motivo                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------- |
| **Figma**           | Ferramenta colaborativa para design responsivo e prototipação rápida.                    |
| **Google Maps API** | Permite exibir ecopontos próximos, rotas e coordenadas geográficas.                      |

## Ferramentas de Suporte

| Categoria                | Ferramenta                | Motivo                                                                                   |
| ------------------------ | ------------------------- | ---------------------------------------------------------------------------------------- |
| **Controle de versão**   | Git + GitHub              | Versionamento de código e documentação.                                                  |
| **Documentação técnica** | Markdown / Mermaid / ADRs | Estruturação e rastreabilidade das decisões arquiteturais.                               |
| **Testes**               |                           | Garantia de qualidade e manutenibilidade.                                                |
