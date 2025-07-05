import { Request, Response } from 'express';
import Log from '@/models/Log';

export const getLogs = async (req: Request, res: Response) => {
  try {
    const { 
      method, 
      status, 
      date,
      search, 
      page = 1, 
      limit = 10 
    } = req.query;
    
    const query: any = {};
    
    if (method) query.method = method;
    if (status) query.status = parseInt(status as string);
    
    // Handle date filtering
    if (date) {
      const now = new Date();
      switch (date) {
        case 'today':
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          query.timestamp = { $gte: today };
          break;
        case 'yesterday':
          const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
          const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          query.timestamp = { $gte: yesterday, $lt: todayStart };
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          query.timestamp = { $gte: weekAgo };
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          query.timestamp = { $gte: monthAgo };
          break;
      }
    }
    
    if (search) {
      query.$or = [
        { method: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
        { user: { $regex: search, $options: 'i' } }
      ];
    }
    
    const logs = await Log.find(query)
      .populate('proxyRuleId', 'name path methods')
      .sort({ timestamp: -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);
      
    const total = await Log.countDocuments(query);
    
    res.json({ 
      logs, 
      total,
      page: +page,
      limit: +limit,
      totalPages: Math.ceil(total / +limit)
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
    const result = await Log.deleteMany({});
    
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
    const [
      totalRequests,
      successfulRequests,
      failedRequests,
      avgResponseTime,
      recentActivity
    ] = await Promise.all([
      Log.countDocuments({ isProxied: true }),
      Log.countDocuments({ isProxied: true, status: { $gte: 200, $lt: 300 } }),
      Log.countDocuments({ isProxied: true, status: { $gte: 400 } }),
      Log.aggregate([
        { $match: { isProxied: true } },
        { $group: { _id: null, avgResponseTime: { $avg: '$responseTime' } } }
      ]),
      Log.find({ isProxied: true })
        .sort({ timestamp: -1 })
        .limit(10)
        .select('method url status timestamp responseTime')
    ]);
    
    res.json({
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime: avgResponseTime[0]?.avgResponseTime || 0,
      activeProxyRules: 0, // Will be updated when proxy rules are implemented
      totalUsers: 0, // Will be updated when user management is implemented
      recentActivity: recentActivity.map((log) => ({
        id: log._id?.toString() || '',
        method: log.method,
        url: log.url,
        status: log.status,
        timestamp: log.timestamp.toISOString(),
        responseTime: log.responseTime
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching log stats', error });
  }
};

export const exportLogs = async (req: Request, res: Response) => {
  try {
    const logs = await Log.find({ isProxied: true })
      .populate('proxyRuleId', 'name path methods')
      .sort({ timestamp: -1 });

    const exportData = logs.map(log => ({
      id: log._id,
      method: log.method,
      url: log.url,
      timestamp: log.timestamp,
      status: log.status,
      user: log.user,
      responseTime: log.responseTime,
      targetUrl: log.targetUrl,
      isProxied: log.isProxied,
      proxyRule: log.proxyRuleId,
      meta: log.meta
    }));

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=logs-${new Date().toISOString().split('T')[0]}.json`);
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting logs', error });
  }
};

export const getRecentLogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const limit = parseInt((req.query.limit as string) || '10', 10);
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      Log.find({ isProxied: true })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .select('method url status timestamp responseTime'),
      Log.countDocuments({ isProxied: true })
    ]);
    res.json({
      logs: logs.map((log) => ({
        id: log._id?.toString() || '',
        method: log.method,
        url: log.url,
        status: log.status,
        timestamp: log.timestamp.toISOString(),
        responseTime: log.responseTime
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching recent logs', error });
  }
};
