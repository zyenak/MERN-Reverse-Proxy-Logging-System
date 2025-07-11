import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PaginatedTable } from '@/components/ui/PaginatedTable';
import { 
  Activity, 
  Users, 
  Shield, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/services/apiClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface DashboardStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  activeProxyRules: number;
  totalUsers: number;
  recentActivity: Array<{
    id: string;
    method: string;
    url: string;
    status: number;
    timestamp: string;
    responseTime: number;
  }>;
}

interface UserData {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [proxyStatus, setProxyStatus] = useState<any>(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [activity, setActivity] = useState<any[]>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityLimit, setActivityLimit] = useState(10);
  const [activityTotal, setActivityTotal] = useState(0);
  const [activityLoading, setActivityLoading] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      // Add a test log to verify the interceptor is running
      console.log('About to make API request to /logs/stats');
      console.log('Current token in localStorage:', localStorage.getItem('token') ? 'Present' : 'Missing');
      
      const data = await apiClient.get<DashboardStats>('/logs/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats({
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        activeProxyRules: 0,
        totalUsers: 0,
        recentActivity: []
      });
    }
  };

  const fetchUserData = async () => {
    try {
      const data = await apiClient.get<UserData[]>('/proxy/users');
      setUsers(data);
    } catch (error: any) {
      console.error('Error fetching user data:', error);
      
      // Check if request was blocked by proxy rule
      if (error.response?.status === 403 && error.response?.data?.blocked) {
        toast.error('Request blocked by proxy rule');
        setUsers([]);
      } else {
        toast.error('Failed to fetch user data from external API.');
        setUsers([]);
      }
    }
  };

  const fetchProxyStatus = async () => {
    try {
      const data = await apiClient.get<any>('/proxy/status');
      setProxyStatus(data);
    } catch (error) {
      console.error('Error fetching proxy status:', error);
      setProxyStatus({
        status: 'unknown',
        targetApi: 'https://jsonplaceholder.typicode.com',
        activeRules: 0,
        totalRules: 0
      });
    }
  };

  const fetchRecentActivity = async (page = 1, limit = 10) => {
    setActivityLoading(true);
    try {
      const data = await apiClient.get<any>('/logs/recent', { page, limit });
      setActivity(data.logs);
      setActivityTotal(data.total);
      setActivityPage(data.page);
      setActivityLimit(data.limit);
    } catch (error) {
      setActivity([]);
      setActivityTotal(0);
    } finally {
      setActivityLoading(false);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([
      fetchDashboardStats(),
      fetchProxyStatus()
    ]);
    setLoading(false);
  };

  const simulateExternalRequest = async () => {
    setUsersLoading(true);
    try {
      const data = await apiClient.post<UserData[]>('/proxy/users/simulate');
      setUsers(data);
      toast.success('External request simulated and logged!');
    } catch (error: any) {
      // Check if request was blocked by proxy rule
      if (error.response?.status === 403 && error.response?.data?.blocked) {
        toast.error('Request blocked by proxy rule');
        setUsers([]);
      } else {
        toast.error('Failed to fetch user data from external API.');
        setUsers([]);
      }
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    fetchRecentActivity(activityPage, activityLimit);
  }, [activityPage, activityLimit]);

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800';
    if (status >= 400 && status < 500) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-blue-100 text-blue-800';
      case 'POST': return 'bg-green-100 text-green-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <ErrorBoundary>
        <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <Button onClick={refreshData} variant="outline" className="self-end">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalRequests || 0}</div>
                <p className="text-xs text-muted-foreground">
                  All time requests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalRequests ? Math.round((stats.successfulRequests / stats.totalRequests) * 100) : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.successfulRequests || 0} successful
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(stats?.averageResponseTime || 0)}ms</div>
                <p className="text-xs text-muted-foreground">
                  Average across all requests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{proxyStatus?.activeRules || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Proxy rules enabled
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="flex-1">System Overview</TabsTrigger>
              <TabsTrigger value="users" className="flex-1">Proxied Users</TabsTrigger>
              <TabsTrigger value="activity" className="flex-1">Recent Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Proxy Status</CardTitle>
                    <CardDescription>Current system status and configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Status</span>
                      <Badge variant={proxyStatus?.status === 'active' ? 'default' : 'destructive'}>
                        {proxyStatus?.status || 'Unknown'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Target API</span>
                      <span className="text-sm text-muted-foreground">
                        {proxyStatus?.targetApi || 'Not configured'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Rules</span>
                      <span className="text-sm text-muted-foreground">
                        {proxyStatus?.totalRules || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Failed Requests</span>
                      <span className="text-sm text-muted-foreground">
                        {stats?.failedRequests || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Performance Metrics</CardTitle>
                    <CardDescription>System performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Response Time Trend</span>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((stats?.averageResponseTime || 0) / 1000 * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Success Rate</span>
                        <span className="text-sm font-medium text-green-600">
                          {stats?.totalRequests ? Math.round((stats.successfulRequests / stats.totalRequests) * 100) : 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${stats?.totalRequests ? (stats.successfulRequests / stats.totalRequests) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Proxied User Data</CardTitle>
                  <CardDescription>
                    User data fetched from {proxyStatus?.targetApi || 'target API'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={simulateExternalRequest} variant="outline" className="mb-4">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Simulate External Request
                  </Button>
                  {usersLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <RefreshCw className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    users.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Username</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>City</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.id}</TableCell>
                              <TableCell>{user.name}</TableCell>
                              <TableCell>{user.username}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.company.name}</TableCell>
                              <TableCell>{user.address.city}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No user data available. The proxy service may be offline.
                      </div>
                    )
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest proxy requests and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <PaginatedTable
                    columns={[
                      { header: 'Method', accessor: (log) => <Badge className={getMethodColor(log.method)}>{log.method}</Badge> },
                      { header: 'URL', accessor: (log) => <span className="max-w-xs truncate block">{log.url}</span> },
                      { header: 'Status', accessor: (log) => <Badge className={getStatusColor(log.status)}>{log.status}</Badge> },
                      { header: 'Response Time', accessor: (log) => `${log.responseTime}ms` },
                      { header: 'Timestamp', accessor: (log) => new Date(log.timestamp).toLocaleString() },
                    ]}
                    data={activity}
                    page={activityPage}
                    totalPages={Math.ceil(activityTotal / activityLimit)}
                    onPageChange={setActivityPage}
                    loading={activityLoading}
                    emptyMessage="No recent activity. Start making proxy requests to see activity here."
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        </div>
      </ErrorBoundary>
    </div>
  );
} 