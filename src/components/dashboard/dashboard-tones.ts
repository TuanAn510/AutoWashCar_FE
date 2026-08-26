export const dashboardTones = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'purple',
  'orange',
  'emerald',
  'blue',
  'pink',
  'indigo',
  'teal',
  'cyan',
] as const;
export type DashboardTone = (typeof dashboardTones)[number];

export const dashboardCardColors: DashboardTone[] = [
  'emerald',
  'blue',
  'purple',
  'orange',
  'pink',
  'cyan',
  'indigo',
  'teal',
];

export const dashboardToneClasses: Record<DashboardTone, string> = {
  primary: 'border-primary/20 bg-primary/5 text-primary',
  secondary: 'border-slate-200 bg-slate-100 text-slate-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-rose-200 bg-rose-50 text-rose-700',
  info: 'border-sky-200 bg-sky-50 text-sky-700',
  purple: 'border-purple-200 bg-purple-50 text-purple-700',
  orange: 'border-orange-200 bg-orange-50 text-orange-700',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  pink: 'border-pink-200 bg-pink-50 text-pink-700',
  indigo: 'border-indigo-200 bg-indigo-50 text-indigo-700',
  teal: 'border-teal-200 bg-teal-50 text-teal-700',
  cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
};

export function getDashboardTone(key: string | number): DashboardTone {
  const source = String(key);
  let hash = 0;
  for (let index = 0; index < source.length; index += 1)
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  return dashboardCardColors[hash % dashboardCardColors.length];
}
