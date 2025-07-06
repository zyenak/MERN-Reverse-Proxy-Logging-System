import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Shield, 
  Database, 
  Network, 
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/services/apiClient';

interface SystemSettings {
  proxy: {
    targetApi: string;
    timeout: number;
    maxRetries: number;
    enableCaching: boolean;
    cacheTimeout: number;
  };
  logging: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
    retentionDays: number;
    enableRequestLogging: boolean;
    enableResponseLogging: boolean;
  };
  security: {
    enableRateLimiting: boolean;
    maxRequestsPerMinute: number;
    enableCORS: boolean;
    allowedOrigins: string[];
    enableJWTValidation: boolean;
    sessionTimeout: number;
  };
  performance: {
    enableCompression: boolean;
    enableGzip: boolean;
    maxPayloadSize: number;
    enableKeepAlive: boolean;
    keepAliveTimeout: number;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    proxy: {
      targetApi: 'https://jsonplaceholder.typicode.com',
      timeout: 30000,
      maxRetries: 3,
      enableCaching: false,
      cacheTimeout: 300
    },
    logging: {
      enabled: true,
      level: 'info',
      retentionDays: 30,
      enableRequestLogging: true,
      enableResponseLogging: false
    },
    security: {
      enableRateLimiting: true,
      maxRequestsPerMinute: 100,
      enableCORS: true,
      allowedOrigins: ['http://localhost:5173'],
      enableJWTValidation: true,
      sessionTimeout: 3600
    },
    performance: {
      enableCompression: true,
      enableGzip: true,
      maxPayloadSize: 10485760,
      enableKeepAlive: true,
      keepAliveTimeout: 65000
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<SystemSettings>('/settings');
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to fetch settings');
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      await apiClient.put('/settings', settings);
      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async () => {
    if (!confirm('Are you sure you want to reset all settings to default values?')) {
      return;
    }

    try {
      await apiClient.post('/settings/reset');
      toast.success('Settings reset to defaults');
      fetchSettings();
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error('Failed to reset settings');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = (section: keyof SystemSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <Button onClick={resetSettings} variant="outline">
            Reset to Defaults
          </Button>
          <Button onClick={saveSettings} disabled={true}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="proxy" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="proxy" className="flex items-center gap-2">
            <Network className="h-4 w-4" />
            Proxy
          </TabsTrigger>
          <TabsTrigger value="logging" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Logging
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="proxy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Proxy Configuration</CardTitle>
              <CardDescription>
                Configure reverse proxy settings and target API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="targetApi" className="mb-2">Target API URL</Label>
                <Input
                  id="targetApi"
                  value={settings.proxy.targetApi}
                  onChange={(e) => updateSetting('proxy', 'targetApi', e.target.value)}
                  placeholder="https://api.example.com"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeout" className="mb-2">Request Timeout (ms)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={settings.proxy.timeout}
                    onChange={(e) => updateSetting('proxy', 'timeout', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="maxRetries" className="mb-2">Max Retries</Label>
                  <Input
                    id="maxRetries"
                    type="number"
                    value={settings.proxy.maxRetries}
                    onChange={(e) => updateSetting('proxy', 'maxRetries', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enableCaching" className="mb-2">Enable Response Caching</Label>
                  <Switch
                    id="enableCaching"
                    checked={settings.proxy.enableCaching}
                    onCheckedChange={(checked) => updateSetting('proxy', 'enableCaching', checked)}
                  />
                </div>
                {settings.proxy.enableCaching && (
                  <div>
                    <Label htmlFor="cacheTimeout" className="mb-2">Cache Timeout (seconds)</Label>
                    <Input
                      id="cacheTimeout"
                      type="number"
                      value={settings.proxy.cacheTimeout}
                      onChange={(e) => updateSetting('proxy', 'cacheTimeout', parseInt(e.target.value))}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logging Configuration</CardTitle>
              <CardDescription>
                Configure logging levels and retention policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="loggingEnabled" className="mb-2">Enable Logging</Label>
                <Switch
                  id="loggingEnabled"
                  checked={settings.logging.enabled}
                  onCheckedChange={(checked) => updateSetting('logging', 'enabled', checked)}
                />
              </div>

              {settings.logging.enabled && (
                <>
                  <div>
                    <Label htmlFor="logLevel" className="mb-2">Log Level</Label>
                    <Select
                      value={settings.logging.level}
                      onValueChange={(value: 'debug' | 'info' | 'warn' | 'error') => 
                        updateSetting('logging', 'level', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debug">Debug</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="retentionDays" className="mb-2">Log Retention (days)</Label>
                    <Input
                      id="retentionDays"
                      type="number"
                      value={settings.logging.retentionDays}
                      onChange={(e) => updateSetting('logging', 'retentionDays', parseInt(e.target.value))}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requestLogging" className="mb-2">Log Request Details</Label>
                      <Switch
                        id="requestLogging"
                        checked={settings.logging.enableRequestLogging}
                        onCheckedChange={(checked) => updateSetting('logging', 'enableRequestLogging', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="responseLogging" className="mb-2">Log Response Details</Label>
                      <Switch
                        id="responseLogging"
                        checked={settings.logging.enableResponseLogging}
                        onCheckedChange={(checked) => updateSetting('logging', 'enableResponseLogging', checked)}
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure security policies and access controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="rateLimiting" className="mb-2">Enable Rate Limiting</Label>
                <Switch
                  id="rateLimiting"
                  checked={settings.security.enableRateLimiting}
                  onCheckedChange={(checked) => updateSetting('security', 'enableRateLimiting', checked)}
                />
              </div>

              {settings.security.enableRateLimiting && (
                <div>
                  <Label htmlFor="maxRequests" className="mb-2">Max Requests per Minute</Label>
                  <Input
                    id="maxRequests"
                    type="number"
                    value={settings.security.maxRequestsPerMinute}
                    onChange={(e) => updateSetting('security', 'maxRequestsPerMinute', parseInt(e.target.value))}
                  />
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <Label htmlFor="cors" className="mb-2">Enable CORS</Label>
                <Switch
                  id="cors"
                  checked={settings.security.enableCORS}
                  onCheckedChange={(checked) => updateSetting('security', 'enableCORS', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="jwtValidation" className="mb-2">Enable JWT Validation</Label>
                <Switch
                  id="jwtValidation"
                  checked={settings.security.enableJWTValidation}
                  onCheckedChange={(checked) => updateSetting('security', 'enableJWTValidation', checked)}
                />
              </div>

              <div>
                <Label htmlFor="sessionTimeout" className="mb-2">Session Timeout (seconds)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
              <CardDescription>
                Optimize system performance and resource usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="compression" className="mb-2">Enable Compression</Label>
                <Switch
                  id="compression"
                  checked={settings.performance.enableCompression}
                  onCheckedChange={(checked) => updateSetting('performance', 'enableCompression', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="gzip" className="mb-2">Enable Gzip</Label>
                <Switch
                  id="gzip"
                  checked={settings.performance.enableGzip}
                  onCheckedChange={(checked) => updateSetting('performance', 'enableGzip', checked)}
                />
              </div>

              <div>
                <Label htmlFor="maxPayload" className="mb-2">Max Payload Size (bytes)</Label>
                <Input
                  id="maxPayload"
                  type="number"
                  value={settings.performance.maxPayloadSize}
                  onChange={(e) => updateSetting('performance', 'maxPayloadSize', parseInt(e.target.value))}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <Label htmlFor="keepAlive" className="mb-2">Enable Keep-Alive</Label>
                <Switch
                  id="keepAlive"
                  checked={settings.performance.enableKeepAlive}
                  onCheckedChange={(checked) => updateSetting('performance', 'enableKeepAlive', checked)}
                />
              </div>

              {settings.performance.enableKeepAlive && (
                <div>
                  <Label htmlFor="keepAliveTimeout" className="mb-2">Keep-Alive Timeout (ms)</Label>
                  <Input
                    id="keepAliveTimeout"
                    type="number"
                    value={settings.performance.keepAliveTimeout}
                    onChange={(e) => updateSetting('performance', 'keepAliveTimeout', parseInt(e.target.value))}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current system health and status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Proxy Service</div>
                <div className="text-sm text-muted-foreground">Running</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Database</div>
                <div className="text-sm text-muted-foreground">Connected</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium">Authentication</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 