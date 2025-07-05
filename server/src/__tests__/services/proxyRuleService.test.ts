import mongoose from 'mongoose';
import { ProxyRuleService } from '@/services/proxyRuleService';
import ProxyRule from '@/models/ProxyRule';

// Mock the ProxyRule model
jest.mock('@/models/ProxyRule');
const MockedProxyRule = ProxyRule as jest.Mocked<typeof ProxyRule>;

describe('ProxyRuleService', () => {
  let service: ProxyRuleService;

  beforeEach(() => {
    service = ProxyRuleService.getInstance();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await mongoose.connection.close();
  });

  describe('getOrCreateProxyRule', () => {
    it('should return existing rule if found', async () => {
      const mockRule = {
        _id: 'test-id',
        enabled: true,
        whitelist: ['/api'],
        save: jest.fn(),
      };

      MockedProxyRule.findOne.mockResolvedValue(mockRule as any);

      const result = await service.getOrCreateProxyRule();

      expect(MockedProxyRule.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockRule);
    });

    it('should create new rule if none exists', async () => {
      const mockRule = {
        _id: 'test-id',
        enabled: true,
        whitelist: [],
        save: jest.fn(),
      };

      MockedProxyRule.findOne.mockResolvedValue(null);
      MockedProxyRule.create.mockResolvedValue(mockRule as any);

      const result = await service.getOrCreateProxyRule();

      expect(MockedProxyRule.findOne).toHaveBeenCalledTimes(1);
      expect(MockedProxyRule.create).toHaveBeenCalledWith({
        enabled: true,
        whitelist: [],
      });
      expect(result).toEqual(mockRule);
    });

    it('should handle errors gracefully', async () => {
      MockedProxyRule.findOne.mockRejectedValue(new Error('Database error'));

      await expect(service.getOrCreateProxyRule()).rejects.toThrow('Database error');
    });
  });

  describe('updateProxyRule', () => {
    it('should update existing rule', async () => {
      const mockRule = {
        _id: 'test-id',
        enabled: true,
        whitelist: ['/api'],
        save: jest.fn(),
      };

      MockedProxyRule.findOne.mockResolvedValue(mockRule as any);

      const updates = { enabled: false, whitelist: ['/api/v2'] };
      const result = await service.updateProxyRule(updates);

      expect(mockRule.save).toHaveBeenCalled();
      expect(result.enabled).toBe(false);
      expect(result.whitelist).toEqual(['/api/v2']);
    });

    it('should create new rule if none exists', async () => {
      const mockRule = {
        _id: 'test-id',
        enabled: false,
        whitelist: ['/api/v2'],
        save: jest.fn(),
      };

      MockedProxyRule.findOne.mockResolvedValue(null);
      MockedProxyRule.create.mockResolvedValue(mockRule as any);

      const updates = { enabled: false, whitelist: ['/api/v2'] };
      const result = await service.updateProxyRule(updates);

      expect(MockedProxyRule.create).toHaveBeenCalledWith({
        ...updates,
        enabled: updates.enabled !== undefined ? updates.enabled : true,
        whitelist: updates.whitelist !== undefined ? updates.whitelist : [],
      });
      expect(result).toEqual(mockRule);
    });
  });

  describe('resetProxyRule', () => {
    it('should delete all rules and create new default rule', async () => {
      const mockRule = {
        _id: 'test-id',
        enabled: true,
        whitelist: [],
        save: jest.fn(),
      };

      MockedProxyRule.deleteMany.mockResolvedValue({} as any);
      MockedProxyRule.create.mockResolvedValue(mockRule as any);

      const result = await service.resetProxyRule();

      expect(MockedProxyRule.deleteMany).toHaveBeenCalledWith({});
      expect(MockedProxyRule.create).toHaveBeenCalledWith({
        enabled: true,
        whitelist: [],
      });
      expect(result).toEqual(mockRule);
    });
  });

  describe('isRequestAllowed', () => {
    it('should return false if proxy is disabled', async () => {
      const mockRule = {
        enabled: false,
        whitelist: ['/api'],
      };

      jest.spyOn(service, 'getOrCreateProxyRule').mockResolvedValue(mockRule as any);

      const result = await service.isRequestAllowed('/api/test');

      expect(result).toBe(false);
    });

    it('should return true if whitelist is empty', async () => {
      const mockRule = {
        enabled: true,
        whitelist: [],
      };

      jest.spyOn(service, 'getOrCreateProxyRule').mockResolvedValue(mockRule as any);

      const result = await service.isRequestAllowed('/api/test');

      expect(result).toBe(true);
    });

    it('should return true if URL matches whitelist', async () => {
      const mockRule = {
        enabled: true,
        whitelist: ['/api', '/admin'],
      };

      jest.spyOn(service, 'getOrCreateProxyRule').mockResolvedValue(mockRule as any);

      const result = await service.isRequestAllowed('/api/test');

      expect(result).toBe(true);
    });

    it('should return false if URL does not match whitelist', async () => {
      const mockRule = {
        enabled: true,
        whitelist: ['/api', '/admin'],
      };

      jest.spyOn(service, 'getOrCreateProxyRule').mockResolvedValue(mockRule as any);

      const result = await service.isRequestAllowed('/other/test');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      jest.spyOn(service, 'getOrCreateProxyRule').mockRejectedValue(new Error('Test error'));

      const result = await service.isRequestAllowed('/api/test');

      expect(result).toBe(false);
    });
  });
}); 