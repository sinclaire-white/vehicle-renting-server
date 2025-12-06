import { Pool } from "pg";
import config from "./index";

// configure the database connection pool
export const pool = new Pool({
  connectionString: `${config.connectionString}`,
});

// Data Schema

const initDB = async () => {
  await pool.query(`
            CREATE TABLE IF NOT EXISTS customers (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password TEXT NOT NULL,
                phone VARCHAR(20) NOT NULL,
                 role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'customer')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        `);

  await pool.query(`
        CREATE TABLE IF NOT EXISTS vehicles (
            id SERIAL PRIMARY KEY,
            vehicle_name VARCHAR(255) NOT NULL,
            type VARCHAR(20) NOT NULL CHECK (type IN ('car', 'bike', 'van', 'SUV')),
            registration_number VARCHAR(50) NOT NULL UNIQUE,
            daily_rent_price DECIMAL(10, 2) NOT NULL CHECK (daily_rent_price > 0),
            availability_status VARCHAR(20) NOT NULL CHECK (availability_status IN ('available', 'booked')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        `);

    await pool.query(`
        CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
            vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
            rent_start_date DATE NOT NULL,
            rent_end_date DATE NOT NULL,
      `);
};

export default initDB;
