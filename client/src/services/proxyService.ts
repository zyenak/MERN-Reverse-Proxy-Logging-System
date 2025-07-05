import apiService from './api';
import type { ProxyRule, ProxyStatus, CreateProxyRuleData, UpdateProxyRuleData } from '@/types';

export class ProxyService {
  async getProxyStatus(): Promise<ProxyStatus> {
    return apiService.get<ProxyStatus>('/proxy/status');
  }

  async getAllProxyRules(): Promise<ProxyRule[]> {
    return apiService.get<ProxyRule[]>('/proxy-rule');
  }

  async getProxyRuleById(id: string): Promise<ProxyRule> {
    return apiService.get<ProxyRule>(`/proxy-rule/${id}`);
  }

  async createProxyRule(data: CreateProxyRuleData): Promise<ProxyRule> {
    return apiService.post<ProxyRule>('/proxy-rule', data);
  }

  async updateProxyRule(data: UpdateProxyRuleData): Promise<ProxyRule> {
    return apiService.put<ProxyRule>(`/proxy-rule/${data.id}`, data);
  }

  async deleteProxyRule(id: string): Promise<void> {
    return apiService.delete<void>(`/proxy-rule/${id}`);
  }

  async resetProxyRules(): Promise<void> {
    return apiService.post<void>('/proxy-rule/reset');
  }
}

export const proxyService = new ProxyService();
export default proxyService; 