import { Request, Response } from 'express';
import User from '@/models/User';
import logger from '@/utils/logger';
import bcrypt from 'bcryptjs';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const search = req.query.search as string;
    const skip = (page - 1) * limit;
    
    const query: any = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const [users, total] = await Promise.all([
      User.find(query, '-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);
    res.json({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    logger.error('Error fetching admin users:', error);
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      logger.warn('Attempt to delete non-existent user', { userId: id });
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role === 'admin') {
      logger.warn('Attempt to delete admin user', { userId: id, username: user.username });
      return res.status(403).json({ message: 'Cannot delete admin user' });
    }
    
    await user.deleteOne();
    logger.info('User deleted successfully', { userId: id, username: user.username });
    res.json({ message: 'User deleted' });
  } catch (error) {
    logger.error('Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user', error });
  }
}; 

export const getExternalUsers = async (req: Request, res: Response) => {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    const users = await response.json();
    logger.info('External users fetched successfully', { count: users.length });
    res.json(users);
  } catch (error) {
    logger.error('Error fetching external users:', error);
    res.status(500).json({ message: 'Error fetching external users', error });
  }
}; 

export const createUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role = 'user', isActive = true } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required.' });
    }
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      isActive,
      createdAt: new Date(),
    });
    await user.save();
    res.status(201).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    logger.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user', error });
  }
}; 

export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean.' });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    user.isActive = isActive;
    await user.save();
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    logger.error('Error updating user status:', error);
    res.status(500).json({ message: 'Error updating user status', error });
  }
}; 