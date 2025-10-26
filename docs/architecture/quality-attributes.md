# Atributos de Qualidade

Este documento descreve os atributos de qualidade definidos para o sistema **Recicash** e as estratégias arquiteturais adotadas para garantir seu atendimento.

## 1. Segurança

**Descrição:** Garantir a confidencialidade e integridade dos dados dos usuários.

**Estratégias Arquiteturais:**

- Todas as chamadas externas são realizadas via backend (Django), protegendo chaves e tokens.
- Autenticação e autorização gerenciadas por `Django Auth`.
- Uso obrigatório de HTTPS em produção.

## 2. Portabilidade e Adaptabilidade

**Descrição:** Interface responsiva e compatível com diferentes dispositivos e navegadores.

**Estratégias:**

- Desenvolvimento do frontend em React com design responsivo (Flexbox, CSS Grid).
- Separação entre frontend e backend via API REST, permitindo novos clientes (ex: mobile app).
- Testes de compatibilidade em navegadores modernos.

## 3. Desempenho

**Descrição:** Garantir busca eficiente de Ecopontos e respostas rápidas.

**Estratégias:**

- Cache local de resultados da API Google Maps.
- Monitoramento de métricas (tempo de resposta, uso de CPU e memória).
- Utilização de índices geoespaciais (PostGIS) para otimizar consultas de localização e distância.

## 4. Usabilidade e Learnability

**Descrição:** Interface intuitiva, fácil de aprender e usar.

**Estratégias:**

- Prototipação no Figma.
- Fluxos simples e consistentes de navegação.
- Padrões visuais uniformes e acessíveis (cores, tipografia).
- Feedback visual em ações do usuário.

## 5. Manutenibilidade e Testabilidade

**Descrição:** Facilidade de evolução e garantia de qualidade por meio de testes.

**Estratégias:**

- Arquitetura em camadas: separação clara de responsabilidades.
- Testes unitários (pytest / Django test framework) por camada.
- Containerização via Docker para padronizar o ambiente.
