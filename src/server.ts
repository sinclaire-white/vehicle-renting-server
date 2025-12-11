import express, { Request, Response } from 'express'
import authRoute from './module/auth/auth.route';
import { vehiclesRoute } from './module/vehicles/vehicles.router';
import { usersRoute } from './module/users/user.route';
import { bookingsRoute } from './module/bookings/bookings.route';
import { pool } from './config/db';


const app = express();

// parser
app.use(express.json());

app.get('/', (req: Request, res: Response) =>{
    res.status(200).json({
        message: "Welcome to the Vehicle Server"
    })
})

app.use('/api/v1/auth', authRoute);
app.use('/api/v1/vehicles', vehiclesRoute);
app.use('/api/v1/users', usersRoute);
app.use('/api/v1/bookings', bookingsRoute);


// Auto-return expired bookings
const autoReturnExpiredBookings = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const expiredBookings = await pool.query(
      'SELECT id, vehicle_id FROM bookings WHERE status = $1 AND rent_end_date < $2',
      ['active', today]
    );

    for (const booking of expiredBookings.rows) {
      await pool.query('BEGIN');
      
      try {
        await pool.query('UPDATE bookings SET status = $1 WHERE id = $2', ['returned', booking.id]);
        await pool.query('UPDATE vehicles SET availability_status = $1 WHERE id = $2', ['available', booking.vehicle_id]);
        await pool.query('COMMIT');
        console.log(`Auto-returned booking ${booking.id}`);
      } catch (error) {
        await pool.query('ROLLBACK');
        console.error(`Failed to auto-return booking ${booking.id}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in auto-return process:', error);
  }
};

// Run auto-return every 24 hours
setInterval(autoReturnExpiredBookings, 24 * 60 * 60 * 1000);

// Run once on startup
autoReturnExpiredBookings();

app.listen(5000, ()=>{
    console.log("Server is running on port 5000");
})