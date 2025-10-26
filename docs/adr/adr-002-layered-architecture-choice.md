# ADR 002 – Escolha da Arquitetura em Camadas

**Título:** Escolha do estilo arquitetônico em camadas para o sistema Recicash </br>
**Data:** 05/10/2025 </br>
**Status:** Aceito </br>
**Autor:** Equipe de Arquitetura Recicash </br>

## Contexto

O projeto Recicash está em fase inicial de desenvolvimento e visa conectar clientes, ecopontos e empresas parceiras por meio de um sistema de pontuação e recompensas.
Neste momento, o sistema necessita de uma arquitetura simples, estável e facilmente compreensível, que permita evolução gradual e mantenha baixo custo de manutenção.
As integrações externas (ex: Google Maps API) devem ser mediadas pelo backend para garantir segurança das credenciais, controle de requisições e uniformidade nas respostas.

## Decisão

Adotar o estilo arquitetônico em camadas (Layered Architecture) como base da organização do backend. As camadas principais serão:

* Presentation (Interface/API Layer): expõe endpoints REST para consumo do frontend.
* Application (Service Layer): orquestra casos de uso, valida regras e coordena entidades.
* Domain (Core Business Layer): contém entidades, modelos e regras puras de negócio.
* Infrastructure (Data & Integration Layer): lida com persistência, APIs externas e provedores de serviços.

Todas as chamadas externas (ex: Google Maps, parceiros de cupons) serão mediadas por essa última camada, nunca diretamente pelo frontend.

## Motivações

* Clareza e separação de responsabilidades.
* Fácil entendimento por desenvolvedores novos.
* Flexibilidade para migração futura para Clean Architecture ou Microservices.
* Facilidade de teste unitário e integração controlada.
* Centralização de regras de segurança e acesso externo.

## Consequências

* O backend assume papel de gateway entre frontend e serviços externos.
* Pequeno overhead de manutenção na camada de orquestração, compensado por segurança e manutenibilidade.

## Alternativas Consideradas

* Microserviços: descartado no momento, pois o sistema ainda é pequeno e não há necessidade de isolamento de domínios.
