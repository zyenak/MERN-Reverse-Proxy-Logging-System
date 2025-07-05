import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Clock, 
  Database, 
  Globe, 
  Shield, 
  TrendingUp,
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import type { LogStats, ProxyStatus } from '@/types';
import logService from '@/services/logService';
import proxyService from '@/services/proxyService';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';
import { SectionCards } from '@/components/section-cards';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<LogStats | null>(null);
  const [proxyStatus, setProxyStatus] = useState<ProxyStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, statusData] = await Promise.all([
          logService.getLogStats(),
          proxyService.getProxyStatus()
        ]);
        setStats(statsData);
        setProxyStatus(statusData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-100 text-green-800';
    if (status >= 300 && status < 400) return 'bg-blue-100 text-blue-800';
    if (status >= 400 && status < 500) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor your reverse proxy system and logs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={proxyStatus?.isActive ? "default" : "secondary"}>
            {proxyStatus?.isActive ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3 mr-1" />
                Inactive
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLogs || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time requests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageResponseTime ? `${stats.averageResponseTime.toFixed(2)}ms` : '0ms'}
            </div>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.statusCodes ? 
                `${Math.round((stats.statusCodes['200'] || 0) / Math.max(stats.totalLogs, 1) * 100)}%` : 
                '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Successful requests
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="status">Status Codes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Request activity over the last 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ChartAreaInteractive />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Request Methods</CardTitle>
                <CardDescription>
                  Distribution by HTTP method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats?.methods && Object.entries(stats.methods).map(([method, count]) => (
                    <div key={method} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{method}</span>
                      <Badge variant="outline">{count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Time Analysis</CardTitle>
              <CardDescription>
                Detailed performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.averageResponseTime ? `${stats.averageResponseTime.toFixed(0)}ms` : '0ms'}
                  </div>
                  <p className="text-sm text-muted-foreground">Average</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats?.totalLogs || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {proxyStatus?.activeRules || 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Active Rules</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status Code Distribution</CardTitle>
              <CardDescription>
                HTTP status codes breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats?.statusCodes && Object.entries(stats.statusCodes).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(parseInt(status))}>
                        {status}
                      </Badge>
                    </div>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage; 