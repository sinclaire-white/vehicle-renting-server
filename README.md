# 🚗 Vehicle Rental System - Backend API

A comprehensive backend API for a vehicle rental management system built with Node.js, TypeScript, Express.js, and PostgreSQL.

## 🌐 Live Deployment

**API Base URL:** https://vehicle-server-two.vercel.app

## ✨ Features

### 🔐 Authentication & Authorization
- User registration with email validation
- Secure JWT-based authentication
- Role-based access control (Admin and Customer roles)
- Password hashing with bcrypt

### 🚗 Vehicle Management
- Create, read, update, and delete vehicles
- Track vehicle availability status
- Manage rental pricing per vehicle
- Support for multiple vehicle types (car, bike, van, SUV)

### 👥 User Management
- User registration and profile management
- View own profile information
- Admin users can view and manage all users
- Update user details and roles

### 📅 Booking System
- Create vehicle bookings with date validation
- Calculate total rental price automatically
- Customer can view own bookings
- Admin can view and manage all bookings
- Cancel bookings (customers can cancel own, admins can cancel any)
- Mark bookings as returned (admin only)
- Auto-return expired bookings (system-level)

### 🔒 Security Features
- JWT token-based authentication
- Password hashing and validation
- Role-based authorization middleware
- Email uniqueness validation
- Input validation on all endpoints

## 🛠️ Technology Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Web Framework:** Express.js (v5.2.1)
- **Database:** PostgreSQL with node-postgres (pg)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Environment Management:** dotenv
- **Development:** tsx, TypeScript, nodemon

## 📦 Project Structure

```
vehicle-server/
├── src/
│   ├── config/
│   │   ├── db.ts              # Database configuration & schema initialization
│   │   └── index.ts           # Configuration loader
│   ├── middleware/
│   │   └── auth.ts            # Authentication & authorization middleware
│   ├── module/
│   │   ├── auth/              # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.route.ts
│   │   │   └── auth.service.ts
│   │   ├── vehicles/          # Vehicles module
│   │   │   ├── vehicles.controller.ts
│   │   │   ├── vehicles.router.ts
│   │   │   └── vehicles.service.ts
│   │   ├── users/             # Users module
│   │   │   ├── user.controller.ts
│   │   │   ├── user.route.ts
│   │   │   └── users.service.ts
│   │   └── bookings/          # Bookings module
│   │       ├── bookings.controller.ts
│   │       ├── bookings.route.ts
│   │       └── bookings.service.ts
│   └── server.ts              # Express app configuration & startup
├── package.json
├── tsconfig.json
└── .env                        # Environment variables
```

## 📋 Database Schema

### Users (customers table)
- `id` - Auto-generated primary key
- `name` - User full name (required)
- `email` - Unique email address (required, lowercase)
- `password` - Hashed password (min 6 characters)
- `phone` - Contact phone number (required)
- `role` - User role ('admin' or 'customer')

### Vehicles
- `id` - Auto-generated primary key
- `vehicle_name` - Vehicle name/model (required)
- `type` - Vehicle type ('car', 'bike', 'van', 'SUV')
- `registration_number` - Unique registration number (required)
- `daily_rent_price` - Daily rental price (required, positive)
- `availability_status` - Status ('available' or 'booked')

### Bookings
- `id` - Auto-generated primary key
- `customer_id` - Foreign key to customers
- `vehicle_id` - Foreign key to vehicles
- `rent_start_date` - Booking start date (required)
- `rent_end_date` - Booking end date (must be after start date)
- `total_price` - Total rental price calculated automatically
- `status` - Booking status ('active', 'cancelled', 'returned')

## 🚀 Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/sinclaire-white/vehicle-renting-server.git
cd vehicle-server
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory with the following variables:
```env
PORT=5000
CONNECTION_STRING=postgresql://username:password@localhost:5432/vehicle_rental_db
JWT_SECRET=your_jwt_secret_key_here
```

4. **Start the development server**
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Authentication (`/api/v1/auth`)
- `POST /signup` - Register new user
- `POST /signin` - Login and receive JWT token

### Vehicles (`/api/v1/vehicles`)
- `GET /` - Get all vehicles (public)
- `GET /:vehicleId` - Get specific vehicle (public)
- `POST /` - Create vehicle (admin only)
- `PUT /:vehicleId` - Update vehicle (admin only)
- `DELETE /:vehicleId` - Delete vehicle (admin only)

### Users (`/api/v1/users`)
- `GET /profile` - Get own profile (authenticated)
- `GET /` - Get all users (admin only)
- `PUT /:userId` - Update user (own or admin)
- `DELETE /:userId` - Delete user (admin only)

### Bookings (`/api/v1/bookings`)
- `POST /` - Create booking (authenticated)
- `GET /` - Get bookings (role-based)
- `PUT /:bookingId` - Update booking status (cancel/return)

## 🔄 Auto-Return System

The system automatically marks bookings as returned when their end date passes:
- Runs every 24 hours
- Executes once on server startup
- Updates vehicle availability status accordingly

## ✅ Testing Recommendations

### 1. Register a user
```bash
POST /api/v1/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "123-456-7890",
  "role": "customer"
}
```

### 2. Login
```bash
POST /api/v1/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### 3. View your profile
```bash
GET /api/v1/users/profile
Authorization: Bearer <your_jwt_token>
```

### 4. Create a vehicle (as admin)
```bash
POST /api/v1/vehicles
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "vehicle_name": "Toyota Camry 2024",
  "type": "car",
  "registration_number": "ABC-123-XYZ",
  "daily_rent_price": 50.00,
  "availability_status": "available"
}
```

### 5. Create a booking
```bash
POST /api/v1/bookings
Authorization: Bearer <your_jwt_token>
Content-Type: application/json

{
  "vehicle_id": 1,
  "rent_start_date": "2025-12-15",
  "rent_end_date": "2025-12-20"
}
```

## 🔒 Authentication Flow

1. User registers via `/api/v1/auth/signup`
2. User logs in via `/api/v1/auth/signin` and receives JWT token
3. Include token in Authorization header: `Bearer <token>`
4. Token is verified and user permissions are checked
5. Request proceeds if authorized, otherwise returns 401/403
.

## 💡 Notes

- All passwords are hashed using bcrypt before storage
- Email addresses are automatically converted to lowercase for consistency
- Database transactions are used for critical operations (bookings, cancellations)
- JWT tokens expire after 24 hours
- All monetary values use DECIMAL type for accuracy


---
