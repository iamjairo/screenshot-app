IMAGE_NAME ?= screenshot-app
IMAGE_TAG  ?= latest
REGISTRY   ?= docker.io/iamjairo

.PHONY: build up down dev push logs

## Build the Docker image
build:
	docker compose build

## Start the service in production mode (restart: unless-stopped)
up:
	docker compose up -d

## Stop and remove the service containers
down:
	docker compose down

## Run a one-off dev container (no auto-restart, foreground)
dev:
	docker compose --profile dev run --rm screenshot-app-dev

## Push the image to the registry
push: build
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)
	docker push $(REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)

## Tail service logs
logs:
	docker compose logs -f
