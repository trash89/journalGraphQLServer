# JournalGraphSQL Server for Journal Application

The Journal Application is an utility allowing to keep an online journal of activity. It allows to enter a description of daily activities, things already done and things to do.

The application is built with three components:

- the database server, with a relational database schema deployed on Heroku PostgreSQL service
- the GraphQL server, built with the latest Express, Apollo and Prisma ORM packages
- the frontend application, built with ReactJS, Redux and Material-UI, relaying on the graphql server to communicate with the database

This repository contains the GraphQL server for the Journal application and the database schema definition.

This GraphQL server implements queries, mutations and subscriptions using Express, Apollo and Prisma ORM. These operations can be lauched from the GraphQL Playground.

## Important !!!

The passwords are stored encrypted with the bcryptjs package, and cannot be 'guessed' or retrieved :

```
const hashedPassword = await bcrypt.hash(args.profile.Password, 10);
```

Don't use email addresses as usernames ! Use simple usernames, like user1, user2, etc.

In order to keep the database small and avoid extra cost, in the production, on the Heroku postgreSQL database, a cleanup procedure is running once a day, cleaning up all database entries that don't belong to the profiles 1 and 2 (admin profile and demo profile).

The execution of the cleanupDatabase() function in src/index.js depends of the variable NODE_ENV.\
Define the variable NODE_ENV="development" in your .profile and the cleanup function will not run.

## GraphQL Server Frontend on Heroku

The application is live on Heroku :

https://journalgraphqlserver.herokuapp.com/

Bellow is the relational database schema exposed to the GraphQL server:

![Database Schema ](./ERDiagramJournal.png)

## Quickstart for local deployment/testing

### `clone the repository and npm install`

```bash
git clone https://github.com/trash89/journalGraphQLServer
cd journalGraphQLServer
npm install
```

### `configure .env`

On a local MySQL database, create an empty schema and configure the connection string in the .env file:

```bash .env
# Environment variables declared in this file are automatically made available to Prisma.
# See the documentation for more detail: https://pris.ly/d/prisma-schema#accessing-environment-variables-from-the-schema

# Prisma supports the native connection string format for PostgreSQL, MySQL, SQLite, SQL Server, MongoDB and CockroachDB (Preview).
# See the documentation for all the connection string options: https://pris.ly/d/connection-strings

DATABASE_URL="mysql://user:password@host:3306/journal"
CHECKPOINT_DISABLE=1
JWT_LIFETIME=1d
PORT=4000
```

### `npx prisma db push`

Create the database tables if they do not exist.\
Here is the documention relative to the Prisma CLI command db-push: https://www.prisma.io/docs/reference/api-reference/command-reference#db-push

```bash
npx prisma db push
```

### `npx prisma generate`

Generate the Prisma client to be used in the application:

```bash
npx prisma generate
```

### `Start the GraphQL Server`

```
node src/index.js
```

If nodemon utility is installed globally (`npm -g install nodemon`), then launch :

```
nodemon src/index.js
```

Run the application in the development mode.\
A GraphQL Playground is allowing to launch queries, mutations and subscriptions against the database.\
Open [http://localhost:4000](http://localhost:4000) to view it in your browser.

### `register a profile`

In GraphQL Playground, launch the following mutation to register a profile:

```
mutation{
  register(profile:{Username:"test@test.com",Password:"testpwd",Is_Admin:"N"}){
    token
    profile{
      idProfile
      Username
      Password
      Is_Admin
    }
  }
}
```

The server responds with a token and the profile it had been created.

### `Authenticate`

Open a new tab in GraphQL Playground and add the token you obtained with the register mutation, in the HTTP HEADERS.\
This authenticates the subsequent sessions you may open on different tabs:

```
{
  "Authorization":"Bearer token"
}
```

Then you can further explore the GraphQL schema and launch queries, mutations and subscriptions.

![Query](./QueryWithAuthorization.png)

### `Enjoy! :)`
