include .env
export

.PHONY: docker-build
.SILENT:

docker-up:
	docker-compose up -d --build

docker-down:
	docker-compose down

access-data-base:
	docker exec -it postgres_container psql -U ${DB_USER} -d ${DB_NAME}

tests:
	docker exec -it django_backend sh -c "python manage.py test"

coverage:
	docker exec -it django_backend sh -c "coverage run manage.py test && coverage report"

coverage-html:  
	docker exec -it django_backend sh -c "coverage run manage.py test && coverage html && coverage report"

coverage-clean:
	docker exec -it django_backend sh -c "coverage erase"
	docker exec -it django_backend sh -c "rm -rf htmlcov"
