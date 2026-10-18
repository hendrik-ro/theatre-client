[![CI](https://github.com/hendrik-ro/theatre-client/actions/workflows/ci.yml/badge.svg)](https://github.com/hendrik-ro/theatre-client/actions/workflows/ci.yml)
[![Release](https://github.com/hendrik-ro/theatre-client/actions/workflows/release.yml/badge.svg)](https://github.com/hendrik-ro/theatre-client/actions/workflows/release.yml)

theatre-client
==============

The browser client for Theatre — an app to track and rate movies with
others. This repository was split out of the original Theatre monorepo and
contains the client only; the Express/PostgreSQL API now lives in its own
repository ([theatre-server](https://github.com/hendrik-ro/theatre-server))
and must be running alongside this app.

## Features

- **Movie library** — add, edit, and view watched movies with name, year,
  runtime, IMDb rating (0–10), and genre
- **Sorting and filters** — library table with column sorting and
  URL-driven genre filters; landing page groups movies by genre
- **Accounts** — register, log in, and manage your profile; JWT auth keeps
  you signed in via a short-lived access token plus a rotating refresh
  token, both in HTTP-only cookies
- **Roles** — role-based authorization (`user` / `admin`); admins manage
  users through a dedicated admin module

## Project Structure

```
src/
├── api/        # typed API client modules (auth, movies)
├── app/        # app shell, routing, auth context
├── components/ # shared UI components
├── features/   # feature modules (auth, movies)
└── types/      # shared TypeScript types
```

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- Tooling: [oxlint](https://oxc.rs/docs/guide/usage/linter), [Prettier](https://prettier.io/)
- Automation: [husky](https://husky.com/) + [commitlint](https://commitlint.js.org/) enforce Conventional Commits, and [semantic-release](https://semantic-release.gitbook.io/) cuts versions, updates the changelog, and publishes GitHub releases from commit messages

## Getting Started

Prerequisites: Node.js and a running Theatre API server (the Vite dev
server proxies `/api` requests to it).

1. Install dependencies:

   ```sh
   npm install
   ```

2. Configure the environment:

   ```sh
   cp .env.example .env
   ```

   Then edit `.env` and set `CLIENT_PORT` (Vite dev server, default
   `5173`) and `SERVER_PORT` (the API server the dev proxy targets,
   default `3000`).

3. Start the dev server:

   ```sh
   npm run dev
   ```

## Scripts

| Command                | Description                               |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Start the Vite dev server                 |
| `npm run build`        | Type-check and build for production       |
| `npm run preview`      | Preview the production build              |
| `npm run typecheck`    | Type-check                                |
| `npm run lint`         | Lint with oxlint                          |
| `npm run format`       | Format with Prettier                      |
| `npm run format:check` | Check formatting without writing          |
| `npm run ci`           | Commitlint, format check, lint, typecheck |

## Docker

The client ships container definitions for both development and
production. Examples below use `docker`; the same commands work with
`podman`. Ports are hardcoded (client `5173`, API server `3000`) and no
environment variables or `.env` files are read at build or run time —
`.dockerignore` keeps `.env` out of the build context entirely.

| File                 | Purpose                                            |
| -------------------- | -------------------------------------------------- |
| `Dockerfile`         | Production: static build served by nginx on `5173` |
| `Dockerfile.dev`     | Development: Vite dev server on `5173`             |
| `nginx.conf`         | SPA fallback and `/api` proxy for the prod image   |
| `docker-compose.yml` | Both variants as compose services                  |

### Development

Requires the API server running on the host. Use host networking so the
Vite dev proxy (`/api` → `localhost:3000`) can reach it:

```sh
docker build -t theatre-client-dev -f Dockerfile.dev .
docker run --rm -it --network=host theatre-client-dev
# or: docker compose up --build client-dev
```

The dev image bakes the source in at build time, so rebuild after code
changes (no bind mounts, no `.env` involved).

### Production

The prod image serves the built SPA on port `5173` and proxies `/api` to
the API server on the host. The proxy target
(`host.containers.internal:3000`) resolves automatically under podman;
under docker it needs to be mapped to the host gateway explicitly:

```sh
docker build -t theatre-client .
docker run -d -p 5173:5173 --add-host host.containers.internal:host-gateway theatre-client
# or: docker compose up --build -d client
```

For a public deployment, publish both containers on loopback only
(`-p 127.0.0.1:3000:3000` for the server, `-p 127.0.0.1:5173:5173` for
this client) and put a TLS-terminating reverse proxy such as Caddy or
nginx in front on ports 80/443.

## Roadmap

- **User ratings** — rate movies yourself; every user's rating feeds a
  shared user average shown alongside the IMDb rating
- **Watchlist** — earmark movies you want to see and keep them in a
  separate list until you have watched them
- **Watched status** — mark movies as watched and track what is still
  pending

Longer term: one-command local Postgres via docker and deployment of app
plus database as containers on a single VPS.

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue or submit a pull request on the GitHub repository.

## License

AGPL-3.0 License - See [LICENSE.md](LICENSE.md) for details.
