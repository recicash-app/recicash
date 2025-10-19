# Backend do Recicash

## Sobre o Projeto
O backend do Recicash foi desenvolvido utilizando o framework [**Django**](https://docs.djangoproject.com/en/5.2/).

## Arquitetura


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

> **Nota:** O backend pode ser executado de forma isolada dentro de um container Docker, juntamente com o frontend e o banco de dados. Para isso, utilize os comandos definidos no `docker-compose.yml`. Os comandos acima são recomendados apenas se você deseja rodar o backend diretamente na sua máquina, fora do ambiente de containers.