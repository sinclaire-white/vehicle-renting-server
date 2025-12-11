import bcrypt from 'bcrypt';
import { pool } from '../../config/db';

const getAllUsers = async () => {
  const result = await pool.query('SELECT id, name, email, phone, role, created_at FROM users ORDER BY id');
  return result;
};

const updateUser = async (userId: string, userData: any, requestUserId: number, requestUserRole: string) => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
  
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  if (requestUserRole !== 'admin' && requestUserId !== parseInt(userId)) {
    throw new Error('You can only update your own profile');
  }

  const { name, email, phone, password, role } = userData;

  if (email) {
    const emailLower = email.toLowerCase();
    const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [emailLower, userId]);
    if (existing.rows.length > 0) {
      throw new Error('Email already in use');
    }
  }

  if (role && requestUserRole !== 'admin') {
    throw new Error('Only admins can change user roles');
  }

  let hashedPassword;
  if (password) {
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const updateResult = await pool.query(
    'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), phone = COALESCE($3, phone), password = COALESCE($4, password), role = COALESCE($5, role) WHERE id = $6 RETURNING id, name, email, phone, role',
    [name, email?.toLowerCase(), phone, hashedPassword, role, userId]
  );

  return updateResult;
};

const deleteUser = async (userId: string) => {
  const result = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
  
  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  const activeBookings = await pool.query(
    'SELECT id FROM bookings WHERE customer_id = $1 AND status = $2',
    [userId, 'active']
  );

  if (activeBookings.rows.length > 0) {
    throw new Error('Cannot delete user with active bookings');
  }

  await pool.query('DELETE FROM users WHERE id = $1', [userId]);
};

export const usersService = {
  getAllUsers,
  updateUser,
  deleteUser
};