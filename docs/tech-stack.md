# Recicash – Tech Stack

## Backend

| Tecnologia                      | Motivo                                                                                   |
| ------------------------------- | ---------------------------------------------------------------------------------------- |
| **Python + Django**             | Framework robusto, com autenticação, ORM e administração nativos.                        |
| **Django REST Framework (DRF)** | Facilita a criação de APIs RESTful, com serialização e controle de permissões.           |
| **Requests / GeoDjango**        | Integração com a Google Maps API e manipulação de dados geoespaciais.                    |

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
| **MySQL**                     | Banco relacional robusto, com compatibilidade total com o Django ORM.                    |
| **GeoDjango / MySQL Spatial** | Suporte nativo a tipos de dados geográficos (para localização de ecopontos).             |

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
