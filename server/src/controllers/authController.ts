import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';
import { CreateUserInput, LoginInput } from '../utils/validation';

const JWT_SECRET = process.env.JWT_SECRET as string;

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, role }: CreateUserInput = req.body;
    
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      logger.warn('Registration attempt with existing username', { username });
      return res.status(409).json({ message: 'Username already exists.' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    
    logger.info('User registered successfully', { username, role });
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (error) {
    logger.error('Error in user registration:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password }: LoginInput = req.body;
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
    
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    logger.info('User logged in successfully', { username, role: user.role });
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    logger.error('Error in user login:', error);
    res.status(500).json({ message: 'Server error', error });
  }
}; 