import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Shield, 
  Database, 
  Globe,
  Save,
  RotateCcw
} from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure system settings and preferences
        </p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              General Settings
            </CardTitle>
            <CardDescription>
              Basic system configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="apiUrl">API Base URL</Label>
                <Input
                  id="apiUrl"
                  defaultValue="http://localhost:5000/api"
                  placeholder="Enter API base URL"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeout">Request Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  defaultValue="5000"
                  placeholder="5000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Configure security and authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Rate Limiting</Label>
                <p className="text-sm text-muted-foreground">
                  Limit the number of requests per user
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require HTTPS</Label>
                <p className="text-sm text-muted-foreground">
                  Force HTTPS connections
                </p>
              </div>
              <Switch />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Session Timeout</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically log out inactive users
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Proxy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="h-5 w-5 mr-2" />
              Proxy Settings
            </CardTitle>
            <CardDescription>
              Configure reverse proxy behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="defaultTarget">Default Target URL</Label>
                <Input
                  id="defaultTarget"
                  defaultValue="https://jsonplaceholder.typicode.com"
                  placeholder="https://api.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxRetries">Max Retries</Label>
                <Input
                  id="maxRetries"
                  type="number"
                  defaultValue="3"
                  min="0"
                  max="10"
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Request Logging</Label>
                <p className="text-sm text-muted-foreground">
                  Log all proxy requests to database
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Response Caching</Label>
                <p className="text-sm text-muted-foreground">
                  Cache responses for better performance
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Database Settings
            </CardTitle>
            <CardDescription>
              Configure database connection and logging
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="logRetention">Log Retention (days)</Label>
                <Input
                  id="logRetention"
                  type="number"
                  defaultValue="30"
                  min="1"
                  max="365"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxLogs">Max Logs</Label>
                <Input
                  id="maxLogs"
                  type="number"
                  defaultValue="10000"
                  min="1000"
                  step="1000"
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-cleanup Logs</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically remove old logs
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button>
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 