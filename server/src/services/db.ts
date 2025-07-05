import mongoose from 'mongoose';
import logger from '../utils/logger';

const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI!);
    
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`MongoDB Connected: ${conn.connection.host}`);
    } else {
      logger.info('MongoDB Connected successfully');
    }
  } catch (error) {
    logger.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB; 