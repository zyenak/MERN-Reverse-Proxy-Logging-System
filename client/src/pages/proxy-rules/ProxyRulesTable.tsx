import React, { useEffect, useState, useRef } from 'react';
import { PaginatedTable } from '@/components/ui/PaginatedTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Edit, 
  Trash2, 
  Shield, 
  ShieldOff,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/services/apiClient';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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

interface ProxyRulesTableProps {
  search: string;
  isCreateDialogOpen: boolean;
  onCreateDialogChange: (open: boolean) => void;
}

export default function ProxyRulesTable({ search, isCreateDialogOpen, onCreateDialogChange }: ProxyRulesTableProps) {
  const [rules, setRules] = useState<ProxyRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
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
  const abortRef = useRef<AbortController | null>(null);

  const fetchRules = async () => {
    setLoading(true);
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    
    try {
      const params = {
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
      };
      const data = await apiClient.get('/proxy-rule', params, { signal: controller.signal });
      
      console.log('API Response:', data); // Debug log
      
      // Handle both old format (array) and new format (object with rules and total)
      if (Array.isArray(data)) {
        // Old format - direct array
        console.log('Using old format (array)');
        setRules(data);
        setTotal(data.length);
      } else if (data && typeof data === 'object' && 'rules' in data && Array.isArray((data as any).rules)) {
        // New format - object with rules and total
        console.log('Using new format (object with rules)');
        const responseData = data as { rules: ProxyRule[]; total?: number };
        setRules(responseData.rules);
        setTotal(responseData.total || responseData.rules.length);
      } else {
        // Unexpected format
        console.error('Unexpected API response format:', data);
        setRules([]);
        setTotal(0);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error fetching proxy rules:', error);
        
        // Handle network errors more gracefully
        if (!error.response) {
          console.warn('Network error detected - this might be due to server not being ready');
          // Don't show toast for network errors on initial load if we have no data yet
          if (rules.length > 0) {
            toast.error('Network error. Please check your connection.');
          }
        } else {
          toast.error('Failed to fetch proxy rules');
        }
        
        setRules([]);
        setTotal(0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1); // Reset to first page on search change
  }, [search]);

  useEffect(() => {
    // Add a small delay for initial load to give server time to start
    const timer = setTimeout(() => {
      fetchRules();
    }, 100);
    
    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line
  }, [page, limit, search]);

  const createRule = async () => {
    try {
      // Prepare the request data, mapping client fields to server fields
      const requestData = {
        name: formData.name.trim(),
        pattern: formData.path.trim(), // Map 'path' to 'pattern'
        forwardTarget: formData.forwardTarget?.trim() || undefined,
        isBlocking: formData.isBlocked, // Map 'isBlocked' to 'isBlocking'
        priority: formData.priority
      };
      
      await apiClient.post('/proxy-rule', requestData);
      toast.success('Proxy rule created successfully');
      onCreateDialogChange(false);
      resetForm();
      fetchRules();
    } catch (error: any) {
      console.error('Error creating proxy rule:', error);
      toast.error(error.message || 'Failed to create proxy rule');
    }
  };

  const updateRule = async (ruleId: string, updates: Partial<ProxyRule>) => {
    try {
      // Map client field names to server field names
      const serverUpdates: any = {};
      
      if ('name' in updates) serverUpdates.name = updates.name;
      if ('path' in updates) serverUpdates.pattern = updates.path; // Map 'path' to 'pattern'
      if ('forwardTarget' in updates) serverUpdates.forwardTarget = updates.forwardTarget;
      if ('isBlocked' in updates) serverUpdates.isBlocking = updates.isBlocked; // Map 'isBlocked' to 'isBlocking'
      if ('priority' in updates) serverUpdates.priority = updates.priority;
      if ('enabled' in updates) serverUpdates.isEnabled = updates.enabled; // Map 'enabled' to 'isEnabled'
      if ('loggingEnabled' in updates) serverUpdates.loggingEnabled = updates.loggingEnabled; // Direct mapping
      
      await apiClient.put(`/proxy-rule/${ruleId}`, serverUpdates);
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

  const toggleLogging = async (ruleId: string, loggingEnabled: boolean) => {
    await updateRule(ruleId, { loggingEnabled });
  };

  const toggleBlocking = async (ruleId: string, isBlocked: boolean) => {
    await updateRule(ruleId, { isBlocked }); // Use client field name, updateRule will map it
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
      // Prepare the request data, mapping client fields to server fields
      const requestData = {
        name: formData.name,
        pattern: formData.path, // Map 'path' to 'pattern'
        forwardTarget: formData.forwardTarget?.trim() || undefined,
        isBlocking: formData.isBlocked, // Map 'isBlocked' to 'isBlocking'
        priority: formData.priority
      };
      
      await apiClient.put(`/proxy-rule/${editingRule._id}`, requestData);
      toast.success('Proxy rule updated successfully');
      setEditingRule(null);
      resetForm();
      fetchRules();
    } catch (error: any) {
      console.error('Error updating proxy rule:', error);
      toast.error(error.message || 'Failed to update proxy rule');
    }
  };

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

  const renderActions = (rule: ProxyRule) => (
    <div className="flex items-center gap-2">
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
  );

  return (
    <>
      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={onCreateDialogChange}>
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
              <Button variant="outline" onClick={() => onCreateDialogChange(false)}>
                Cancel
              </Button>
              <Button onClick={createRule}>Create Rule</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

      {/* Paginated Table */}
      <ErrorBoundary>
        <PaginatedTable
        columns={[
          { 
            header: 'Status', 
            accessor: (rule) => (
              <div className="flex items-center gap-2">
                {getRuleStatusIcon(rule)}
                <Badge className={getRuleStatusColor(rule)}>
                  {rule.enabled ? (rule.isBlocked ? 'Blocked' : 'Active') : 'Disabled'}
                </Badge>
              </div>
            )
          },
          { header: 'Name', accessor: (rule) => <span className="font-medium">{rule.name}</span> },
          { header: 'Path', accessor: (rule) => <span className="max-w-xs truncate block">{rule.path}</span> },
          { 
            header: 'Methods', 
            accessor: (rule) => (
              <div className="flex gap-1">
                {rule.methods.map((method) => (
                  <Badge key={method} variant="outline" className="text-xs">
                    {method}
                  </Badge>
                ))}
              </div>
            )
          },
          { header: 'Priority', accessor: 'priority' },
          { 
            header: 'Logging', 
            accessor: (rule) => (
              <Switch
                checked={rule.loggingEnabled}
                onCheckedChange={(checked) => toggleLogging(rule._id, checked)}
              />
            )
          },
          { 
            header: 'Blocking', 
            accessor: (rule) => (
              <Switch
                checked={rule.isBlocked}
                onCheckedChange={(checked) => toggleBlocking(rule._id, checked)}
              />
            )
          },
          { header: 'Actions', accessor: renderActions },
        ]}
        data={rules || []}
        page={page}
        totalPages={Math.ceil(total / limit)}
        onPageChange={setPage}
        loading={loading}
        emptyMessage="No proxy rules found."
      />
      </ErrorBoundary>
    </>
  );
} 