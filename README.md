# CRUD API

## Description

The task is to implement simple CRUD API using in-memory database underneath.

## Endpoints

GET       /api/users
POST      /api/users
GET       /api/users/:id
PUT       /api/users/:id
DELETE    /api/users/:id

## Installation

1. Clone the repository
2. Install dependencies: npm install

## Environment Variables

Make sure to set the following environment variables in a .env file

```bash
PORT=4000
```

## Run

Run `npm run start:prod` to build single bundle js file and run in the Production mode

Run `npm run start:dev` to run single thread in the Development mode

Run `npm run start:multi` to run load balancer in the Development mode

## Tests

Run `npm run test`


## Prettier & Eslint

Run `npm run lint` or `npm run format` to verify ESLint & Prettier work properly

Run `npm run lint:fix` or `npm run format:fix` to verify ESLint & Prettier work properly and fix exists problems
