# FocusFlow - Modern Task Management & Goal Tracking

A sophisticated task management and goal tracking application with glassmorphism design and advanced features including backburner functionality.

## Project Structure

```
focusflow/
├── backend/          # Node.js + Express + TypeScript API server
│   ├── src/
│   ├── prisma/       # Database schema and migrations
│   └── package.json
├── frontend/         # React + TypeScript + Vite client
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **ORM**: Prisma
- **Authentication**: JWT with refresh tokens

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)

## Key Features

- ✅ Advanced task management with backburner functionality
- 🎯 Comprehensive goal tracking and milestone system
- 🎨 Glassmorphism design with light/dark themes
- 📅 Calendar integration and smart scheduling
- 🔒 Secure authentication and authorization
- 📱 Responsive design for all devices

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure database connection in .env
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL="postgresql://username:password@localhost:5432/focusflow"
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"
CORS_ORIGIN="http://localhost:5173"
```

### Frontend (.env)
```
VITE_API_URL="http://localhost:3000/api/v1"
```

## API Documentation

The API follows RESTful conventions with the following base structure:
- **Base URL**: `/api/v1`
- **Authentication**: Bearer token in Authorization header
- **Content-Type**: `application/json`

### Core Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /tasks` - Get user tasks with filtering
- `POST /tasks` - Create new task
- `GET /goals` - Get user goals
- `POST /goals` - Create new goal

## License

MIT License - see LICENSE file for details.