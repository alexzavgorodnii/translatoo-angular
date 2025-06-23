# API Authentication Guide

This API provides JWT-based authentication with refresh token support. Here's how to use it:

## Authentication Endpoints

### 1. Register a new user

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**CURL Example:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword",
    "name": "John Doe"
  }'
```

### 2. Login with email/password

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**CURL Example:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword"
  }'
```

Response:

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "jwt-refresh-token"
}
```

### 3. Refresh access token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

**CURL Example:**
```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token"
  }'
```

### 4. Logout (revoke refresh token)

```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

**CURL Example:**
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "your-refresh-token"
  }'
```

### 5. OAuth Login

- Google: `GET /api/auth/google`
- GitHub: `GET /api/auth/github`

## Protected Routes

To access protected routes, include the access token in the Authorization header:

```http
GET /api/protected
Authorization: Bearer your-access-token
```

### Available Protected Routes

- `GET /api/user/profile` - Get user profile
- `GET /api/protected` - Example protected route

## Public Routes

- `GET /api` - Welcome message
- `GET /api/health` - Health check

## Environment Variables Required

Create a `.env` file in the `apps/api` directory with the following variables (see `.env.example`):

```env
JWT_SECRET=your-super-secret-jwt-key
REFRESH_SECRET=your-super-secret-refresh-key
DB_USER=your_db_user
DB_HOST=localhost
DB_NAME=your_db_name
DB_PASSWORD=your_db_password
DB_PORT=5432
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
PORT=3333
FRONTEND_URL=http://localhost:4200
```

## Database Schema

The API requires a `refresh_tokens` table with the following structure:

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,              -- store hashed token
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now()
);
```

## Security Features

1. **JWT Access Tokens**: Short-lived (2 hours) for API access
2. **Refresh Tokens**: Long-lived (30 days) stored in database
3. **Token Hashing**: Refresh tokens are hashed before database storage
4. **Token Revocation**: Tokens can be individually or collectively revoked
5. **CORS Protection**: Configurable origin restrictions
6. **Automatic Cleanup**: Expired tokens can be cleaned up

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- `400` - Bad Request (missing required fields)
- `401` - Unauthorized (invalid/expired tokens)
- `500` - Internal Server Error

Example error response:

```json
{
  "error": "Invalid or expired token"
}
```
