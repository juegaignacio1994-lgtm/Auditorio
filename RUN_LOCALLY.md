# Running Flow Calendar Locally

This guide explains how to run the Flow Calendar application on your computer.

## System Requirements

- **Node.js**: v18 or higher (v20 LTS recommended)
- **npm** or **yarn** (included with Node.js)
- **PostgreSQL**: v12 or higher

## Database Setup

You have two options:

### Option 1: Local PostgreSQL (Recommended for development)
1. Install PostgreSQL locally
2. Create a new database:
   ```
   createdb calendar_db
   ```
3. Get your connection string: `postgresql://user:password@localhost:5432/calendar_db`

### Option 2: Neon (Serverless PostgreSQL)
1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project and copy your connection string

## Environment Configuration

1. Create a `.env` file in the root directory:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/calendar_db
   ```

   Replace with your actual database credentials if using Neon or a different host.

2. **Important**: The `DATABASE_URL` environment variable is required. The application will fail to start without it.

## Installation & Setup

1. **Install dependencies:**
   ```
   npm install
   ```

2. **Push database schema:**
   ```
   npm run db:push
   ```
   This creates the necessary tables in your PostgreSQL database.

3. **Start the development server:**
   ```
   npm run dev
   ```
   The application will be available at `http://localhost:5000`

## Available npm Scripts

```
npm run dev              # Full-stack development mode (recommended)
npm run dev:client      # Frontend only (Vite dev server)
npm run build           # Build for production
npm run start           # Run production build
npm run check           # TypeScript type checking
npm run db:push         # Sync database schema changes
```

## How It Works

- **Backend**: Express.js server running on port 5000
- **Frontend**: React application served via Vite
- **Database**: PostgreSQL with Drizzle ORM for schema management
- **API**: REST endpoints at `/api/events`

## API Endpoints

Once running, the following endpoints are available:

- `GET /api/events` — Retrieve all events
- `POST /api/events` — Create a new event
- `PATCH /api/events/:id` — Update an event
- `DELETE /api/events/:id` — Delete an event
- `GET /api/events/range?startDate=&endDate=` — Get events within a date range

## Troubleshooting

**"DATABASE_URL must be set" error**
- Ensure your `.env` file exists in the root directory with a valid `DATABASE_URL`

**"Connection refused" error**
- Verify PostgreSQL is running locally, or check that your Neon connection string is correct

**Database migration fails**
- Run `npm run db:push` to sync your schema with the database

**Port 5000 already in use**
- Set `PORT=3000` in your `.env` file (or another available port) before running `npm run dev`

## Project Structure

```
.
├── client/               # React frontend
│   └── src/
│       ├── pages/       # Page components
│       ├── components/  # UI components
│       └── lib/         # Utilities and API client
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   └── storage.ts       # Database operations
├── shared/              # Shared code
│   └── schema.ts        # Database schema & types
├── db/                  # Database setup
├── migrations/          # Auto-generated database migrations
└── package.json         # Dependencies
```

## Production Build

To build for production:

```
npm run build
npm start
```

The production build serves both the compiled frontend and backend from the same server on port 5000 (or your `PORT` environment variable).
