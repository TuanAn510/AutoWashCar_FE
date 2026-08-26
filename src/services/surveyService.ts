import api from '@/api/client';
import type { ApiEnvelope, PaginatedEnvelope, PaginationParams } from '@/types/api';

export type SurveyEventType = 'page_view' | 'click' | 'form_start' | 'form_submit' | 'form_abandon';

export interface SurveyLogPayload {
  eventType: SurveyEventType;
  page: string;
  metadata?: Record<string, unknown>;
  sessionId?: string;
}

export interface SurveyLogEntry {
  _id: string;
  eventType: SurveyEventType;
  page: string;
  metadata?: Record<string, unknown>;
  sessionId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export const surveyService = {
  logEvent: async (payload: SurveyLogPayload) => {
    const response = await api.post<ApiEnvelope<SurveyLogEntry>>('/survey/logs', payload);
    return response.data.data;
  },

  getLogs: async (params?: PaginationParams, signal?: AbortSignal) => {
    const response = await api.get<PaginatedEnvelope<SurveyLogEntry>>('/admin/survey/logs', {
      params,
      signal,
    });
    return {
      logs: response.data.data,
      pagination: response.data.pagination,
      total: response.data.pagination?.total ?? response.data.data.length,
    };
  },
};
