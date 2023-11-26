# Teemio API

## Start Dev Database

This requires a `.env.database` file in the root directory!

```
MONGO_INITDB_ROOT_USERNAME=dbUser
MONGO_INITDB_ROOT_PASSWORD=xxx
MONGO_INITDB_DATABASE=maindb
```

```
docker compose -f docker-database.yml up
```

## Connect to Dev Database

Requires a `.env` file in the root directory!

```
DB_CONNECTION_STRING=mongodb://user:pass@localhost:27017/db?authSource=admin
JWT_SECRET=xxxx
```
