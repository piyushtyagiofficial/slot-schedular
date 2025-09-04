# Slot Scheduler

A full-stack application for managing weekly time slots with support for recurring appointments, one-time bookings, and slot modifications. Built with React/TypeScript frontend and Node.js/TypeScript backend.

## Features

- **Slot Management**: Create, edit, and delete recurring and one-time slots
- **Exception Handling**: Modify individual instances of recurring slots
- **Responsive Design**: Works seamlessly across all device sizes
- **Real-time Updates**: Immediate UI feedback for all slot operations
- **Keyboard Navigation**: Efficient keyboard shortcuts for power users
- **Professional UI**: Clean, modern interface with hover effects and animations

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for responsive styling
- **Lucide React** for icons
- **date-fns** for date manipulation
- **ESLint** for code quality

### Backend
- **Node.js** with TypeScript
- **Express.js** for API framework
- **PostgreSQL** database
- **Knex.js** for database operations and migrations
- **CORS** for cross-origin requests
- **dotenv** for environment configuration

## Project Structure

```
slot-scheduler/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API communication
│   │   ├── types/          # TypeScript definitions
│   │   └── assets/         # Static assets
│   ├── public/             # Public assets
│   └── package.json        # Frontend dependencies
├── server/                 # Node.js backend API
│   ├── controllers/        # Request handlers
│   ├── database/           # Database connection
│   ├── migrations/         # Database schema
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── types/              # TypeScript definitions
│   └── package.json        # Backend dependencies
└── README.md              # This file
```

## Database Schema

### Tables

1. **slots** - Recurring weekly slots
   - id (UUID), day_of_week (0-6), start_time, end_time, timestamps

2. **one_time_slots** - Single-date appointments
   - id (UUID), slot_date, start_time, end_time, timestamps

3. **slot_exceptions** - Modifications to recurring slots
   - id (UUID), slot_id (FK), exception_date, new_start_time, new_end_time, timestamps

## Quick Start

### Prerequisites
- Node.js 18 or higher
- PostgreSQL database
- npm or yarn package manager

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/piyushtyagiofficial/slot-schedular.git
   cd slot-schedular
   ```

2. Set up the backend:
   ```bash
   cd server
   npm install
   ```

3. Configure server environment:
   Create `server/.env` file:
   ```
   DB_CLIENT=pg
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=slot_scheduler
   PORT=3001
   ```

4. Run database migrations:
   ```bash
   cd server
   npx knex migrate:latest
   ```

5. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

6. Set up the frontend:
   ```bash
   cd client
   npm install
   ```

7. Configure client environment:
   Create `client/.env` file:
   ```
   VITE_API_URL=http://localhost:3001
   ```

8. Start the frontend:
   ```bash
   cd client
   npm run dev
   ```

9. Open your browser to `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/slots/week?weekStart=YYYY-MM-DD` | Get all slots for a week |
| POST | `/api/slots` | Create new slot |
| PUT | `/api/slots/:id?date=YYYY-MM-DD` | Update slot (creates exception for recurring) |
| DELETE | `/api/slots/:id?date=YYYY-MM-DD` | Delete slot instance |
| DELETE | `/api/slots/:id/recurring` | Delete all recurring slot instances |
| GET | `/health` | Health check |

## Key Features

### Calendar Navigation
- Navigate weeks with arrow buttons or `Ctrl + ←/→`
- Jump to current week with "Today" button or `Ctrl + Home`
- Visual indicators for current week and slot counts
- Responsive grid layout (1-7 columns based on screen size)

### Slot Types
- **Recurring Slots**: Weekly repeating appointments (green badge)
- **One-time Slots**: Single-date appointments (orange badge)
- **Modified Slots**: Exception instances of recurring slots (blue badge)

### Slot Operations
- **Create**: Choose between recurring or one-time slots
- **Edit**: Modify times (creates exceptions for recurring slots)
- **Delete**: Remove single instance or entire recurring series
- **Validation**: Maximum 2 slots per day, time conflict prevention

### User Interface
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Hover Effects**: Action buttons appear on card hover
- **Loading States**: Smooth loading indicators during API calls
- **Error Handling**: User-friendly error messages and validation
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Development

### Backend Development
```bash
cd server
npm run dev          # Start with hot reloading
npx knex migrate:make <name>    # Create new migration
npx knex migrate:latest         # Run pending migrations
npx knex migrate:rollback       # Rollback last migration
```

### Frontend Development
```bash
cd client
npm run dev          # Start development server
npm run build        # Create production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Database Operations
```bash
# Create new migration
npx knex migrate:make create_new_table

# Run migrations
npx knex migrate:latest

# Rollback migration
npx knex migrate:rollback
```

## Environment Variables

### Server
| Variable | Description | Required |
|----------|-------------|----------|
| DB_CLIENT | Database client (pg) | Yes |
| DB_HOST | Database host | Yes |
| DB_PORT | Database port | Yes |
| DB_USER | Database username | Yes |
| DB_PASSWORD | Database password | Yes |
| DB_NAME | Database name | Yes |
| PORT | Server port | No (3001) |

### Client
| Variable | Description | Required |
|----------|-------------|----------|
| VITE_API_URL | Backend API URL | No (http://localhost:3001) |

## Production Deployment

### Backend
1. Set production environment variables
2. Run database migrations
3. Build and start the server
4. Configure reverse proxy (nginx/Apache)

### Frontend
1. Update `VITE_API_URL` to production API URL
2. Run `npm run build`
3. Serve the `dist` folder with a web server
4. Configure routing for SPA (Single Page Application)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Performance Features

- **Frontend**: Component memoization, efficient re-renders, tree shaking
- **Backend**: Connection pooling, optimized queries, proper indexing
- **Database**: Indexed columns for fast lookups, normalized schema
- **Caching**: Smart cache invalidation strategies
