import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw } from 'lucide-react';
import apiClient from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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

export default function UserDashboardPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);

  const simulateExternalRequest = async () => {
    setLoading(true);
    try {
      const data = await apiClient.post<UserData[]>('/proxy/users/simulate');
      setUsers(data);
      toast.success('External request simulated and logged!');
    } catch (error) {
      setUsers([]);
      toast.error('Failed to fetch user data from external API.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <Card>
          <CardHeader>
            <CardTitle>Proxied User Data</CardTitle>
            <CardDescription>
              User data fetched from the proxied API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={simulateExternalRequest} variant="outline" className="mb-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Simulate External Request
            </Button>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-8 w-8 animate-spin" />
              </div>
            ) : users.length > 0 ? (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 