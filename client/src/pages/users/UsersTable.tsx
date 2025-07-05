import React, { useEffect, useState, useRef } from 'react';
import { PaginatedTable } from '@/components/ui/PaginatedTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Trash2 } from 'lucide-react';
import apiClient from '@/services/apiClient';
import { toast } from 'sonner';

interface User {
    _id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
    isActive: boolean;
    createdAt: string;
    lastLogin?: string;
}

interface UsersTableProps {
    search: string;
}

export default function UsersTable({ search }: UsersTableProps) {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const abortRef = useRef<AbortController | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params: any = { page: page.toString(), limit: limit.toString() };
            if (search) params.search = search;
            const data = await apiClient.get<{ users: User[]; total: number; page: number; limit: number }>('/users', params);
            setUsers(data.users);
            setTotal(data.total);
        } catch (error: any) {
            toast.error('Failed to fetch users');
            setUsers([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setPage(1); // Reset to first page on search change
    }, [search]);

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line
    }, [page, limit, search]);

    const getRoleColor = (role: string) => {
        return role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';
    };
    const getStatusColor = (isActive: boolean) => {
        return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    };

    const toggleUserStatus = async (userId: string, isActive: boolean) => {
        try {
            await apiClient.patch(`/users/${userId}/status`, { isActive });
            toast.success('User status updated successfully');
            fetchUsers();
        } catch (error: any) {
            const backendMsg = error?.response?.data?.message;
            toast.error(backendMsg || error.message || 'Failed to update user status');
        }
    };

    const deleteUser = async (userId: string) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await apiClient.delete(`/users/${userId}`);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    return (
        <PaginatedTable
            columns={[
                { header: 'Status', accessor: (user) => <Switch checked={user.isActive} onCheckedChange={(checked) => toggleUserStatus(user._id, checked)} /> },
                { header: 'Username', accessor: 'username' },
                { header: 'Email', accessor: 'email' },
                { header: 'Role', accessor: (user) => <Badge className={getRoleColor(user.role)}>{user.role}</Badge> },
                { header: 'Created', accessor: (user) => new Date(user.createdAt).toLocaleString() },
                {
                    header: 'Actions', accessor: (user) => <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteUser(user._id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                },
            ]}
            data={users}
            page={page}
            totalPages={Math.max(1, Math.ceil(total / limit))}
            onPageChange={setPage}
            loading={loading}
            emptyMessage="No users found."
        />
    );
} 