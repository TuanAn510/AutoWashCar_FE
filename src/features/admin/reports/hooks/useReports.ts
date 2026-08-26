import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/queryKeys';
import {
  reportApi,
  type RevenueReportParams,
  type RankedReportParams,
} from '@/services/reportService';

const REPORT_STALE_TIME = 0;
const REPORT_GC_TIME = 30 * 60 * 1000;

export function useReports(
  params: RevenueReportParams & RankedReportParams,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.reports.statistics(params),
    queryFn: ({ signal }) => reportApi.getStatistics(params, signal),
    enabled: options?.enabled,
    staleTime: REPORT_STALE_TIME,
    gcTime: REPORT_GC_TIME,
    refetchOnMount: 'always',
  });
}
