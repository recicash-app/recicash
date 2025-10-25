# Backend do Recicash

## Sobre o Projeto
O backend do Recicash foi desenvolvido utilizando o framework [**Django**](https://docs.djangoproject.com/en/5.2/).

## Arquitetura

O backend é baseado em Django, estruturado em camadas conforme o padrão arquitetura em camadas (layered architecture) definido na ADR 002:

Cada camada tem uma responsabilidade clara:
- **Presentation Layer:** expõe endpoints REST para consumo do frontend (Views / Controllers).
- **Application Layer:** orquestra casos de uso, valida regras e coordena entidades (Services / Use Cases).
- **Domain Layer:** contém as entidades e regras de negócio centrais do domínio (Entities / Business Rules).
- **Infrastructure Layer:** integra com recursos externos, como ORM, APIs externas e PostGIS.

## Dependências
As dependências do projeto estão listadas no arquivo `requirements.txt`. Para instalar as dependências, utilize o comando:

```bash
pip install -r requirements.txt
```

## Executando o Projeto
Para rodar o servidor local, utilize o comando:

```bash
python manage.py runserver
```

O servidor estará disponível no endereço:

```
http://127.0.0.1:8000/
```
## Acesso via Docker e Traefik

Quando executado via Docker, o acesso ao backend é feito pelo endereço:

```
http://api.docker.localhost
```

Esse roteamento é controlado pelo Traefik, que atua como proxy reverso e direciona as requisições para o serviço correto com base no subdomínio utilizado. Portanto, não utilize mais `localhost:8000` para acessar a API quando estiver rodando via Docker; utilize sempre o subdomínio `api.docker.localhost`.