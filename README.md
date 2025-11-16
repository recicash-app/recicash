# Recicash

O Recicash é uma plataforma que promove a conscientização ambiental e incentiva a reciclagem. O site oferece informações sobre a importância da reciclagem, orientações para a separação correta de resíduos, um mapa interativo e um sistema de busca para localizar ecopontos na cidade.  Além disso, o projeto busca estabelecer parcerias com empresas sustentáveis e órgãos públicos para oferecer benefícios financeiros, como cashback ou cupons de desconto, proporcionais à quantidade de material reciclado.

## Stack do Projeto

- **Backend:** Desenvolvido em Python com o Framework Django.
- **Frontend:** Construído com React JSX, garantindo uma interface dinâmica e responsiva.
- **Banco de Dados:** PostgreSQL, utilizado para armazenamento eficiente de dados relacionais.
- **Containerização:** Docker e Docker Compose para padronização e isolamento do ambiente.
- **API:** Integração com Google Maps API para exibição de mapas e localização de ecopontos.



## Como Rodar o Projeto

Antes de rodar o projeto, é necessário preencher o arquivo `.env` com as variáveis de ambiente. Utilize o arquivo `.env.example` como referência, copiando e preenchendo os valores necessários. Além disso, certifique-se de ter o Docker e o Docker Compose instalados.

1. Para construir as imagens e subir os containers, faça:

    ```bash
    make docker-up
    ```

2. Para derrubar todos os containers, faça:

    ```bash
    make docker-down
    ```

3. Para acessar o container do banco de dados local, faça:

    ```bash
    make access-data-base
    ```

## Acessando a Aplicação

Após subir os containers, acesse cada serviço pelos seguintes endereços:

- **Backend (API):** http://api.docker.localhost
- **Client:** http://web.docker.localhost
- **Admin:** http://admin.docker.localhost
- **Ecoponto:** http://ecoponto.docker.localhost
- **Dashboard Traefik:** http://localhost:8080

## Aplicando Migrações do Banco de Dados

Este passo traduz os Models Python (definidos em [models.py](./backend/src/apps/entities/models.py)) para tabelas reais no banco de dados PostgreSQL.

1. **Criando arquivos de migração**: para gerar os arquivos .py em [migrations/](./backend/src/apps/entities/migrations/), faça:

    ```bash
    docker-compose exec backend python manage.py makemigrations entities
    ```

2. **Aplicando as Migrações**: para aplicar as alterações ao banco de dados, criando todas as tabelas e relacionamentos definidos nos Models, faça:

    ```bash
    docker-compose exec backend python manage.py migrate
    ```

## População de Dados Iniciais

Este passo insere os registros iniciais no banco de dados. Para isso, basta utilizar o comando populate_initial_data, definido no aplicativo entities, diretamente:

```bash
docker-compose exec backend python manage.py populate_initial_data
```

Se o comando for bem-sucedido, você verá logs formatados no console, indicando a criação dos registros.
