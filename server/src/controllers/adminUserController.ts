import { Request, Response } from 'express';
import User from '../models/User';
import logger from '../utils/logger';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find({}, '-password');
    logger.info('Admin users fetched successfully', { count: users.length });
    res.json(users);
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