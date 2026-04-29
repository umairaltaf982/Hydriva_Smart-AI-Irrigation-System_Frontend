# Hydriva — Frontend

The Next.js 16 frontend for the Hydriva smart irrigation platform. Provides a responsive dashboard for plant management, real-time sensor monitoring, AI-powered plant analysis, alerts, reminders, and more.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Pages & Routes](#pages--routes)
- [Key Components](#key-components)
- [State & Auth](#state--auth)
- [API Layer](#api-layer)
- [Real-Time (WebSocket)](#real-time-websocket)
- [Styling](#styling)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)

---

## Tech Stack

| Package              | Version  | Purpose                                  |
|----------------------|----------|------------------------------------------|
| Next.js              | 16.2.4   | App Router, SSR, routing, middleware     |
| React                | 19.2.4   | UI rendering                             |
| TypeScript           | 5.x      | Type safety                              |
| Tailwind CSS         | 4.x      | Utility-first styling                    |
| Axios                | 1.15.x   | HTTP requests with interceptors          |
| Socket.io-client     | 4.8.x    | Real-time sensor & reminder events       |
| Recharts             | 3.8.x    | Sensor trend and water usage charts      |
| Lucide React         | 1.12.x   | Icon library                             |
| react-hot-toast      | 2.6.x    | Toast notifications                      |
| date-fns             | 4.1.x    | Date formatting                          |
| js-cookie            | 3.0.x    | JWT cookie for Next.js middleware        |
| framer-motion        | 12.x     | Animations                               |
| Radix UI             | —        | Accessible switch / slot primitives      |

---

## Project Structure

```
hydriva-frontend/
├── public/                    # Static assets
│   └── logo.png
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout — AuthProvider + Toaster
│   │   ├── page.tsx           # Landing / home page
│   │   ├── login/page.tsx     # Login (split-screen design)
│   │   ├── signup/page.tsx    # Sign up (2-step flow)
│   │   ├── dashboard/page.tsx # Main sensor dashboard
│   │   ├── plants/
│   │   │   ├── page.tsx       # Plant list grid
│   │   │   ├── new/page.tsx   # Add plant with AI auto-identify
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # Plant detail (Analyze / Chat / History / Reminders tabs)
│   │   │       └── edit/page.tsx
│   │   ├── alerts/page.tsx    # Live alerts dashboard
│   │   ├── history/page.tsx   # Irrigation log + analysis history
│   │   ├── irrigation/page.tsx
│   │   └── settings/page.tsx
│   ├── components/
│   │   └── layout/
│   │       ├── AppLayout.tsx  # Sidebar + main wrapper
│   │       ├── Sidebar.tsx    # Navigation, user info, sign out
│   │       └── Header.tsx     # Sticky page header
│   ├── context/
│   │   └── AuthContext.tsx    # JWT auth state, login/logout/register
│   ├── lib/
│   │   └── api.ts             # Axios instance + all API helpers
│   ├── middleware.ts           # Route protection (reads JWT cookie)
│   └── app/globals.css        # Custom Tailwind utilities
├── .env.local                 # Environment variables
├── .gitignore
├── next.config.ts
├── tailwind.config (via PostCSS)
├── tsconfig.json
└── package.json
```

---

## Pages & Routes

| Route              | Description                                                          |
|--------------------|----------------------------------------------------------------------|
| `/`                | Landing page                                                         |
| `/login`           | Split-screen login — left panel with features, right panel form     |
| `/signup`          | 2-step signup — Step 1: choose role, Step 2: fill account details   |
| `/dashboard`       | Live sensor cards + trend charts + weather widget                    |
| `/plants`          | Grid of all plants with health bars, actions                         |
| `/plants/new`      | Add plant form — photo upload triggers AI auto-identification        |
| `/plants/[id]`     | 4-tab detail: Analyze / AI Chat / History / Reminders               |
| `/plants/[id]/edit`| Edit plant form                                                      |
| `/alerts`          | Live alerts from sensors, plant health, and reminders               |
| `/history`         | Water usage charts, plant analysis log, plant health ranking         |
| `/irrigation`      | Irrigation schedule and controls                                     |
| `/settings`        | User profile settings                                                |

All routes except `/`, `/login`, and `/signup` are protected by `middleware.ts`.

---

## Key Components

### `AppLayout`
Wraps every authenticated page with the `Sidebar` on the left and a scrollable main area on the right.

### `Sidebar`
- Navigation links with active state
- User name, role badge, and avatar at the bottom
- Sign Out button that clears JWT from localStorage + cookie

### `Header`
- Sticky page title and subtitle
- Refresh button, city chip (weather location), notification bell

---

## State & Auth

Authentication is managed via `AuthContext` (`src/context/AuthContext.tsx`):

```
JWT stored in:
  1. localStorage     → read by Axios interceptor on every API request
  2. js-cookie        → read by Next.js middleware (edge runtime cannot access localStorage)
```

**Login flow:**
1. POST `/auth/login` → receive JWT
2. Store in `localStorage` + cookie (`hydriva_token`)
3. Redirect to `/dashboard`

**Session restore:**
On mount, `fetchMe()` calls `GET /auth/me` to re-hydrate user state from an existing token.

**Logout:**
Clears both `localStorage` and the cookie, then redirects to `/login`.

**Route protection (`middleware.ts`):**
Reads `hydriva_token` cookie. If missing on a protected route → redirect to `/login`. If present on `/login` or `/signup` → redirect to `/dashboard`.

---

## API Layer

All API calls live in `src/lib/api.ts`:

```ts
export const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });
```

**Request interceptor** — automatically attaches `Authorization: Bearer <token>` from localStorage.  
**Response interceptor** — on 401, clears token and redirects to `/login`.

### Available API helpers

| Export          | Methods                                                             |
|-----------------|---------------------------------------------------------------------|
| `weatherApi`    | `getCurrent(city)`                                                  |
| `sensorApi`     | `getCurrent()`                                                      |
| `irrigationApi` | `getSchedule()`, `getHistory()`                                     |
| `plantApi`      | `analyze(file)` — standalone AI identify (no plant ID needed)       |
| `plantsApi`     | `getAll()`, `getOne(id)`, `create(data)`, `update(id, data)`, `delete(id)`, `analyze(id, file)`, `getAnalyses(id)` |
| `chatApi`       | `getHistory(plantId)`, `sendMessage(plantId, message)`, `clearHistory(plantId)` |
| `remindersApi`  | `getAll()`, `getDue()`, `create(data)`, `complete(id)`, `update(id, data)`, `remove(id)` |

---

## Real-Time (WebSocket)

The dashboard connects to the NestJS WebSocket server via Socket.io:

```ts
const socket = io('http://localhost:4000');

socket.on('sensor-update', (data) => { /* update sensor state */ });
socket.on(`reminder-due-${userId}`, (reminder) => { /* show toast */ });
```

- **`sensor-update`** fires every 30 seconds with fresh readings
- **`reminder-due-{userId}`** fires when a reminder becomes overdue (checked server-side every 60 seconds)

---

## Styling

Tailwind CSS 4 with custom utilities defined in `src/app/globals.css`:

| Class                | Description                                    |
|----------------------|------------------------------------------------|
| `.hydriva-gradient`  | Brand green gradient (used on sidebar, buttons)|
| `.glass`             | Frosted glass effect for overlay cards         |
| `.glass-dark`        | Dark frosted glass                             |
| `.gradient-text`     | Green gradient text                            |
| `.card-hover`        | Subtle lift shadow on hover                    |
| `.animate-float`     | Gentle floating keyframe animation             |
| `.animate-pulse-slow`| Slower pulse for status indicators             |
| `.scrollbar-hide`    | Hides scrollbar cross-browser                  |

---

## Environment Variables

Create `hydriva-frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_APP_NAME=Hydriva
```

| Variable               | Description                                   |
|------------------------|-----------------------------------------------|
| `NEXT_PUBLIC_API_URL`  | Backend API base URL                          |
| `NEXT_PUBLIC_APP_NAME` | Displayed in the browser tab and UI           |

---

## Scripts

```bash
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Create optimised production build
npm run start      # Serve production build
npm run lint       # Run ESLint
```
# Hydriva_Smart-AI-Irrigation-System_Frontend
