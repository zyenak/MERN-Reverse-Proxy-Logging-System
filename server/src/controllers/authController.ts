import { Request, Response } from 'express';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '@/utils/logger';
import { LoginRequest, RegisterRequest } from '@/types';

// JWT_SECRET will be accessed inside functions after dotenv is loaded

export const register = async (req: Request, res: Response) => {
  try {
    let { username, email, password, role }: RegisterRequest = req.body;
    
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      logger.warn('Registration attempt with existing email', { email });
      return res.status(409).json({ message: 'Email already exists.' });
    }
    
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      logger.warn('Registration attempt with existing username', { username });
      return res.status(409).json({ message: 'Username already exists.' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    // Default to 'user' if role is not provided
    if (!role) role = 'user';
    const user = new User({ username, email, password: hashedPassword, role });
    await user.save();
    
    logger.info('User registered successfully', { username, email, role });
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    logger.error('Error in user registration:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password }: LoginRequest = req.body;
    
    const user = await User.findOne({ username });
    
    if (!user) {
      logger.warn('Login attempt with non-existent username', { username });
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      logger.warn('Login attempt with invalid password', { username });
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    const JWT_SECRET = process.env.JWT_SECRET as string;
    
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    
    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email, role: user.role }, 
      JWT_SECRET, 
      { 
        expiresIn: '1d',
        issuer: 'mern-reverse-proxy'
      }
    );
    
    logger.info('User logged in successfully', { username, email: user.email, role: user.role });
    res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
  } catch (error) {
    logger.error('Error in user login:', error);
    res.status(500).json({ message: 'Server error', error });
  }
}; 