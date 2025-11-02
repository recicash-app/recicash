include .env
export

.PHONY: docker-build
.SILENT:

docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

access-data-base:
	docker exec -it postgres_container psql -U ${DB_USER} -d ${DB_NAME}