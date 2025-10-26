
# ADR 005 – Migração para PostgreSQL com PostGIS

**Título:** Adoção de PostgreSQL com PostGIS para suporte geoespacial integrado ao GeoDjango </br>
**Data:** 12/10/2025 </br>
**Status:** Aprovada </br>
**Autor:** Equipe de Arquitetura Recicash </br>
**Supersede:** ADR 003 – Uso de GeoDjango e MySQL Spatial </br>

## Contexto

O sistema Recicash utiliza **Django** e prevê funcionalidades baseadas em **geolocalização**, como a exibição de **ecopontos próximos ao usuário** e o cálculo de **distâncias entre pontos**.
Inicialmente, foi avaliado o uso de **MySQL Spatial** (ver ADR 003), mas os testes indicaram limitações de desempenho e suporte incompleto a funções espaciais avançadas necessárias para o projeto.

O módulo **GeoDjango** oferece integração nativa com **PostGIS**, extensão espacial do **PostgreSQL**, amplamente reconhecida por sua robustez e eficiência em consultas geográficas complexas.

## Decisão

A equipe decidiu **migrar o banco de dados para PostgreSQL**, habilitando a extensão **PostGIS** para gerenciamento e consultas espaciais.
A escolha visa otimizar as operações de geolocalização e garantir compatibilidade total com as ferramentas do Django.

## Motivações

* **Desempenho superior** em operações geoespaciais (consultas por raio, interseções, ordenações por distância).
* **Integração nativa** e estável com o **GeoDjango ORM**.
* **Confiabilidade e maturidade** do ecossistema PostGIS para dados geográficos.
* **Compatibilidade com bibliotecas Python** amplamente utilizadas em análise espacial.

## Consequências

* Requer **migração de dados** e **ajustes de configuração** no ambiente de desenvolvimento e produção (Docker, variáveis de ambiente, dependências).
* Possível **curva de aprendizado** para a equipe na administração do PostgreSQL.
* Melhoria significativa no **tempo de resposta** de consultas espaciais e na **escalabilidade** futura.

## Alternativas Consideradas

* **MySQL Spatial (rejeitado)** — suporte limitado e desempenho inferior em cálculos espaciais complexos.
* **Serviço externo (Google Maps Distance Matrix API)** — descartado por custos de requisição e dependência de terceiros.
