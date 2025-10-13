# Recicash

## Descrição do Projeto
O Recicash é uma plataforma que promove a conscientização ambiental e incentiva a reciclagem. O site oferece informações sobre a importância da reciclagem, orientações para a separação correta de resíduos, um mapa interativo e um sistema de busca para localizar ecopontos na cidade.  Além disso, o projeto busca estabelecer parcerias com empresas sustentáveis e órgãos públicos para oferecer benefícios financeiros, como cashback ou cupons de desconto, proporcionais à quantidade de material reciclado.

## Stack do Projeto

- **Backend:** Desenvolvido em Python com o Framework Django.
- **Frontend:** Construído com React JSX, garantindo uma interface dinâmica e responsiva.
- **Banco de Dados:** MySQL, utilizado para armazenamento eficiente de dados relacionais.
- **Containerização:** Docker e Docker Compose para padronização e isolamento do ambiente.
- **API:** Integração com Google Maps API para exibição de mapas e localização de ecopontos.

## Como Rodar o Projeto
Para executar o projeto, certifique-se de ter o Docker e o Docker Compose instalados. Em seguida, utilize o comando abaixo no terminal:

```bash
make docker-build
```
## Aplicando Migrações do Banco de Dados
Este passo traduz os Models Python (definidos em backend/src/apps/entities/models.py) para tabelas reais no banco de dados MySQL.

### Criando arquivos de migração
Gera os arquivos .py na pasta migrations/ do aplicativo entities.

```bash
docker-compose exec backend python manage.py makemigrations entities
```

### Aplicando as Migrações
Aplica as alterações ao banco de dados, criando todas as tabelas e relacionamentos definidos nos Models.

```bash
docker-compose exec backend python manage.py migrate
```

## População de Dados Iniciais
Este passo insere os registros iniciais no banco de dados

### Executar o comando de população
O comando populate_initial_data é definido no aplicativo entities e é executado diretamente:

```bash
docker-compose exec backend python manage.py populate_initial_data
```

Se o comando for bem-sucedido, você verá logs formatados no console, indicando a criação dos registros.