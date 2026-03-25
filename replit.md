# Workspace

## Overview

VisageTrack AI Biometrics Attendance System — a full-stack facial recognition attendance platform rebuilt in JavaScript/TypeScript from a crashed Python/Vercel deployment.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: JWT (jsonwebtoken + bcryptjs)
- **Face Recognition**: face-api.js (browser-side, @vladmandic/face-api)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (auth, users, attendance, face-match)
│   └── visagetrack/        # React + Vite frontend
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
│   └── src/seed.ts         # DB seed script (default users)
└── ...
```

## Default Users

- **Victor** (admin): email `victor`, password `victor@2026`
- **Mark** (student): email `mark`, password `mark@2026`

Seed with: `pnpm --filter @workspace/scripts run seed`

## Features

- **Login page**: JWT auth, role-based redirect
- **Admin Dashboard**: stats cards, all attendance records, mark attendance
- **Student Dashboard**: personal attendance stats and history
- **User Management** (admin): list/delete enrolled users, enroll new users
- **Enrollment** (admin): multi-step form (personal info + face capture via webcam + face-api.js)
- **Face Recognition / Attendance**: webcam stream, real-time face detection, POST descriptor to `/api/users/face-match`, then mark attendance
- **Sidebar navigation**: role-aware (students see subset of pages)

## Face Recognition Architecture

Face recognition is entirely **browser-side** using face-api.js (@vladmandic/face-api). Models loaded from CDN. The server only stores and compares 128-d descriptors (euclidean distance, threshold 0.5). No heavy Python CV libraries needed — this is why it works on Replit/Vercel where Python face_recognition/dlib would exceed size limits.

## API Routes

All routes under `/api`:

- `POST /auth/login` — JWT login
- `POST /auth/logout`
- `GET /users/profile` — current user
- `GET /users/stats` — attendance stats
- `GET /users` — all users (admin)
- `POST /users/enroll` — enroll new user with face descriptor
- `POST /users/face-match` — match face descriptor against DB
- `GET /users/:id`
- `DELETE /users/:id` (admin)
- `GET /attendance` — records (filtered by role)
- `POST /attendance/mark` — mark attendance

## Database Schema

- `users`: id, name, email, password, role, firstName, lastName, department, jobDesignation, homeAddress, dob, imagePath, faceDescriptor (JSON array), hasEmbedding, createdAt
- `attendance`: id, userId, timestamp, status, date

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` with `composite: true`. Run `pnpm run typecheck` from root.

## Root Scripts

- `pnpm run build` — typecheck + build all packages
- `pnpm run typecheck` — full typecheck

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server with JWT auth, bcryptjs password hashing, and Drizzle ORM for DB access.

### `artifacts/visagetrack` (`@workspace/visagetrack`)

React + Vite frontend. Uses face-api.js for client-side face recognition, zustand for auth state, react-webcam for camera access.

### `lib/db` (`@workspace/db`)

PostgreSQL via Drizzle ORM. Schema: users, attendance tables.

### `scripts` (`@workspace/scripts`)

Utility scripts. `src/seed.ts` seeds default admin (Victor) and student (Mark).
