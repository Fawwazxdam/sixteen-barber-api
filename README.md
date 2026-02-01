# Sixteen Barber API Documentation

This API provides backend services for the Sixteen Barber application, a barber shop booking system built with NestJS and PostgreSQL.

## Base URL
```
http://localhost:3000
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header for protected endpoints:

```
Authorization: Bearer <your_jwt_token>
```

### Login
To obtain a JWT token, use the login endpoint.

## Data Models

### User
```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "role": "ADMIN" | "BARBER",
  "createdAt": "timestamp"
}
```

### Service
```json
{
  "id": "uuid",
  "name": "string",
  "price": "number",
  "duration": "number", // in minutes
  "isActive": "boolean"
}
```

### Booking
```json
{
  "id": "uuid",
  "barberId": "uuid",
  "serviceId": "uuid",
  "customerUserId": "uuid?", // optional
  "customerName": "string",
  "customerPhone": "string",
  "customerNote": "string?", // optional
  "bookingDate": "timestamp",
  "status": "pending" | "confirmed" | "cancelled" | "completed",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

## Endpoints

### Authentication

#### POST /auth/login
Login to get JWT token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "accessToken": "string"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password"}'
```

### Bookings

#### POST /bookings
Create a new booking.

**Request Body:**
```json
{
  "barberId": "string",
  "serviceId": "string",
  "customerUserId": "string?", // optional
  "customerName": "string",
  "customerPhone": "string",
  "customerNote": "string?", // optional
  "bookingTime": "string", // ISO date string
  "duration": "number" // min 30
}
```

**Response:** Booking object

#### GET /bookings
Get all bookings.

**Response:** Array of Booking objects

#### GET /bookings/available-slots
Get available time slots for a barber on a specific date.

**Query Parameters:**
- `date`: string (YYYY-MM-DD)
- `barberId`: string

**Response:** Array of available time slots (strings in HH:mm format)

**Example:**
```bash
curl "http://localhost:3000/bookings/available-slots?date=2023-12-01&barberId=uuid"
```

### Services

#### POST /services
Create a new service. (Requires ADMIN role)

**Request Body:**
```json
{
  "name": "string",
  "price": "number", // min 0
  "duration": "number", // min 1, in minutes
  "isActive": "boolean?" // optional, default true
}
```

**Response:** Service object

#### GET /services
Get all services.

**Response:** Array of Service objects

#### PATCH /services/:id
Update a service. (Requires ADMIN role)

**Request Body:** (all fields optional)
```json
{
  "name": "string?",
  "price": "number?",
  "duration": "number?",
  "isActive": "boolean?"
}
```

**Response:** Updated Service object

#### PATCH /services/:id/toggle-active
Toggle the active status of a service. (Requires ADMIN role)

**Response:** Updated Service object

### Users (Barbers)

#### POST /users/barbers
Create a new barber. (Requires ADMIN role)

**Request Body:**
```json
{
  "email": "string",
  "name": "string",
  "password": "string" // min 6 characters
}
```

**Response:** User object (barber)

#### GET /users/barbers
Get all barbers. (Requires ADMIN role)

**Response:** Array of User objects (barbers only)

#### PATCH /users/barbers/:id
Update a barber. (Requires ADMIN role)

**Request Body:** (all fields optional)
```json
{
  "name": "string?",
  "password": "string?" // min 6 characters
}
```

**Response:** Updated User object

## Error Responses
All endpoints may return error responses in the following format:

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

Common status codes:
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid or missing JWT)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Setup and Running

### Prerequisites
- Node.js
- PostgreSQL
- npm

### Installation
```bash
npm install
```

### Environment Variables
Create a `.env` file with:
```
DATABASE_URL=postgresql://user:password@localhost:5432/sixteen_barber
JWT_SECRET=your_jwt_secret
NODE_ENV=development
APP_PORT=4001
FRONTEND_URL=http://localhost:3000,https://next-barber-phi.vercel.app
```

### Cookie Configuration
The API uses HTTP-only cookies for JWT token storage. Cookie settings are automatically configured based on `NODE_ENV`:

**Development (NODE_ENV=development):**
- `sameSite: "lax"` - Allows same-site requests
- `secure: false` - Works with HTTP
- `partitioned: false` - No partitioning needed

**Production (NODE_ENV=production):**
- `sameSite: "none"` - Allows cross-site requests
- `secure: true` - Requires HTTPS
- `partitioned: true` - CHIPS compliance for modern browsers

### CORS Configuration
The API is configured to accept requests from specific origins defined in `FRONTEND_URL` environment variable. Multiple origins can be separated by commas.

**Important:** When deploying with HTTPS, ensure:
1. Frontend is also using HTTPS
2. `NODE_ENV=production` is set
3. `FRONTEND_URL` includes the production frontend domain
4. Database connection uses SSL (`sslmode=require`)

### Database Setup
```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

### Running the Application
```bash
# Development
npm run start:dev

# Production
npm run start:prod
```

## Testing
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## License
MIT
