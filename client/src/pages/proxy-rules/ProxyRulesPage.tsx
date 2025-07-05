import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield,
  Settings,
  RotateCcw,
  CheckCircle,
  XCircle
} from 'lucide-react';
import type { ProxyRule, CreateProxyRuleData } from '@/types';
import proxyService from '@/services/proxyService';
import { toast } from 'sonner';

const ProxyRulesPage: React.FC = () => {
  const [rules, setRules] = useState<ProxyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ProxyRule | null>(null);
  const [formData, setFormData] = useState<CreateProxyRuleData>({
    name: '',
    path: '',
    methods: ['GET'],
    loggingEnabled: true,
    isBlocked: false,
    forwardTarget: '',
    priority: 0,
    enabled: true
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const data = await proxyService.getAllProxyRules();
      setRules(data);
    } catch (error) {
      console.error('Error fetching proxy rules:', error);
      toast.error('Failed to fetch proxy rules');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRule) {
        await proxyService.updateProxyRule({
          id: editingRule._id,
          ...formData
        });
        toast.success('Proxy rule updated successfully');
      } else {
        await proxyService.createProxyRule(formData);
        toast.success('Proxy rule created successfully');
      }
      setIsCreateDialogOpen(false);
      setEditingRule(null);
      resetForm();
      fetchRules();
    } catch (error) {
      console.error('Error saving proxy rule:', error);
      toast.error('Failed to save proxy rule');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this proxy rule?')) {
      try {
        await proxyService.deleteProxyRule(id);
        toast.success('Proxy rule deleted successfully');
        fetchRules();
      } catch (error) {
        console.error('Error deleting proxy rule:', error);
        toast.error('Failed to delete proxy rule');
      }
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all proxy rules to defaults?')) {
      try {
        await proxyService.resetProxyRules();
        toast.success('Proxy rules reset successfully');
        fetchRules();
      } catch (error) {
        console.error('Error resetting proxy rules:', error);
        toast.error('Failed to reset proxy rules');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      path: '',
      methods: ['GET'],
      loggingEnabled: true,
      isBlocked: false,
      forwardTarget: '',
      priority: 0,
      enabled: true
    });
  };

  const openEditDialog = (rule: ProxyRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      path: rule.path,
      methods: rule.methods,
      loggingEnabled: rule.loggingEnabled,
      isBlocked: rule.isBlocked,
      forwardTarget: rule.forwardTarget || '',
      priority: rule.priority,
      enabled: rule.enabled
    });
    setIsCreateDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingRule(null);
    resetForm();
    setIsCreateDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Proxy Rules</h1>
          <p className="text-muted-foreground">
            Manage proxy routing and filtering rules
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRule ? 'Edit Proxy Rule' : 'Create Proxy Rule'}
                </DialogTitle>
                <DialogDescription>
                  Configure proxy routing and filtering rules
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Rule Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter rule name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="path">Path Pattern</Label>
                    <Input
                      id="path"
                      value={formData.path}
                      onChange={(e) => setFormData(prev => ({ ...prev, path: e.target.value }))}
                      placeholder="/api/*"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={formData.priority}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                      min="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="forwardTarget">Forward Target</Label>
                    <Input
                      id="forwardTarget"
                      value={formData.forwardTarget}
                      onChange={(e) => setFormData(prev => ({ ...prev, forwardTarget: e.target.value }))}
                      placeholder="https://api.example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>HTTP Methods</Label>
                  <div className="flex flex-wrap gap-2">
                    {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].map((method) => (
                      <Button
                        key={method}
                        type="button"
                        variant={formData.methods.includes(method) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => {
                          const newMethods = formData.methods.includes(method)
                            ? formData.methods.filter(m => m !== method)
                            : [...formData.methods, method];
                          setFormData(prev => ({ ...prev, methods: newMethods }));
                        }}
                      >
                        {method}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enabled</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable or disable this rule
                      </p>
                    </div>
                    <Switch
                      checked={formData.enabled}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Logging Enabled</Label>
                      <p className="text-sm text-muted-foreground">
                        Log requests that match this rule
                      </p>
                    </div>
                    <Switch
                      checked={formData.loggingEnabled}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, loggingEnabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Block Requests</Label>
                      <p className="text-sm text-muted-foreground">
                        Block requests that match this rule
                      </p>
                    </div>
                    <Switch
                      checked={formData.isBlocked}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isBlocked: checked }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingRule ? 'Update Rule' : 'Create Rule'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rules.map((rule) => (
          <Card key={rule._id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{rule.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                    {rule.enabled ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </div>
              </div>
              <CardDescription className="font-mono text-sm">
                {rule.path}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Methods:</span>
                  <div className="flex gap-1">
                    {rule.methods.map((method) => (
                      <Badge key={method} variant="outline" className="text-xs">
                        {method}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span>Priority:</span>
                  <span className="font-mono">{rule.priority}</span>
                </div>

                {rule.forwardTarget && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Target:</span>
                    <span className="font-mono text-xs truncate max-w-[150px]" title={rule.forwardTarget}>
                      {rule.forwardTarget}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span>Logging:</span>
                  <Badge variant={rule.loggingEnabled ? 'default' : 'secondary'}>
                    {rule.loggingEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Blocking:</span>
                  <Badge variant={rule.isBlocked ? 'destructive' : 'secondary'}>
                    {rule.isBlocked ? 'Blocked' : 'Allowed'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  Updated: {new Date(rule.updatedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(rule)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(rule._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rules.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Proxy Rules</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first proxy rule to start routing requests
            </p>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProxyRulesPage; 