# Dokploy Deployment Guide

This repo is meant to run as two Dockerized apps with Neon as the database.

Recommended live layout:

- `https://unievent.in` and `https://www.unievent.in` -> web app
- `https://api.unievent.in` -> server app
- Neon -> database

## 1. What runs where

- Web app: `apps/web`
- API/auth app: `apps/server`
- Database: Neon (external)

## 2. Files used for deploy

- [apps/web/Dockerfile](../apps/web/Dockerfile)
- [apps/server/Dockerfile](../apps/server/Dockerfile)
- [.env.example](../.env.example)

## 3. VPS prerequisites

- Fresh Ubuntu VPS
- Public IPv4
- SSH username and private key
- Ports `80` and `443` open

## 4. Dokploy setup

Create two apps in Dokploy from the same Git repo.

### Web app

- Repo: this repository
- Root path: `apps/web`
- Dockerfile: `apps/web/Dockerfile`
- Port: `3001`
- Domain: `unievent.in`
- Add alias: `www.unievent.in`
- Build args:
  - `NEXT_PUBLIC_API_URL=https://api.unievent.in`
  - `NEXT_PUBLIC_API_URLS=https://api.unievent.in`
  - `NEXT_PUBLIC_SERVER_URL=https://api.unievent.in`
  - `NEXT_PUBLIC_SERVER_URLS=https://api.unievent.in`
  - `NEXT_PUBLIC_RAZORPAY_KEY_ID=<your-public-razorpay-key>`

### Server app

- Repo: this repository
- Root path: `apps/server`
- Dockerfile: `apps/server/Dockerfile`
- Port: `3000`
- Domain: `api.unievent.in`

## 5. Production env values

Use [.env.example](../.env.example) as the template and set these in Dokploy.

- `DATABASE_URL` -> Neon connection string
- `BETTER_AUTH_URL` -> `https://api.unievent.in`
- `AUTH_COOKIE_DOMAIN` -> `.unievent.in`
- `CORS_ORIGIN` -> `https://unievent.in,https://www.unievent.in`
- `GOOGLE_CLIENT_ID` -> Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` -> Google OAuth client secret
- `JWT_ACCESS_SECRET` -> long random secret
- `JWT_REFRESH_SECRET` -> long random secret
- `RAZORPAY_KEY_ID` -> Razorpay key ID
- `RAZORPAY_KEY_SECRET` -> Razorpay secret
- `RAZORPAY_WEBHOOK_SECRET` -> Razorpay webhook secret
- `BREVO_API_KEY` -> Brevo API key
- `BREVO_MAIL_FROM` -> verified sender email
- `NEXT_PUBLIC_APP_URL` -> `https://unievent.in` (frontend origin, optional)
- `NEXT_PUBLIC_API_URL` -> `https://api.unievent.in` (preferred browser API
  base)
- `NEXT_PUBLIC_API_URLS` -> `https://api.unievent.in` (preferred list form)
- `NEXT_PUBLIC_SERVER_URL` -> `https://api.unievent.in`
- `NEXT_PUBLIC_SERVER_URLS` -> `https://api.unievent.in`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` -> Razorpay public key

## 6. Google OAuth callback

Add this redirect URI in Google Cloud Console:

- `https://api.unievent.in/api/auth/callback/google`

Keep local dev callback too:

- `http://localhost:3000/api/auth/callback/google`

## 7. DNS

Point these records to the VPS public IPv4:

- `unievent.in`
- `www.unievent.in`
- `api.unievent.in`

## 8. First deploy order

1. Deploy the server app first.
2. Verify `https://api.unievent.in` is reachable.
3. Deploy the web app.
4. Verify `https://unievent.in` loads and can call the API.

## 9. Migration rule

To move to another VPS later:

1. Clone the same repo on the new server.
2. Copy the same `.env` values.
3. Repoint DNS to the new IP.
4. Redeploy the same two Dokploy apps.

The database stays on Neon, so the move is mostly DNS + env + redeploy.
