# Concert Reservation System

A NestJS-based REST API for managing concert reservations.

## Quick Start

### Step 1: Start MySQL with Docker

```bash
docker run -d \
  --name mysql-server \
  -e MYSQL_ROOT_PASSWORD=StrongPass123! \
  -p 3306:3306 \
  mysql:8.0
```

### Step 2: Create Database

Connect to MySQL and create database:

```bash
docker exec -it mysql-server mysql -uroot -pStrongPass123!
```

```sql
CREATE DATABASE test;
EXIT;
```

### Step 3: Setup Environment Variables

Create `.env` file in root directory:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=StrongPass123!
DB_NAME=test
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Run Application

```bash
npm run start:dev
```

The application will:

- Start on `http://localhost:4000`
- Auto-sync database and create tables
- API base path: `http://localhost:4000/api`

## Architecture

### Project Structure

```
src/
├── admin/                      # Admin module
│   ├── admin.controller.ts     # Admin endpoints
│   ├── admin.service.ts        # Admin business logic
│   ├── admin.module.ts         # Admin module definition
│   └── dto/                    # Data Transfer Objects
│       ├── request.dto.ts      # Request DTOs
│       └── response.dto.ts     # Response DTOs
├── user/                       # User module
│   ├── user.controller.ts      # User endpoints
│   ├── user.service.ts         # User business logic
│   ├── user.module.ts          # User module definition
│   └── dto/                    # Data Transfer Objects
│       ├── request.dto.ts      # Request DTOs
│       └── response.dto.ts     # Response DTOs
├── entities/                   # TypeORM entities
│   ├── concert.entity.ts       # Concert entity
│   └── transaction.entity.ts   # Transaction entity
├── interceptor/                # Global interceptors
│   ├── logging.interceptor.ts  # Request/response logging
│   ├── transform.interceptor.ts # Response transformation
│   └── serialize.interceptor.ts # Data serialization
├── app.module.ts               # Root application module
├── main.ts                     # Application entry point
└── dbConfig.ts                 # Database configuration
```

### Design Pattern

**Layered Architecture**:

- **Controllers**: Handle HTTP requests
- **Services**: Business logic
- **Repositories**: Database operations
- **DTOs**: Data validation

## API Endpoints

### Admin APIs (`/api/admin`)

- `GET /concerts` - Get all concerts
- `POST /create-concert` - Create concert
- `DELETE /:id` - Delete concert
- `GET /history` - View transactions
- `GET /totals` - Get statistics

### User APIs (`/api/user`)

- `GET /concerts` - View concerts
- `POST /reserve` - Reserve concert
- `POST /cancel` - Cancel reservation
- `GET /my-concert?username=xxx` - My reservations

## Running Tests

### Run all tests

```bash
npm run test
```

### Run with coverage

```bash
npm run test:cov
```

### Run specific test

```bash
npm test -- admin.controller.spec.ts
npm test -- user.service.spec.ts
```

## Libraries Used

### Core

- `@nestjs/common` - NestJS framework
- `@nestjs/typeorm` - Database ORM
- `mysql2` - MySQL driver

### Validation

- `class-validator` - DTO validation
- `class-transformer` - Data transformation

### Testing

- `jest` - Testing framework
- `@nestjs/testing` - NestJS test utilities

## Database Schema

**Concert Table**:

- id, name, detail, number_of_seats, reserved, created_at

**Transaction Table**:

- id, concert_id, username, action (RESERVE/CANCEL), created_at

## Example Request

```bash
# Create concert
POST http://localhost:4000/api/admin/create-concert
{
  "name": "Summer Festival",
  "detail": "Amazing concert",
  "numberOfSeats": 1000
}

# Reserve concert
POST http://localhost:4000/api/user/reserve
{
  "concertId": 1
}
```
