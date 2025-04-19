help: # Display available commands and their descriptions
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*#' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*#"} {printf "  %-15s %s\n", $$1, $$2}'

run-dev: # Run the development server using docker-compose
	@echo "Starting the development server..."
	docker-compose up

stop: # Stop the running containers
	@echo "Stopping all running containers..."
	docker-compose down

build: # Build the Docker images
	@echo "Building the Docker images..."
	docker-compose build

run: # Run a one-off command in the web container
	@echo "Running a one-off command in the web container..."
	docker-compose run --service-ports web

test: # Run tests inside the container
	@echo "Running tests inside the container..."
	docker-compose run web npm test

lint: # Run linting inside the container
	@echo "Running linting inside the container..."
	docker-compose run web npm run lint

format: # Format code inside the container
	@echo "Formatting code inside the container..."
	docker-compose run web npm run format

shell: # Open a shell within the web container
	@echo "Opening a shell within the web container..."
	docker-compose exec web sh

logs: # View logs from the web container
	@echo "Viewing logs from the web container..."
	docker-compose logs -f web

ci: # Run CI tasks: tests, linting, and formatting checks
	@echo "Running CI tasks: tests, linting, and formatting checks..."
	$(MAKE) test
	$(MAKE) lint
	$(MAKE) format

clean: # Clean up project-specific Docker resources
	@echo "Stopping and removing containers, volumes, and orphaned containers..."
	docker-compose down --volumes --remove-orphans