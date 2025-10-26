# Frontend do Recicash

## Sobre o Projeto
O frontend do Recicash foi desenvolvido utilizando o framework [**React**](https://react.dev/) e a ferramenta de build **Vite**. O projeto adota uma arquitetura **microfrontend**, permitindo o desenvolvimento, execução e implantação independentes de diferentes partes da aplicação, como cliente, admin e ecoponto.

## Arquitetura

O frontend está dividido em três microfrontends principais, cada um com seu próprio código, configuração e ponto de entrada:

- **Client:** Interface principal para usuários finais.
- **Admin:** Interface administrativa para gerenciamento do sistema.
- **Ecoponto:** Interface dedicada para funcionalidades relacionadas aos ecopontos.

Cada microfrontend está localizado em `frontend/apps/`:
- `app-client/`
- `app-admin/`
- `app-ecoponto/`

Os recursos compartilhados (componentes, estilos, assets) ficam em `frontend/shared/`.

O roteamento e o acesso externo a cada microfrontend são gerenciados pelo **Traefik** no ambiente Docker, utilizando diferentes subdomínios locais:
- Client: [http://client.docker.localhost](http://client.docker.localhost)
- Admin: [http://admin.docker.localhost](http://admin.docker.localhost)
- Ecoponto: [http://ecoponto.docker.localhost](http://ecoponto.docker.localhost)

## Dependências
As dependências do projeto estão listadas no arquivo `package.json` na raiz do diretório `frontend`. Para instalar as dependências localmente, utilize:

```bash
npm install
```
## Comandos Disponíveis

### lint:fix

O comando `lint:fix` executa o ESLint em todos os arquivos `.js` e `.jsx` dos microfrontends, identificando problemas de estilo e possíveis erros de código. Com a flag `--fix`, o ESLint tenta corrigir automaticamente os problemas encontrados, facilitando a manutenção da qualidade e padronização do código.

Os resultados e eventuais erros aparecem diretamente no terminal após a execução do comando.

Para facilitar o desenvolvimento e a padronização do código, utilize os comandos disponíveis no Makefile:

- **Rodar o lint:fix em cada microfrontend:**
  - Client:
    ```bash
    make lint-fix-web
    ```
  - Admin:
    ```bash
    make lint-fix-admin
    ```
  - Ecoponto:
    ```bash
    make lint-fix-ecoponto
    ```
  - Todos de uma vez:
    ```bash
    make lint-fix-all
    ```