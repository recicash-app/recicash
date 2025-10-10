.PHONY: docker-build
.SILENT:

docker-build:
	docker-compose up --build
