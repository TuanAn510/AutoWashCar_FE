export const APPOINTMENT_SYNC_INTERVAL = 3_000;

export const liveAppointmentQueryOptions = {
  staleTime: 0,
  refetchInterval: APPOINTMENT_SYNC_INTERVAL,
  refetchIntervalInBackground: false,
  refetchOnMount: 'always',
  refetchOnWindowFocus: true,
  refetchOnReconnect: true,
} as const;
