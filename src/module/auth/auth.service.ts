
import bcrypt from "bcryptjs";
import { pool } from "../../config/db";
import config from "../../config";
import jwt from "jsonwebtoken";

const signUp = async (
  name: string,
  email: string,
  password: string,
  phone: string,
  role: string = "customer"
) => {
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const emailLowerCase = email.toLowerCase();

  const existingUser = await pool.query(
    `
    SELECT id FROM customers WHERE email = $1
    `, [emailLowerCase]
  )
  if (existingUser.rows.length > 0){
    throw new Error("Email already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `
    INSERT INTO customers (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role
    `,
    [name, emailLowerCase, hashedPassword, phone, role]
  );
    
    return result;
};

const signIn = async (email:string, password:string) =>{
    const emailLowerCase = email.toLowerCase();

    const result = await pool.query (
        `
        SELECT * FROM customers WHERE email = $1
        `, [emailLowerCase]
    )

    if (result.rows.length === 0
    ){
        throw new Error ("Invalid email or password");
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword){
        throw new Error ("Invalid email or password");
    }

    const token = jwt.sign(
        {
            id:user.id,
            role:user.role,
        },
        config.jwtSecret,

        {expiresIn: '24h'}
    )

    return{
        token,
        user:{
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
        }
    };
};

export const authService = {
    signUp,
    signIn,
}

