# voltaze

This project was created with
[Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a
modern TypeScript stack that combines Next.js, Express, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **Shared UI package** - shadcn/ui primitives live in `packages/ui`
- **Express** - Fast, unopinionated web framework
- **Bun** - Runtime environment
- **Prisma** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Biome** - Linting and formatting
- **Husky** - Git hooks for code quality
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```

Create environment variables for web and server/database before running the app:

```bash
# apps/web/.env
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# apps/server/.env
DATABASE_URL=postgresql://...
CORS_ORIGIN=http://localhost:3001,https://unieventsss.vercel.app,https://unievent.in,https://www.unievent.in
BETTER_AUTH_API_KEY=your_better_auth_dashboard_api_key_if_you_use_the_hosted_dashboard
```

## Database Setup

This project uses PostgreSQL with Prisma.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/server/.env` file with your PostgreSQL connection details.

3. Apply the schema to your database:

```bash
bun run db:push
```

4. Seed the database with starter records:

```bash
bun run db:seed
```

Then, run the development server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the
web application. The API is running at
[http://localhost:3000](http://localhost:3000).

## UI Customization

React web apps in this stack share shadcn/ui primitives through `packages/ui`.

- Change design tokens and global styles in `packages/ui/src/styles/globals.css`
- Update shared primitives in `packages/ui/src/components/*`
- Adjust shadcn aliases or style config in `packages/ui/components.json` and
  `apps/web/components.json`

### Add more shared components

Run this from the project root to add more primitives to the shared UI package:

```bash
npx shadcn@latest add accordion dialog popover sheet table -c packages/ui
```

Import shared components like this:

```tsx
import { Button } from "@voltaze/ui/components/button";
```

### Add app-specific blocks

If you want to add app-specific blocks instead of shared primitives, run the
shadcn CLI from `apps/web`.

## Git Hooks and Formatting

- Initialize hooks: `bun run prepare`
- Format and lint fix: `bun run check`

## Project Structure

```
voltaze/
├── apps/
│   ├── web/         # Frontend application (Next.js)
│   └── server/      # Backend API (Express)
├── packages/
│   ├── ui/          # Shared shadcn/ui components and styles
│   └── db/          # Database schema & queries
```

## API Endpoints

### Auth (`/auth`)

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout (single session)
- `POST /auth/logout-all` - Logout all sessions
- `GET /auth/me` - Get current user
- `GET /auth/sessions` - List active sessions
- `DELETE /auth/sessions/:sessionId` - Revoke specific session
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/change-password` - Change password (authenticated)
- `POST /auth/request-email-verification` - Request email verification
- `POST /auth/verify-email` - Verify email with token

### Events (`/events`)

- `GET /events` - List events (with pagination)
- `GET /events/:eventId` - Get event by ID
- `POST /events` - Create event (HOST/ADMIN)
- `PATCH /events/:eventId` - Update event (HOST/ADMIN)
- `DELETE /events/:eventId` - Delete event (HOST/ADMIN)
- `GET /events/:eventId/ticket-tiers` - List ticket tiers
- `POST /events/:eventId/ticket-tiers` - Create ticket tier
- `PATCH /events/:eventId/ticket-tiers/:tierId` - Update ticket tier
- `DELETE /events/:eventId/ticket-tiers/:tierId` - Delete ticket tier

### Payments (`/payments`)

- `GET /payments` - List payments (with pagination)
- `GET /payments/:id` - Get payment by ID
- `POST /payments/initiate` - Initiate payment (creates Razorpay order)
- `POST /payments/verify` - Verify payment after Razorpay checkout
- `POST /payments/:id/refund` - Refund payment (HOST/ADMIN)
- `PATCH /payments/:id` - Update payment (HOST/ADMIN)
- `DELETE /payments/:id` - Delete payment (HOST/ADMIN)
- `POST /payments/webhook/razorpay` - Razorpay webhook handler

### Other Endpoints

- Attendees, Orders, Tickets, Passes, Check-ins follow similar CRUD patterns

## Environment Variables

### Server (`apps/server/.env`)

```bash
DATABASE_URL=postgresql://...
CORS_ORIGIN=http://localhost:3001,https://unieventsss.vercel.app,https://unievent.in,https://www.unievent.in
BETTER_AUTH_API_KEY=your_better_auth_dashboard_api_key_if_you_use_the_hosted_dashboard
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
JWT_ACCESS_SECRET=...  # min 32 chars
JWT_REFRESH_SECRET=... # min 32 chars
```

## Available Scripts

- `bun run dev`: Start all applications in development mode
- `bun run build`: Build all applications
- `bun run dev:web`: Start only the web application
- `bun run dev:server`: Start only the server
- `bun run check-types`: Check TypeScript types across all apps
- `bun run db:push`: Push schema changes to database
- `bun run db:generate`: Generate database client/types
- `bun run db:migrate`: Run database migrations
- `bun run db:seed`: Seed database with starter data
- `bun run db:studio`: Open database studio UI
- `bun run check`: Run Biome formatting and linting
