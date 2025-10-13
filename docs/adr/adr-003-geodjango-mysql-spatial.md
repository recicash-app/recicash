# ADR 003 – Uso de GeoDjango e MySQL Spatial

**Título:** Avaliação do uso de GeoDjango e MySQL Spatial para manipulação de dados geoespaciais </br>
**Data:** 09/10/2025 </br>
**Status:** Rejeitado </br>
**Autor:** Equipe de Arquitetura Recicash </br>

## Contexto

O Recicash prevê funcionalidades que envolvem geolocalização, como a exibição de **ecopontos próximos ao usuário** e o cálculo de distâncias entre pontos.
Essas operações demandam suporte eficiente a **dados espaciais** (coordenadas, áreas, distâncias), com integração ao banco relacional já utilizado pelo sistema.

Atualmente, o backend utiliza **Django**, que oferece o módulo **GeoDjango**, compatível com bancos de dados que implementam extensões espaciais, como **PostGIS (PostgreSQL)** e **MySQL Spatial**.
A equipe possui maior familiaridade com **MySQL**, tornando essa opção inicialmente mais viável em termos de configuração e manutenção.

## Decisão

**Em análise:**
Avaliar o uso de **GeoDjango** integrado ao **MySQL Spatial**, garantindo suporte a consultas geográficas e compatibilidade com o ORM do Django.
A decisão definitiva dependerá dos resultados de testes de desempenho e compatibilidade com as operações previstas (e.g., busca de ecopontos por raio e ordenação por distância).

## Motivações

* Necessidade de manipulação eficiente de coordenadas e cálculos geográficos.
* Redução de complexidade ao integrar a solução geoespacial diretamente ao ORM do Django.
* Aproveitamento da experiência da equipe com o ecossistema MySQL.
* Possibilidade de manter um único banco de dados unificado para dados comuns e espaciais.

## Consequências

* Pode haver **limitações de performance** em consultas espaciais complexas comparado ao PostGIS.
* Exige configuração adicional no ambiente Docker e dependências do GDAL.
* Facilita a implementação inicial de geolocalização sem necessidade de microserviço dedicado.

## Alternativas Consideradas

* **Armazenar coordenadas como float comuns:** Abordagem simplificada, mas inviável para operações geográficas complexas (ex.: cálculos de distância e filtros espaciais).
* **PostgreSQL + PostGIS:** solução mais madura para dados espaciais, com melhor performance e suporte a funções avançadas.
* **Serviço externo de geolocalização (Google Maps Distance Matrix API):** maior custo de requisições e dependência de terceiros.
