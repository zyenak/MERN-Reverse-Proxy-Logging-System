import { Request, Response } from 'express';
import { getUsers, deleteUser, getExternalUsers } from '@/controllers/adminUserController';
import User from '@/models/User';

// Mock dependencies
jest.mock('@/models/User');
jest.mock('@/utils/logger');

const MockedUser = User as jest.Mocked<typeof User>;

// Mock fetch for external users test
global.fetch = jest.fn();

describe('AdminUserController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return all users without passwords', async () => {
      const mockUsers = [
        { _id: '1', username: 'user1', role: 'user' },
        { _id: '2', username: 'user2', role: 'admin' },
      ];

      MockedUser.find.mockResolvedValue(mockUsers as any);

      await getUsers(mockRequest as Request, mockResponse as Response);

      expect(MockedUser.find).toHaveBeenCalledWith({}, '-password');
      expect(mockResponse.json).toHaveBeenCalledWith(mockUsers);
    });

    it('should handle errors when fetching users', async () => {
      MockedUser.find.mockRejectedValue(new Error('Database error'));

      await getUsers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error fetching users',
        error: expect.any(Error),
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete a regular user successfully', async () => {
      const mockUser = {
        _id: 'user-id',
        username: 'testuser',
        role: 'user',
        deleteOne: jest.fn().mockResolvedValue(true),
      };

      mockRequest.params = { id: 'user-id' };
      MockedUser.findById.mockResolvedValue(mockUser as any);

      await deleteUser(mockRequest as Request, mockResponse as Response);

      expect(MockedUser.findById).toHaveBeenCalledWith('user-id');
      expect(mockUser.deleteOne).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User deleted',
      });
    });

    it('should return 404 for non-existent user', async () => {
      mockRequest.params = { id: 'non-existent' };
      MockedUser.findById.mockResolvedValue(null);

      await deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User not found',
      });
    });

    it('should return 403 when trying to delete admin user', async () => {
      const mockUser = {
        _id: 'admin-id',
        username: 'admin',
        role: 'admin',
      };

      mockRequest.params = { id: 'admin-id' };
      MockedUser.findById.mockResolvedValue(mockUser as any);

      await deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Cannot delete admin user',
      });
    });

    it('should handle errors when deleting user', async () => {
      mockRequest.params = { id: 'user-id' };
      MockedUser.findById.mockRejectedValue(new Error('Database error'));

      await deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error deleting user',
        error: expect.any(Error),
      });
    });
  });

  describe('getExternalUsers', () => {
    it('should fetch external users successfully', async () => {
      const mockExternalUsers = [
        { id: 1, name: 'External User 1' },
        { id: 2, name: 'External User 2' },
      ];

      const mockResponse = {
        json: jest.fn().mockResolvedValue(mockExternalUsers),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);
      await getExternalUsers(mockRequest as Request, mockResponse as unknown as Response);

      expect(global.fetch).toHaveBeenCalledWith('https://jsonplaceholder.typicode.com/users');
      expect(mockResponse.json).toHaveBeenCalledWith(mockExternalUsers);
    });

    it('should handle errors when fetching external users', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      await getExternalUsers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error fetching external users',
        error: expect.any(Error),
      });
    });
  });
}); 