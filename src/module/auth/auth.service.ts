import bcrypt from "bcryptjs";
import { pool } from "../../config/db";
import config from "../../config";
import jwt from "jsonwebtoken";

// Service to handle user authentication
const signUp = async (
  name: string,
  email: string,
  password: string,
  phone: string,
  role: string = "customer" //   default role is customer
) => {
  // password strength validation
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  // convert email to lowercase for consistency
  const emailLowerCase = email.toLowerCase();
  // check if email already exists
  const existingUser = await pool.query(
    `
    SELECT id FROM customers WHERE email = $1
    `,
    [emailLowerCase]
  );
  if (existingUser.rows.length > 0) {
    throw new Error("Email already in use");
  }
  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  //   insert new user into database
  const result = await pool.query(
    `
    INSERT INTO customers (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role
    `,
    [name, emailLowerCase, hashedPassword, phone, role]
  );

  return result;
};

// Service to handle user sign-in
const signIn = async (email: string, password: string) => {
  const emailLowerCase = email.toLowerCase();
  // get user by email
  const result = await pool.query(
    `
        SELECT * FROM customers WHERE email = $1
        `,
    [emailLowerCase]
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid email or password");
  }

  const user = result.rows[0];

  // compare provided password with stored hashed password
  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw new Error("Invalid email or password");
  }
  // create JWT token
  const token = jwt.sign(
    {
      // include user id and role in the token payload
      id: user.id,
      role: user.role,
    },
    // secret JWT key from config for signing the token
    config.jwtSecret,
    // token validity period
    { expiresIn: "24h" }
  );

  // return token and user info excluding password
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
};

export const authService = {
  signUp,
  signIn,
};
