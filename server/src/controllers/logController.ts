import { Request, Response } from 'express';
import Log from '@/models/Log';

export const getLogs = async (req: Request, res: Response) => {
  try {
    const { 
      method, 
      url, 
      user, 
      status, 
      from, 
      to, 
      search, 
      isProxied,
      proxyRuleId,
      page = 1, 
      limit = 20 
    } = req.query;
    
    const query: any = {};
    
    if (method) query.method = method;
    if (url) query.url = { $regex: url, $options: 'i' };
    if (user) query.user = user;
    if (status) query.status = status;
    if (isProxied !== undefined) query.isProxied = isProxied === 'true';
    if (proxyRuleId) query.proxyRuleId = proxyRuleId;
    
    if (from || to) query.timestamp = {};
    if (from) query.timestamp.$gte = new Date(from as string);
    if (to) query.timestamp.$lte = new Date(to as string);
    
    if (search) {
      query.$or = [
        { method: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
        { user: { $regex: search, $options: 'i' } },
        { targetUrl: { $regex: search, $options: 'i' } }
      ];
    }
    
    const logs = await Log.find(query)
      .populate('proxyRuleId', 'name path methods')
      .sort({ timestamp: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);
      
    const count = await Log.countDocuments(query);
    
    res.json({ 
      logs, 
      count,
      pagination: {
        page: +page,
        limit: +limit,
        totalPages: Math.ceil(count / +limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching logs', error });
  }
};

export const getLogById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const log = await Log.findById(id).populate('proxyRuleId', 'name path methods');
    
    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }
    
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching log', error });
  }
};

export const deleteLog = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await Log.findByIdAndDelete(id);
    
    if (!result) {
      return res.status(404).json({ message: 'Log not found' });
    }
    
    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting log', error });
  }
};

export const deleteLogs = async (req: Request, res: Response) => {
  try {
    const { from, to, method, isProxied } = req.query;
    const query: any = {};
    
    if (method) query.method = method;
    if (isProxied !== undefined) query.isProxied = isProxied === 'true';
    
    if (from || to) query.timestamp = {};
    if (from) query.timestamp.$gte = new Date(from as string);
    if (to) query.timestamp.$lte = new Date(to as string);
    
    const result = await Log.deleteMany(query);
    
    res.json({ 
      message: `${result.deletedCount} logs deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting logs', error });
  }
};

export const getLogStats = async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query;
    const query: any = {};
    
    if (from || to) query.timestamp = {};
    if (from) query.timestamp.$gte = new Date(from as string);
    if (to) query.timestamp.$lte = new Date(to as string);
    
    const [
      totalLogs,
      proxiedLogs,
      methodStats,
      statusStats,
      avgResponseTime
    ] = await Promise.all([
      Log.countDocuments(query),
      Log.countDocuments({ ...query, isProxied: true }),
      Log.aggregate([
        { $match: query },
        { $group: { _id: '$method', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Log.aggregate([
        { $match: query },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Log.aggregate([
        { $match: query },
        { $group: { _id: null, avgResponseTime: { $avg: '$responseTime' } } }
      ])
    ]);
    
    res.json({
      totalLogs,
      proxiedLogs,
      methodStats,
      statusStats,
      avgResponseTime: avgResponseTime[0]?.avgResponseTime || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching log stats', error });
  }
};
