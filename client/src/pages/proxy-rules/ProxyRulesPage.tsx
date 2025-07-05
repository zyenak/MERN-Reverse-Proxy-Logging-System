import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldOff,
  Settings,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/services/apiClient';

interface ProxyRule {
  _id: string;
  name: string;
  path: string;
  methods: string[];
  loggingEnabled: boolean;
  isBlocked: boolean;
  forwardTarget?: string;
  priority: number;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateRuleData {
  name: string;
  path: string;
  methods: string[];
  loggingEnabled: boolean;
  isBlocked: boolean;
  forwardTarget?: string;
  priority: number;
}

export default function ProxyRulesPage() {
  const [rules, setRules] = useState<ProxyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ProxyRule | null>(null);
  const [formData, setFormData] = useState<CreateRuleData>({
    name: '',
    path: '',
    methods: ['GET'],
    loggingEnabled: true,
    isBlocked: false,
    forwardTarget: '',
    priority: 0
  });

  const fetchRules = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<ProxyRule[]>('/proxy-rule');
      setRules(data);
    } catch (error) {
      console.error('Error fetching proxy rules:', error);
      toast.error('Failed to fetch proxy rules');
      // Set empty array on error
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  const createRule = async () => {
    try {
      await apiClient.post('/proxy-rule', formData);
      toast.success('Proxy rule created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchRules();
    } catch (error: any) {
      console.error('Error creating proxy rule:', error);
      toast.error(error.message || 'Failed to create proxy rule');
    }
  };

  const updateRule = async (ruleId: string, updates: Partial<ProxyRule>) => {
    try {
      await apiClient.put(`/proxy-rule/${ruleId}`, updates);
      toast.success('Proxy rule updated successfully');
      fetchRules();
    } catch (error: any) {
      console.error('Error updating proxy rule:', error);
      toast.error(error.message || 'Failed to update proxy rule');
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this proxy rule?')) {
      return;
    }

    try {
      await apiClient.delete(`/proxy-rule/${ruleId}`);
      toast.success('Proxy rule deleted successfully');
      fetchRules();
    } catch (error) {
      console.error('Error deleting proxy rule:', error);
      toast.error('Failed to delete proxy rule');
    }
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    await updateRule(ruleId, { enabled });
  };

  const toggleLogging = async (ruleId: string, loggingEnabled: boolean) => {
    await updateRule(ruleId, { loggingEnabled });
  };

  const toggleBlocking = async (ruleId: string, isBlocked: boolean) => {
    await updateRule(ruleId, { isBlocked });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      path: '',
      methods: ['GET'],
      loggingEnabled: true,
      isBlocked: false,
      forwardTarget: '',
      priority: 0
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
      priority: rule.priority
    });
  };

  const saveEdit = async () => {
    if (!editingRule) return;

    try {
      await apiClient.put(`/proxy-rule/${editingRule._id}`, formData);
      toast.success('Proxy rule updated successfully');
      setEditingRule(null);
      resetForm();
      fetchRules();
    } catch (error: any) {
      console.error('Error updating proxy rule:', error);
      toast.error(error.message || 'Failed to update proxy rule');
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const getRuleStatusIcon = (rule: ProxyRule) => {
    if (!rule.enabled) return <ShieldOff className="h-4 w-4 text-gray-400" />;
    if (rule.isBlocked) return <XCircle className="h-4 w-4 text-red-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const getRuleStatusColor = (rule: ProxyRule) => {
    if (!rule.enabled) return 'bg-gray-100 text-gray-800';
    if (rule.isBlocked) return 'bg-red-100 text-red-800';
    return 'bg-green-100 text-green-800';
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
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Proxy Rule</DialogTitle>
              <DialogDescription>
                Configure a new proxy routing rule
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="mb-2">Rule Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., API Access Rule"
                  />
                </div>
                <div>
                  <Label htmlFor="path" className="mb-2">Path Pattern</Label>
                  <Input
                    id="path"
                    value={formData.path}
                    onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                    placeholder="e.g., /api/*"
                  />
                </div>
              </div>
              
              <div>
                <Label className="mb-2">HTTP Methods</Label>
                <Select
                  value={formData.methods[0]}
                  onValueChange={(value) => setFormData({ ...formData, methods: [value] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem>
                    <SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem>
                    <SelectItem value="DELETE">DELETE</SelectItem>
                    <SelectItem value="PATCH">PATCH</SelectItem>
                    <SelectItem value="HEAD">HEAD</SelectItem>
                    <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="forwardTarget" className="mb-2">Forward Target (Optional)</Label>
                <Input
                  id="forwardTarget"
                  value={formData.forwardTarget}
                  onChange={(e) => setFormData({ ...formData, forwardTarget: e.target.value })}
                  placeholder="e.g., https://api.example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority" className="mb-2">Priority</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="logging" className="mb-2">Enable Logging</Label>
                  <Switch
                    id="logging"
                    checked={formData.loggingEnabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, loggingEnabled: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="blocking" className="mb-2">Block Requests</Label>
                  <Switch
                    id="blocking"
                    checked={formData.isBlocked}
                    onCheckedChange={(checked) => setFormData({ ...formData, isBlocked: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createRule}>Create Rule</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Proxy Rules</CardTitle>
          <CardDescription>
            Manage routing rules and access control policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Methods</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Logging</TableHead>
                <TableHead>Blocking</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRuleStatusIcon(rule)}
                      <Badge className={getRuleStatusColor(rule)}>
                        {rule.enabled ? (rule.isBlocked ? 'Blocked' : 'Active') : 'Disabled'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{rule.path}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {rule.methods.map((method) => (
                        <Badge key={method} variant="outline" className="text-xs">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{rule.priority}</TableCell>
                  <TableCell>
                    <Switch
                      checked={rule.loggingEnabled}
                      onCheckedChange={(checked) => toggleLogging(rule._id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={rule.isBlocked}
                      onCheckedChange={(checked) => toggleBlocking(rule._id, checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(checked) => toggleRule(rule._id, checked)}
                      />
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
                        onClick={() => deleteRule(rule._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingRule} onOpenChange={() => setEditingRule(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Proxy Rule</DialogTitle>
            <DialogDescription>
              Update proxy rule configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name" className="mb-2">Rule Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-path" className="mb-2">Path Pattern</Label>
                <Input
                  id="edit-path"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                />
              </div>
            </div>
            
            <div>
              <Label className="mb-2">HTTP Methods</Label>
              <Select
                value={formData.methods[0]}
                onValueChange={(value) => setFormData({ ...formData, methods: [value] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="HEAD">HEAD</SelectItem>
                  <SelectItem value="OPTIONS">OPTIONS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="edit-forwardTarget" className="mb-2">Forward Target (Optional)</Label>
              <Input
                id="edit-forwardTarget"
                value={formData.forwardTarget}
                onChange={(e) => setFormData({ ...formData, forwardTarget: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-priority" className="mb-2">Priority</Label>
                <Input
                  id="edit-priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-logging" className="mb-2">Enable Logging</Label>
                <Switch
                  id="edit-logging"
                  checked={formData.loggingEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, loggingEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="edit-blocking" className="mb-2">Block Requests</Label>
                <Switch
                  id="edit-blocking"
                  checked={formData.isBlocked}
                  onCheckedChange={(checked) => setFormData({ ...formData, isBlocked: checked })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingRule(null)}>
                Cancel
              </Button>
              <Button onClick={saveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 