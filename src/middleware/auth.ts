import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET;
// Define the shape of the decoded token interface
interface DecodedToken extends JwtPayload {
  id: number;
  role: string;
}
// Middleware to authenticate and authorize users
export const authenticate = (req: any, res: Response, next: NextFunction) => {
  try {
    // Check if JWT_SECRET is defined
    if (!JWT_SECRET) {
      return res.status(500).json({ error: "JWT_SECRET is not configured" });
    }
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    // If no token is provided, return 401
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }
    // Extract token from header
    const token = authHeader?.substring(7);
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    // Verify token and decode
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as DecodedToken;
    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    // Attach user info to request object
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
// Authorization middleware to check user roles
export const authorize = (...roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    // Check if user is authenticated and has the required role
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
// If user's role is not in the allowed roles, return 403
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
// If authorized, proceed to the next middleware or route handler
    next();
  };
};
