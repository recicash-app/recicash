# ADR 001 - Backend Intermediando chamadas de API

**Título:** Backend intermediando chamadas de APIs externas </br>
**Data:** 04/10/2025 </br>
**Status:** Aceito </br>
**Autor:** Equipe de Arquitetura Recicash </br>

## Contexto

No sistema Recicash, a interface com usuário precisa exibir informações de geolocalização obtidas via Google Maps API.  

## Decisão

Todas as chamadas à API do Google Maps serão intermediadas pelo backend.  

## Motivações

* Proteção de chaves de API.  
* Centralização de regras de negócio e tratamento de erros.  

## Consequências

O backend precisa conter endpoints específicos para mapas e roteamento, além de lidar com autenticação e cache.
