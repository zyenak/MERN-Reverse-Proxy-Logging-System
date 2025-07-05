import { Request, Response } from 'express';
import Log from '@/models/Log';

export const getLogs = async (req: Request, res: Response) => {
  try {
    const { method, url, user, status, from, to, search, page = 1, limit = 20 } = req.query;
    const query: any = {};
    if (method) query.method = method;
    if (url) query.url = { $regex: url, $options: 'i' };
    if (user) query.user = user;
    if (status) query.status = status;
    if (from || to) query.timestamp = {};
    if (from) query.timestamp.$gte = new Date(from as string);
    if (to) query.timestamp.$lte = new Date(to as string);
    if (search) {
      query.$or = [
        { method: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
        { user: { $regex: search, $options: 'i' } }
      ];
    }
    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);
    const count = await Log.countDocuments(query);
    res.json({ logs, count });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error });
  }
};

export const deleteLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Log.findByIdAndDelete(id);
    res.json({ message: 'Log deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting log', error });
  }
};
