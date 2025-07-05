import { Request, Response } from 'express';
import User, { IUser } from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '@/utils/logger';
import { CreateUserInput, LoginInput } from '@/utils/validation';

// JWT_SECRET will be accessed inside functions after dotenv is loaded

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
    console.log('=== LOGIN ATTEMPT START ===');
    console.log('Request body:', { username: req.body.username, password: req.body.password ? '[HIDDEN]' : 'MISSING' });
    
    const { username, password }: LoginInput = req.body;
    console.log('Extracted username:', username);
    
    const user = await User.findOne({ username });
    console.log('User found:', !!user);
    
    if (!user) {
      console.log('User not found, returning 401');
      logger.warn('Login attempt with non-existent username', { username });
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    console.log('Checking password...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('Password mismatch, returning 401');
      logger.warn('Login attempt with invalid password', { username });
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    
    console.log('Creating JWT token...');
    const JWT_SECRET = process.env.JWT_SECRET as string;
    console.log('JWT_SECRET for token creation:', JWT_SECRET ? 'EXISTS' : 'MISSING');
    console.log('JWT_SECRET length:', JWT_SECRET?.length || 0);
    
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '1d' }
    );
    
    console.log('Token created successfully');
    console.log('=== LOGIN ATTEMPT SUCCESS ===');
    
    logger.info('User logged in successfully', { username, role: user.role });
    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    console.log('=== LOGIN ATTEMPT ERROR ===');
    console.log('Error details:', error);
    console.log('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.log('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    logger.error('Error in user login:', error);
    res.status(500).json({ message: 'Server error', error });
  }
}; 