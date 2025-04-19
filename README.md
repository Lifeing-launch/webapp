# Lifeing

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started (Docker)

For ease of development, this project has been setup to use Docker. Commonly used commands have been wrapped in the [Makefile](./Makefile).

1. Run `make build` to build the docker image. Jump to step 2 if you already have a built (and up-to-date) docker image.
2. Run `make run-dev` to start the application locally.
3. Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

See all other available commands to run on this project by running `make help`

```
$ make help
Available commands:
  help             Display available commands and their descriptions
  run-dev          Run the development server using docker compose
  stop             Stop the running containers
  build            Build the Docker images
  run              Run a one-off command in the web container
  test             Run tests inside the container
  lint             Run linting inside the container
  format           Format code inside the container
  shell            Open a shell within the web container
  logs             View logs from the web container
  ci               Run CI tasks: tests, linting, and formatting checks
  clean            Clean up project-specific Docker resources
```

## Getting Started (Local)

Alternatively, you can start the application on your local machine without the use of docker. Ensure you have a recent version of [Node](https://nodejs.org/en) installed.

1. Run `npm install` to install dependencies.
2. Run `npm run dev` to start the application locally.
3. Open [http://localhost:3000](http://localhost:3000) with your browser to view the application.

Other alternatives to using npm are yarn, pnpm or bun. For example, for the `run dev` command we could have

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Deployment/Releases

This application is deployed using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

All changes merged into the main branch are automatically deployed. To contribute, create a pull request targeting the main branch. Each pull request undergoes CI checks to validate compliance with project standards.

View the [deployed application here](https://webapp-lifeing.vercel.app).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) - on deployment.
