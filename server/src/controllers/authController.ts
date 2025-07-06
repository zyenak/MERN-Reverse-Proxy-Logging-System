import { Request, Response } from 'express';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '@/utils/logger';
import { LoginRequest, RegisterRequest } from '@/types';

// JWT_SECRET will be accessed inside functions after dotenv is loaded

export const register = async (req: Request, res: Response) => {
  try {
    let { email, password, role }: RegisterRequest = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn('Registration attempt with existing email', { email });
      return res.status(409).json({ message: 'Email already exists.' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    // Default to 'user' if role is not provided
    if (!role) role = 'user';
    const user = new User({ email, password: hashedPassword, role });
    await user.save();
    
    logger.info('User registered successfully', { email, role });
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    logger.error('Error in user registration:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequest = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      logger.warn('Login attempt with non-existent email', { email });
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      logger.warn('Login attempt with invalid password', { email });
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    const JWT_SECRET = process.env.JWT_SECRET as string;
    
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, 
      JWT_SECRET, 
      { 
        expiresIn: '1d',
        issuer: 'mern-reverse-proxy'
      }
    );
    
    logger.info('User logged in successfully', { email, role: user.role });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    logger.error('Error in user login:', error);
    res.status(500).json({ message: 'Server error', error });
  }
}; 