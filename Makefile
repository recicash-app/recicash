include .env
export

.PHONY: docker-build
.SILENT:

up:
	docker-compose up -d --build

down:
	docker-compose down

access-data-base:
	docker exec -it postgres_container psql -U ${DB_USER} -d ${DB_NAME}