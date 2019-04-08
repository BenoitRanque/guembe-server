# server
Multi application server monorepo

Example `.env` file:

```
PG_DATABASE=postgres
PG_USERNAME=postgres
PG_PASSWORD=postgres
PGADMIN_DEFAULT_EMAIL=name@domain.com
PGADMIN_DEFAULT_PASSWORD=password
HASURA_GRAPHQL_ADMIN_SECRET=secret
# at least 32 characters
AUTH_JWT_SECRET=secret
```

## Building and transfering an image in production

### 1. Build & Save the production docker image

```sh
# build image for production
docker-compose -f docker-compose.yml build
# find image id
docker images
# save image
docker save <IMAGE_ID> --output dist/<image.tag>.tar
```

### 2. Load and tag Image in production environment

```sh
sudo docker load --input path/to/<image.tag>.tar
# find image id
sudo docker images
# tag image
sudo docker tag <IMAGE_ID> <image:tag>
```