# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SchoolBus Connect is a school bus tracking application. Students log in to track their bus and view ETA to their stop. Drivers log in/out to manage their session. Bus progress is tracked through stops with pre-calculated travel times stored in SQLite.

## Commands

```bash
npm start        # Start production server (node ./bin/www)
npm run dev      # Start with auto-reload (nodemon ./bin/www)
npm run setup    # Run bus service setup (calculates routes and travel times)
npm test         # Run manual test script (node test.js)
```

## Architecture

**MVC-like structure**: Routes → Controllers → Services → Database

- `bin/www` - HTTP server entry point
- `app.js` - Express app setup (middleware, session config)
- `routes/` - API endpoint definitions (`/api/student`, `/api/driver`)
- `controllers/` - Request/response handling
- `services/` - Business logic (busService.js, studentServices.js, driverServices.js)
- `data/` - SQLite connection and schema (better-sqlite3)

**Authentication**: Session-based with express-session. Sessions store `userId`, `username`, `role` (`student` or `driver`).

## Database Schema

- `drivers` - Driver accounts
- `buses` - Buses with driver assignments
- `stops` - Stop locations with geocoded coordinates
- `bus_stops` - Stop order for each bus route (junction table)
- `students` - Students linked to bus and stop
- `bus_progress` - Current stop index per active bus
- `times` - Pre-calculated travel durations between consecutive stops

## Key Services

- `busService.js` - Calculates bus progress and ETA using OpenRouteService API
- `studentServices.js` - Student data access, password verification
- `driverServices.js` - Driver data access, password verification

## Environment Variables

Required in `.env`:
- `API_KEY` - OpenRouteService API key
- `COOKIE_SECRET` - Session cookie secret

## Tech Stack

Node.js, Express.js, SQLite (better-sqlite3), express-session, bcrypt, morgan, dotenv