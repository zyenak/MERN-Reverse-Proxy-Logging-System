import { Request, Response } from 'express';
import { getProxyRule, updateProxyRule, resetProxyRule } from '@/controllers/proxyRuleController';
import proxyRuleService from '@/services/proxyRuleService';

// Mock dependencies
jest.mock('@/services/proxyRuleService');
jest.mock('@/utils/logger');

const MockedProxyRuleService = proxyRuleService as jest.Mocked<typeof proxyRuleService>;

describe('ProxyRuleController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('getProxyRule', () => {
    it('should return proxy rule successfully', async () => {
      const mockRule = {
        _id: 'rule-id',
        enabled: true,
        whitelist: ['/api'],
      };

      MockedProxyRuleService.getOrCreateProxyRule.mockResolvedValue(mockRule as any);

      await getProxyRule(mockRequest as Request, mockResponse as Response);

      expect(MockedProxyRuleService.getOrCreateProxyRule).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockRule);
    });

    it('should handle errors when fetching proxy rule', async () => {
      MockedProxyRuleService.getOrCreateProxyRule.mockRejectedValue(new Error('Service error'));

      await getProxyRule(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error fetching proxy rule',
        error: expect.any(Error),
      });
    });
  });

  describe('updateProxyRule', () => {
    it('should update proxy rule successfully', async () => {
      const updates = {
        enabled: false,
        whitelist: ['/api/v2'],
      };

      const mockRule = {
        _id: 'rule-id',
        enabled: false,
        whitelist: ['/api/v2'],
      };

      mockRequest.body = updates;
      MockedProxyRuleService.updateProxyRule.mockResolvedValue(mockRule as any);

      await updateProxyRule(mockRequest as Request, mockResponse as Response);

      expect(MockedProxyRuleService.updateProxyRule).toHaveBeenCalledWith(updates);
      expect(mockResponse.json).toHaveBeenCalledWith(mockRule);
    });

    it('should handle errors when updating proxy rule', async () => {
      const updates = { enabled: false };
      mockRequest.body = updates;
      MockedProxyRuleService.updateProxyRule.mockRejectedValue(new Error('Service error'));

      await updateProxyRule(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error updating proxy rule',
        error: expect.any(Error),
      });
    });
  });

  describe('resetProxyRule', () => {
    it('should reset proxy rule successfully', async () => {
      const mockRule = {
        _id: 'rule-id',
        enabled: true,
        whitelist: [],
      };

      MockedProxyRuleService.resetProxyRule.mockResolvedValue(mockRule as any);

      await resetProxyRule(mockRequest as Request, mockResponse as Response);

      expect(MockedProxyRuleService.resetProxyRule).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockRule);
    });

    it('should handle errors when resetting proxy rule', async () => {
      MockedProxyRuleService.resetProxyRule.mockRejectedValue(new Error('Service error'));

      await resetProxyRule(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error resetting proxy rule',
        error: expect.any(Error),
      });
    });
  });
}); 